import { getTaobaoSyncConfig, sleepWithJitter } from './config.ts';
import { TaobaoMcpClient } from './mcp-client.ts';
import { runOcrFromImageUrl } from './ocr.ts';
import {
  applyOcrProcessFallback,
  detectTaobaoRiskSignals,
  evaluateTaobaoArrivalEligibility,
  extractFirstElementIndex,
  extractShopProductsFromContent,
  filterStructuredProductsForShop,
  normalizeComparisonText,
  normalizeTaobaoProductIdentity,
  parseBeanCandidateFromSources,
  parsePriceAmount,
  shouldSkipTrackedShopListingProduct,
  shouldSkipExistingProduct,
} from './parsers.ts';
import { TaobaoSyncRepository } from './repository.ts';
import type {
  TaobaoBrowseHistoryItem,
  ParsedBeanCandidate,
  TaobaoBinding,
  TaobaoPublishStatus,
  TaobaoRiskSignal,
  TaobaoSearchProduct,
  TaobaoStructuredProduct,
  TaobaoSyncResult,
  TaobaoSyncSummary,
} from './types.ts';
import { runVisionBeanFallback } from './vision.ts';

class TaobaoRiskAbortError extends Error {
  signals: TaobaoRiskSignal[];

  constructor(message: string, signals: TaobaoRiskSignal[]) {
    super(message);
    this.name = 'TaobaoRiskAbortError';
    this.signals = signals;
  }
}

function isRiskAbortError(error: unknown): error is TaobaoRiskAbortError {
  return error instanceof TaobaoRiskAbortError;
}

function confidenceToAliasScore(confidence: ParsedBeanCandidate['confidence']) {
  if (confidence === 'high') return 0.95;
  if (confidence === 'medium') return 0.78;
  return 0.45;
}

export function toPublishStatus(candidate: ParsedBeanCandidate): TaobaoPublishStatus {
  const blockingWarnings = new Set(['bean_name_missing', 'display_name_fallback']);
  if (candidate.confidence === 'low') return 'DRAFT';
  if (candidate.parseWarnings.some((warning) => blockingWarnings.has(warning))) return 'DRAFT';
  if (candidate.conflicts?.some((conflict) => conflict.severity === 'blocking')) return 'DRAFT';
  return 'ACTIVE';
}

function mergeTexts(parts: Array<string | null | undefined>) {
  return parts.filter((part): part is string => typeof part === 'string' && part.trim().length > 0).join('\n');
}

function productIdentityKey(product: TaobaoStructuredProduct) {
  return product.sourceItemId ? `${product.sourceItemId}:${product.sourceSkuId ?? ''}` : normalizeComparisonText(product.title);
}

function productTitleKey(product: Pick<TaobaoStructuredProduct, 'title'>) {
  return normalizeComparisonText(product.title);
}

function mergeSupplementalProduct(
  existing: TaobaoStructuredProduct,
  supplemental: TaobaoStructuredProduct
): TaobaoStructuredProduct {
  return {
    ...existing,
    productUrl: existing.productUrl ?? supplemental.productUrl,
    imageUrl: existing.imageUrl ?? supplemental.imageUrl,
    priceAmount: existing.priceAmount ?? supplemental.priceAmount,
    sourceItemId: existing.sourceItemId ?? supplemental.sourceItemId,
    sourceSkuId: existing.sourceSkuId ?? supplemental.sourceSkuId,
  };
}

export function mergeVisibleProductsWithSearchProducts(args: {
  binding: TaobaoBinding;
  visibleProducts: TaobaoStructuredProduct[];
  searchProducts: TaobaoSearchProduct[];
}) {
  const merged = new Map<string, TaobaoStructuredProduct>();
  const titleKeys = new Set<string>();
  for (const product of args.visibleProducts) {
    merged.set(productIdentityKey(product), product);
    titleKeys.add(productTitleKey(product));
  }

  const supplemental = filterStructuredProductsForShop(args.binding, args.searchProducts, args.searchProducts.length);
  for (const product of supplemental) {
    const key = productIdentityKey(product);
    const titleKey = productTitleKey(product);
    const existingByKey = merged.get(key);
    if (existingByKey) {
      merged.set(key, mergeSupplementalProduct(existingByKey, product));
      continue;
    }

    const existingEntry = [...merged.entries()].find(([, item]) => productTitleKey(item) === titleKey);
    if (existingEntry) {
      const [existingKey, existingProduct] = existingEntry;
      merged.set(existingKey, mergeSupplementalProduct(existingProduct, product));
      continue;
    }

    merged.set(key, product);
    titleKeys.add(titleKey);
  }

  return [...merged.values()];
}

const SYNC_LISTING_TAB_LABELS = ['全部宝贝', '所有宝贝', '在售', '宝贝'];
const SYNC_MAX_LISTING_ITEMS = 80;
const SYNC_MAX_SCROLL_ROUNDS = 6;
const SYNC_NO_GROWTH_LIMIT = 2;
const SYNC_SCROLL_AMOUNT = 720;
const SYNC_SNAPSHOT_RETRY_LIMIT = 2;

async function safeClosePage(client: TaobaoMcpClient) {
  try {
    await client.closePage();
  } catch {
    // ignore cleanup failures
  }
}

function ensureSafePage(inputs: Array<string | null | undefined>) {
  const signals = detectTaobaoRiskSignals(inputs);
  if (signals.length > 0) {
    throw new TaobaoRiskAbortError(`Taobao risk signal detected: ${signals.map((signal) => signal.reason).join(', ')}`, signals);
  }
}

function snapshotLooksReady(read: { title: string; content: string }, scan: { dom: string; totalElements: number }) {
  const contentLength = read.content.trim().length;
  const domLength = scan.dom.trim().length;
  return contentLength > 0 || scan.totalElements > 1 || domLength > '[0] <div />'.length;
}

async function readShopSnapshot(args: {
  client: TaobaoMcpClient;
  pageReadMaxLength: number;
  delayMinMs: number;
  delayMaxMs: number;
}) {
  let latestRead = await args.client.readPageContent({ maxLength: args.pageReadMaxLength });
  let latestScan = await args.client.scanPageElements();
  ensureSafePage([latestRead.title, latestRead.content, latestScan.dom]);

  for (let attempt = 0; attempt < SYNC_SNAPSHOT_RETRY_LIMIT; attempt += 1) {
    if (snapshotLooksReady(latestRead, latestScan)) {
      return { read: latestRead, scan: latestScan };
    }

    await sleepWithJitter(args);
    latestRead = await args.client.readPageContent({ maxLength: args.pageReadMaxLength });
    latestScan = await args.client.scanPageElements();
    ensureSafePage([latestRead.title, latestRead.content, latestScan.dom]);
  }

  return { read: latestRead, scan: latestScan };
}

function buildClickKeywordsFromTitle(title: string) {
  const cleaned = title
    .replace(/【[^】]+】/g, ' ')
    .replace(/白鲸咖啡/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  const code = cleaned.match(/\b[A-Z]\d{2,3}\b/i)?.[0] ?? '';
  const phraseTokens = cleaned
    .split(/[\/\s]+/)
    .map((token) => token.trim())
    .filter(Boolean)
    .filter((token) => token.length >= 2)
    .filter((token) => !['精品', '意式', '手冲', '咖啡豆', '水洗', '日晒', '厌氧', '拼配', '深烘', '浅烘'].includes(token));

  return [
    title.trim(),
    cleaned,
    code && phraseTokens[0] ? `${code} ${phraseTokens[0]}` : '',
    phraseTokens[0] ?? '',
    phraseTokens[0] && phraseTokens[1] ? `${phraseTokens[0]} ${phraseTokens[1]}` : '',
    code,
  ].filter((value, index, array) => Boolean(value) && array.indexOf(value) === index);
}

function matchesBrowseHistoryItem(productTitle: string, historyItem: TaobaoBrowseHistoryItem) {
  const historyTitle = normalizeComparisonText(historyItem.title ?? '');
  const productKey = normalizeComparisonText(productTitle);
  if (!historyTitle || !productKey) return false;
  return historyTitle === productKey || historyTitle.includes(productKey) || productKey.includes(historyTitle);
}

function mergeBrowseHistoryIntoProduct(product: TaobaoStructuredProduct, historyItem: TaobaoBrowseHistoryItem) {
  const identity = normalizeTaobaoProductIdentity(historyItem.url ?? null);
  return {
    ...product,
    productUrl: identity?.canonicalProductUrl ?? historyItem.url ?? product.productUrl,
    imageUrl: historyItem.imageUrl?.trim() || product.imageUrl,
    priceAmount: parsePriceAmount(historyItem.discountedPrice ?? historyItem.originalPrice ?? null) ?? product.priceAmount,
    sourceItemId: historyItem.itemId?.trim() || identity?.itemId || product.sourceItemId,
    sourceSkuId: identity?.skuId ?? product.sourceSkuId,
  } satisfies TaobaoStructuredProduct;
}

async function openShopListingPage(args: {
  client: TaobaoMcpClient;
  binding: TaobaoBinding;
  pageReadMaxLength: number;
  delayMinMs: number;
  delayMaxMs: number;
}) {
  const { client, binding, pageReadMaxLength } = args;

  await client.navigateToUrl(binding.canonicalShopUrl);
  await sleepWithJitter(args);

  const initialSnapshot = await readShopSnapshot({
    client,
    pageReadMaxLength,
    delayMinMs: args.delayMinMs,
    delayMaxMs: args.delayMaxMs,
  });
  const initialRead = initialSnapshot.read;
  const initialScan = initialSnapshot.scan;

  const listingTabIndex = extractFirstElementIndex(initialScan.dom, SYNC_LISTING_TAB_LABELS);
  if (listingTabIndex !== null) {
    await client.clickElement({ index: listingTabIndex });
    await sleepWithJitter(args);
  }

  const firstSnapshot = await readShopSnapshot({
    client,
    pageReadMaxLength,
    delayMinMs: args.delayMinMs,
    delayMaxMs: args.delayMaxMs,
  });
  const firstRead = firstSnapshot.read;
  ensureSafePage([firstRead.title, firstRead.content]);
  return firstRead;
}

async function collectShopProducts(args: {
  client: TaobaoMcpClient;
  binding: TaobaoBinding;
  maxItemsPerShop: number;
  pageReadMaxLength: number;
  delayMinMs: number;
  delayMaxMs: number;
}) {
  const { client, binding, pageReadMaxLength } = args;
  const productMap = new Map<string, TaobaoStructuredProduct>();
  const contentParts: string[] = [];
  let noGrowthRounds = 0;

  await openShopListingPage(args);

  for (let round = 0; round <= SYNC_MAX_SCROLL_ROUNDS; round += 1) {
    if (round > 0) {
      await client.scrollPage({ direction: 'down', amount: SYNC_SCROLL_AMOUNT });
      await sleepWithJitter(args);
    }

    const read = await client.readPageContent({ maxLength: pageReadMaxLength });
    ensureSafePage([read.title, read.content]);
    contentParts.push(read.content);

    const products = extractShopProductsFromContent(read.content, SYNC_MAX_LISTING_ITEMS, binding);
    let newCount = 0;
    for (const product of products) {
      const key = normalizeComparisonText(product.title);
      if (!key || productMap.has(key)) continue;
      productMap.set(key, product);
      newCount += 1;
      if (productMap.size >= SYNC_MAX_LISTING_ITEMS) break;
    }

    if (productMap.size >= SYNC_MAX_LISTING_ITEMS) break;
    if (newCount === 0) {
      noGrowthRounds += 1;
    } else {
      noGrowthRounds = 0;
    }
    if (noGrowthRounds >= SYNC_NO_GROWTH_LIMIT) break;
  }

  const visibleProducts = [...productMap.values()];
  if (binding.searchKeyword) {
    const searchResult = await client.searchProducts(binding.searchKeyword).catch(() => null);
    if (searchResult?.products?.length) {
      const fallbackProducts = mergeVisibleProductsWithSearchProducts({
        binding,
        visibleProducts,
        searchProducts: searchResult.products,
      });
      return {
        visibleTitles: fallbackProducts.map((product) => product.title),
        visibleProducts: fallbackProducts,
        shopText: mergeTexts([mergeTexts(contentParts), fallbackProducts.map((product) => product.title).join('\n')]),
      };
    }
  }

  return {
    visibleTitles: visibleProducts.map((product) => product.title),
    visibleProducts,
    shopText: mergeTexts(contentParts),
  };
}

async function enrichProductFromShopInteraction(args: {
  client: TaobaoMcpClient;
  binding: TaobaoBinding;
  product: TaobaoStructuredProduct;
  config: ReturnType<typeof getTaobaoSyncConfig>;
}) {
  if (args.product.productUrl && args.product.imageUrl && args.product.priceAmount !== null) {
    return { product: args.product, detailClickUsed: false };
  }

  const beforeHistory = await args.client.getBrowseHistory('product').catch(() => ({ type: 'product', count: 0, items: [] }));
  const latestBeforeOpenTime = Math.max(0, ...beforeHistory.items.map((item) => item.openTime ?? 0));

  let enrichedProduct = args.product;
  let matchedHistoryItem: TaobaoBrowseHistoryItem | null = null;

  for (const keyword of buildClickKeywordsFromTitle(args.product.title)) {
    try {
      await args.client.clickElement({ text: keyword });
    } catch {
      continue;
    }

    await sleepWithJitter(args.config);

    const history = await args.client.getBrowseHistory('product').catch(() => ({ type: 'product', count: 0, items: [] }));
    matchedHistoryItem =
      history.items.find((item) => (item.openTime ?? 0) > latestBeforeOpenTime && matchesBrowseHistoryItem(args.product.title, item)) ??
      (latestBeforeOpenTime === 0 ? history.items.find((item) => matchesBrowseHistoryItem(args.product.title, item)) ?? null : null);

    if (matchedHistoryItem) {
      enrichedProduct = mergeBrowseHistoryIntoProduct(args.product, matchedHistoryItem);
      break;
    }
  }

  await openShopListingPage({
    client: args.client,
    binding: args.binding,
    pageReadMaxLength: args.config.pageReadMaxLength,
    delayMinMs: args.config.delayMinMs,
    delayMaxMs: args.config.delayMaxMs,
  });

  return {
    product: enrichedProduct,
    detailClickUsed: matchedHistoryItem !== null,
  };
}

async function syncSingleProduct(args: {
  client: TaobaoMcpClient;
  repository: TaobaoSyncRepository;
  importJobId: string;
  binding: TaobaoBinding;
  product: TaobaoStructuredProduct;
  parsedCandidate: ParsedBeanCandidate;
  summary: TaobaoSyncSummary;
  config: ReturnType<typeof getTaobaoSyncConfig>;
}) {
  const { repository, importJobId, binding, summary, config } = args;

  const enrichment = await enrichProductFromShopInteraction({
    client: args.client,
    binding,
    product: args.product,
    config,
  });
  const product = enrichment.product;

  let existing =
    product.sourceItemId !== null
      ? await repository.findExistingRoasterBeanBySourceIdentity(binding.sourceId, product.sourceItemId, product.sourceSkuId)
      : null;
  if (!existing) {
    existing = await repository.findRoasterBeanByDisplayName(binding.roasterId, product.title);
  }

  if (
    shouldSkipExistingProduct(existing, product) &&
    existing?.sourceItemId === product.sourceItemId &&
    (existing.sourceSkuId ?? null) === product.sourceSkuId
  ) {
    summary.skippedRows += 1;
    await repository.recordEvent({
      importJobId,
      sourceId: binding.sourceId,
      entityType: 'ROASTER_BEAN',
      entityId: existing.id,
      action: 'SKIP',
      payload: {
        roasterId: binding.roasterId,
        sourceId: binding.sourceId,
        sourceItemId: product.sourceItemId,
        sourceSkuId: product.sourceSkuId,
        displayName: product.title,
        priceAmount: product.priceAmount,
        reason: 'identity_and_price_unchanged',
      },
    });
    return;
  }

  let ocrText = '';
  let visionCandidate = null;
  let candidate = args.parsedCandidate;

  const needsOcrEnrichment = candidate.confidence === 'low' || candidate.processMethod === null;

  if (product.imageUrl && needsOcrEnrichment) {
    const ocr = await runOcrFromImageUrl(product.imageUrl);
    ocrText = ocr.text;
    if (candidate.confidence === 'low') {
      candidate = parseBeanCandidateFromSources({
        displayName: product.title,
        titleText: product.title,
        pageText: product.listingText ?? '',
        ocrText,
      });
    } else {
      candidate = applyOcrProcessFallback(candidate, ocrText);
    }
    candidate.parseWarnings = [...new Set([...candidate.parseWarnings, ...ocr.warnings])];
  }

  if (product.imageUrl && candidate.confidence === 'low') {
    try {
      visionCandidate = await runVisionBeanFallback({
        config,
        imageUrl: product.imageUrl,
        title: product.title,
        ocrText,
      });
      if (visionCandidate) {
        candidate = parseBeanCandidateFromSources({
          displayName: product.title,
          titleText: product.title,
          pageText: product.listingText ?? '',
          ocrText,
          visionCandidate,
        });
      } else if (config.visionBaseUrl) {
        candidate.parseWarnings = [...new Set([...candidate.parseWarnings, 'vision_not_used'])];
      }
    } catch (error) {
      candidate.parseWarnings = [
        ...new Set([
          ...candidate.parseWarnings,
          `vision_failed:${error instanceof Error ? error.message : String(error)}`,
        ]),
      ];
    }
  }

  const beanResult = await repository.findOrCreateBean(candidate);
  if (beanResult.created) {
    summary.insertedBeans += 1;
    await repository.recordEvent({
      importJobId,
      sourceId: binding.sourceId,
      entityType: 'BEAN',
      entityId: beanResult.bean.id,
      action: 'INSERT',
      payload: {
        canonicalName: beanResult.bean.canonical_name,
        roasterId: binding.roasterId,
        parseSource: candidate.parseSource,
      },
    });
  }

  if (normalizeComparisonText(product.title) !== normalizeComparisonText(beanResult.bean.canonical_name) || candidate.confidence === 'low') {
    const aliasResult = await repository.upsertBeanAlias({
      beanId: beanResult.bean.id,
      alias: product.title,
      sourceId: binding.sourceId,
      confidence: confidenceToAliasScore(candidate.confidence),
    });
    if (aliasResult) {
      await repository.recordEvent({
        importJobId,
        sourceId: binding.sourceId,
        entityType: 'ALIAS',
        entityId: aliasResult.aliasId,
        action: aliasResult.action === 'inserted' ? 'INSERT' : 'UPDATE',
        payload: {
          beanId: beanResult.bean.id,
          alias: product.title,
          confidence: confidenceToAliasScore(candidate.confidence),
        },
      });
    }
  }

  const status = toPublishStatus(candidate);
  if (status === 'DRAFT') {
    summary.draftRows += 1;
  }

  const persisted = await repository.persistRoasterBean({
    binding,
    product,
    candidate,
    beanId: beanResult.bean.id,
    status,
    existing,
  });

  if (persisted.action === 'inserted') {
    summary.insertedRoasterBeans += 1;
  }
  if (persisted.action === 'updated') {
    summary.updatedRoasterBeans += 1;
  }

  await repository.recordEvent({
    importJobId,
    sourceId: binding.sourceId,
    entityType: 'ROASTER_BEAN',
    entityId: persisted.roasterBeanId,
    action: persisted.action === 'inserted' ? 'INSERT' : 'UPSERT',
        payload: {
          ...persisted.output,
          rawTitle: product.title,
          matchedShop: binding.canonicalShopName,
          parseSource: candidate.parseSource,
          parseWarnings: candidate.parseWarnings,
          detailClickUsed: enrichment.detailClickUsed,
          listingTextUsed: Boolean(product.listingText),
          ocrUsed: ocrText.length > 0,
          visionUsed: Boolean(visionCandidate),
        },
  });
}

async function syncSingleShop(args: {
  client: TaobaoMcpClient;
  repository: TaobaoSyncRepository;
  importJobId: string;
  binding: TaobaoBinding;
  summary: TaobaoSyncSummary;
  config: ReturnType<typeof getTaobaoSyncConfig>;
}) {
  const { client, repository, importJobId, binding, summary, config } = args;

  const trackedProducts = await repository.listTrackedRoasterBeansForBinding(binding);
  const { visibleProducts } = await collectShopProducts({
    client,
    binding,
    maxItemsPerShop: config.maxItemsPerShop,
    pageReadMaxLength: config.pageReadMaxLength,
    delayMinMs: config.delayMinMs,
    delayMaxMs: config.delayMaxMs,
  });

  const pendingProducts: Array<{ product: TaobaoStructuredProduct; parsedCandidate: ParsedBeanCandidate }> = [];

  for (const product of visibleProducts) {
    summary.processedRows += 1;

    try {
      if (shouldSkipTrackedShopListingProduct(trackedProducts, product)) {
        summary.skippedRows += 1;
        await repository.recordEvent({
          importJobId,
          sourceId: binding.sourceId,
          entityType: 'ROASTER_BEAN',
          action: 'SKIP',
          payload: {
            roasterId: binding.roasterId,
            sourceId: binding.sourceId,
            displayName: product.title,
            reason: 'already_tracked_in_shop_listing',
          },
        });
        continue;
      }

      const eligibility = evaluateTaobaoArrivalEligibility({
        displayName: product.title,
        titleText: product.title,
        pageText: product.listingText ?? '',
      });

      if (!eligibility.shouldImport) {
        summary.skippedRows += 1;
        await repository.recordEvent({
          importJobId,
          sourceId: binding.sourceId,
          entityType: 'ROASTER_BEAN',
          action: 'SKIP',
          payload: {
            roasterId: binding.roasterId,
            sourceId: binding.sourceId,
            sourceItemId: product.sourceItemId,
            sourceSkuId: product.sourceSkuId,
            displayName: product.title,
            priceAmount: product.priceAmount,
            reason: eligibility.reason,
            eligibilityWarnings: eligibility.warnings,
            parseSource: eligibility.candidate.parseSource,
            parseWarnings: eligibility.candidate.parseWarnings,
          },
        });
        continue;
      }

      pendingProducts.push({
        product,
        parsedCandidate: eligibility.candidate,
      });
    } catch (error) {
      summary.errorRows += 1;
      if (isRiskAbortError(error)) {
        throw error;
      }

      await repository.recordEvent({
        importJobId,
        sourceId: binding.sourceId,
        entityType: 'ROASTER_BEAN',
        action: 'ERROR',
        payload: {
          roasterId: binding.roasterId,
          sourceItemId: product.sourceItemId,
          sourceSkuId: product.sourceSkuId,
          displayName: product.title,
        },
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const limitedProducts = pendingProducts.slice(0, config.maxItemsPerShop);
  for (const skipped of pendingProducts.slice(config.maxItemsPerShop)) {
    summary.skippedRows += 1;
    await repository.recordEvent({
      importJobId,
      sourceId: binding.sourceId,
      entityType: 'ROASTER_BEAN',
      action: 'SKIP',
      payload: {
        roasterId: binding.roasterId,
        sourceId: binding.sourceId,
        displayName: skipped.product.title,
        reason: 'new_candidate_limit_reached',
      },
    });
  }

  if (limitedProducts.length > 0) {
    await openShopListingPage({
      client,
      binding,
      pageReadMaxLength: config.pageReadMaxLength,
      delayMinMs: config.delayMinMs,
      delayMaxMs: config.delayMaxMs,
    });
  }

  for (const pending of limitedProducts) {
    try {
      await syncSingleProduct({
        client,
        repository,
        importJobId,
        binding,
        product: pending.product,
        parsedCandidate: pending.parsedCandidate,
        summary,
        config,
      });
    } catch (error) {
      summary.errorRows += 1;
      if (isRiskAbortError(error)) {
        throw error;
      }

      await repository.recordEvent({
        importJobId,
        sourceId: binding.sourceId,
        entityType: 'ROASTER_BEAN',
        action: 'ERROR',
        payload: {
          roasterId: binding.roasterId,
          sourceItemId: pending.product.sourceItemId,
          sourceSkuId: pending.product.sourceSkuId,
          displayName: pending.product.title,
        },
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }
  }

  await repository.touchBinding(binding.id);
}

export async function runTaobaoNewArrivalsSync() {
  const config = getTaobaoSyncConfig();
  const repository = new TaobaoSyncRepository();
  const client = new TaobaoMcpClient(config.mcpUrl);
  const bindings = await repository.listActiveBindings();

  return runTaobaoBindingsSync({
    bindings,
    repository,
    client,
    config,
    fileName: 'sync-taobao-new-arrivals',
  });
}

export async function runTaobaoSingleBindingSync(args: { binding: TaobaoBinding }) {
  const config = getTaobaoSyncConfig();
  const repository = new TaobaoSyncRepository();
  const client = new TaobaoMcpClient(config.mcpUrl);

  return runTaobaoBindingsSync({
    bindings: [args.binding],
    repository,
    client,
    config,
    fileName: `sync-taobao-single-shop:${args.binding.id}`,
  });
}

async function runTaobaoBindingsSync(args: {
  bindings: TaobaoBinding[];
  repository: TaobaoSyncRepository;
  client: TaobaoMcpClient;
  config: ReturnType<typeof getTaobaoSyncConfig>;
  fileName: string;
}) {
  const { bindings, repository, client, config } = args;

  const importJobId = await repository.createImportJob({
    fileName: args.fileName,
    summary: {
      plannedShops: bindings.length,
      antiBotMode: 'desktop_mcp_only',
      maxItemsPerShop: config.maxItemsPerShop,
      maxShopRetries: config.maxShopRetries,
    },
  });

  const summary: TaobaoSyncSummary = {
    processedShops: 0,
    failedShops: 0,
    processedRows: 0,
    skippedRows: 0,
    errorRows: 0,
    insertedBeans: 0,
    insertedRoasterBeans: 0,
    updatedRoasterBeans: 0,
    draftRows: 0,
  };

  let abortedByRisk = false;

  try {
    for (const binding of bindings) {
      let success = false;
      for (let attempt = 0; attempt <= config.maxShopRetries; attempt += 1) {
        try {
          await syncSingleShop({ client, repository, importJobId, binding, summary, config });
          summary.processedShops += 1;
          success = true;
          break;
        } catch (error) {
          await safeClosePage(client);

          if (isRiskAbortError(error)) {
            abortedByRisk = true;
            summary.failedShops += 1;
            await repository.recordEvent({
              importJobId,
              sourceId: binding.sourceId,
              entityType: 'ROASTER',
              entityId: binding.roasterId,
              action: 'ERROR',
              payload: {
                roasterId: binding.roasterId,
                canonicalShopName: binding.canonicalShopName,
                signals: error.signals,
              },
              errorMessage: error.message,
            });
            throw error;
          }

          if (attempt >= config.maxShopRetries) {
            summary.failedShops += 1;
            await repository.recordEvent({
              importJobId,
              sourceId: binding.sourceId,
              entityType: 'ROASTER',
              entityId: binding.roasterId,
              action: 'ERROR',
              payload: {
                roasterId: binding.roasterId,
                canonicalShopName: binding.canonicalShopName,
                attempt: attempt + 1,
              },
              errorMessage: error instanceof Error ? error.message : String(error),
            });
          } else {
            await sleepWithJitter(config);
          }
        }
      }

      await safeClosePage(client);
      if (abortedByRisk) break;
      if (!success) {
        await sleepWithJitter(config);
        continue;
      }
      await sleepWithJitter(config);
    }
  } finally {
    await safeClosePage(client);
  }

  const status = abortedByRisk
    ? summary.processedShops > 0
      ? 'PARTIAL'
      : 'FAILED'
    : summary.failedShops > 0
      ? 'PARTIAL'
      : 'SUCCEEDED';

  await repository.finishImportJob({
    importJobId,
    status,
    rowCount: summary.processedRows,
    errorCount: summary.errorRows + summary.failedShops,
    summary: {
      ...summary,
      abortedByRisk,
      maxItemsPerShop: config.maxItemsPerShop,
      maxShopRetries: config.maxShopRetries,
    },
  });

  return {
    importJobId,
    status,
    ...summary,
  } satisfies TaobaoSyncResult;
}
