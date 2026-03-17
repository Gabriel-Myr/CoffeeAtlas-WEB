import 'dotenv/config';

import { TaobaoMcpClient } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/mcp-client.ts';
import { getTaobaoSyncConfig, sleepWithJitter } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/config.ts';
import {
  detectTaobaoRiskSignals,
  evaluateTaobaoArrivalEligibility,
  extractFirstElementIndex,
  extractShopProductsFromContent,
  normalizeComparisonText,
  normalizeTaobaoProductIdentity,
  parsePriceAmount,
  shouldSkipTrackedShopListingProduct,
} from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/parsers.ts';
import { TaobaoSyncRepository } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/repository.ts';

const SYNC_LISTING_TAB_LABELS = ['全部宝贝', '所有宝贝', '在售', '宝贝'];
const SYNC_MAX_LISTING_ITEMS = 80;
const SYNC_MAX_SCROLL_ROUNDS = 6;
const SYNC_NO_GROWTH_LIMIT = 2;
const SYNC_SCROLL_AMOUNT = 720;

function ensureSafePage(inputs: Array<string | null | undefined>) {
  const signals = detectTaobaoRiskSignals(inputs);
  if (signals.length > 0) {
    throw new Error(`Taobao risk signal detected: ${signals.map((signal) => signal.reason).join(', ')}`);
  }
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

function matchesBrowseHistoryItem(productTitle: string, historyItem: { title?: string | null }) {
  const historyTitle = normalizeComparisonText(historyItem.title ?? '');
  const productKey = normalizeComparisonText(productTitle);
  if (!historyTitle || !productKey) return false;
  return historyTitle === productKey || historyTitle.includes(productKey) || productKey.includes(historyTitle);
}

async function openShopListingPage(args: {
  client: TaobaoMcpClient;
  shopUrl: string;
  pageReadMaxLength: number;
  delayMinMs: number;
  delayMaxMs: number;
}) {
  const { client, shopUrl, pageReadMaxLength } = args;
  await client.navigateToUrl(shopUrl);
  await sleepWithJitter(args);

  const initialRead = await client.readPageContent({ maxLength: pageReadMaxLength });
  const initialScan = await client.scanPageElements();
  ensureSafePage([initialRead.title, initialRead.content, initialScan.dom]);

  const listingTabIndex = extractFirstElementIndex(initialScan.dom, SYNC_LISTING_TAB_LABELS);
  if (listingTabIndex !== null) {
    await client.clickElement({ index: listingTabIndex });
    await sleepWithJitter(args);
  }

  const firstRead = await client.readPageContent({ maxLength: pageReadMaxLength });
  ensureSafePage([firstRead.title, firstRead.content]);
  return firstRead;
}

async function collectShopProducts(args: {
  client: TaobaoMcpClient;
  binding: { canonicalShopName: string; canonicalShopUrl: string };
  pageReadMaxLength: number;
  delayMinMs: number;
  delayMaxMs: number;
}) {
  const { client, binding, pageReadMaxLength } = args;
  const productMap = new Map<string, any>();
  let noGrowthRounds = 0;

  await openShopListingPage({
    client,
    shopUrl: binding.canonicalShopUrl,
    pageReadMaxLength,
    delayMinMs: args.delayMinMs,
    delayMaxMs: args.delayMaxMs,
  });

  for (let round = 0; round <= SYNC_MAX_SCROLL_ROUNDS; round += 1) {
    if (round > 0) {
      await client.scrollPage({ direction: 'down', amount: SYNC_SCROLL_AMOUNT });
      await sleepWithJitter(args);
    }

    const read = await client.readPageContent({ maxLength: pageReadMaxLength });
    ensureSafePage([read.title, read.content]);
    const products = extractShopProductsFromContent(read.content, SYNC_MAX_LISTING_ITEMS, binding as any);

    let newCount = 0;
    for (const product of products) {
      const key = normalizeComparisonText(product.title);
      if (!key || productMap.has(key)) continue;
      productMap.set(key, product);
      newCount += 1;
      if (productMap.size >= SYNC_MAX_LISTING_ITEMS) break;
    }

    if (productMap.size >= SYNC_MAX_LISTING_ITEMS) break;
    if (newCount === 0) noGrowthRounds += 1;
    else noGrowthRounds = 0;
    if (noGrowthRounds >= SYNC_NO_GROWTH_LIMIT) break;
  }

  return [...productMap.values()];
}

async function enrichProduct(args: {
  client: TaobaoMcpClient;
  product: any;
  shopUrl: string;
  pageReadMaxLength: number;
  delayMinMs: number;
  delayMaxMs: number;
}) {
  const beforeHistory = await args.client.getBrowseHistory('product').catch(() => ({ type: 'product', count: 0, items: [] }));
  const latestBeforeOpenTime = Math.max(0, ...beforeHistory.items.map((item: any) => item.openTime ?? 0));

  let matched: any = null;
  for (const keyword of buildClickKeywordsFromTitle(args.product.title)) {
    try {
      await args.client.clickElement({ text: keyword });
    } catch {
      continue;
    }

    await sleepWithJitter(args);

    const history = await args.client.getBrowseHistory('product').catch(() => ({ type: 'product', count: 0, items: [] }));
    matched =
      history.items.find((item: any) => (item.openTime ?? 0) > latestBeforeOpenTime && matchesBrowseHistoryItem(args.product.title, item)) ??
      (latestBeforeOpenTime === 0 ? history.items.find((item: any) => matchesBrowseHistoryItem(args.product.title, item)) ?? null : null);

    if (matched) break;
  }

  await openShopListingPage({
    client: args.client,
    shopUrl: args.shopUrl,
    pageReadMaxLength: args.pageReadMaxLength,
    delayMinMs: args.delayMinMs,
    delayMaxMs: args.delayMaxMs,
  });

  if (!matched) {
    return {
      ...args.product,
      detailClickUsed: false,
    };
  }

  const identity = normalizeTaobaoProductIdentity(matched.url ?? null);
  return {
    ...args.product,
    detailClickUsed: true,
    productUrl: identity?.canonicalProductUrl ?? matched.url ?? args.product.productUrl,
    imageUrl: matched.imageUrl?.trim() || args.product.imageUrl,
    priceAmount: parsePriceAmount(matched.discountedPrice ?? matched.originalPrice ?? null) ?? args.product.priceAmount,
    sourceItemId: matched.itemId?.trim() || identity?.itemId || args.product.sourceItemId,
    sourceSkuId: identity?.skuId ?? args.product.sourceSkuId,
  };
}

async function main() {
  const config = getTaobaoSyncConfig();
  const client = new TaobaoMcpClient(config.mcpUrl);
  const repository = new TaobaoSyncRepository();
  const binding = await repository.findBindingByRoasterName('白鲸');
  if (!binding) throw new Error('Binding not found for 白鲸');

  const trackedProducts = await repository.listTrackedRoasterBeansForBinding(binding);
  const visibleProducts = await collectShopProducts({
    client,
    binding,
    pageReadMaxLength: config.pageReadMaxLength,
    delayMinMs: config.delayMinMs,
    delayMaxMs: config.delayMaxMs,
  });

  const finalCandidates: any[] = [];
  const skippedTracked: string[] = [];
  const skippedFiltered: Array<{ title: string; reason: string }> = [];

  for (const product of visibleProducts) {
    if (shouldSkipTrackedShopListingProduct(trackedProducts, product)) {
      skippedTracked.push(product.title);
      continue;
    }

    const eligibility = evaluateTaobaoArrivalEligibility({
      displayName: product.title,
      titleText: product.title,
      pageText: product.listingText ?? '',
    });

    if (!eligibility.shouldImport) {
      skippedFiltered.push({ title: product.title, reason: eligibility.reason });
      continue;
    }

    finalCandidates.push({
      product,
      parsedBeanName: eligibility.candidate.beanName,
      parsedOrigin: eligibility.candidate.originCountry,
      parseWarnings: eligibility.candidate.parseWarnings,
    });
  }

  const enrichedResults = [];
  for (const item of finalCandidates.slice(0, config.maxItemsPerShop)) {
    const enriched = await enrichProduct({
      client,
      product: item.product,
      shopUrl: binding.canonicalShopUrl,
      pageReadMaxLength: config.pageReadMaxLength,
      delayMinMs: config.delayMinMs,
      delayMaxMs: config.delayMaxMs,
    });

    enrichedResults.push({
      title: enriched.title,
      parsedBeanName: item.parsedBeanName,
      parsedOrigin: item.parsedOrigin,
      parseWarnings: item.parseWarnings,
      priceAmount: enriched.priceAmount,
      imageUrl: enriched.imageUrl,
      productUrl: enriched.productUrl,
      sourceItemId: enriched.sourceItemId,
      sourceSkuId: enriched.sourceSkuId,
      detailClickUsed: enriched.detailClickUsed,
    });
  }

  console.log(JSON.stringify({
    roasterName: binding.roasterName,
    shopName: binding.canonicalShopName,
    trackedCount: trackedProducts.length,
    scannedCount: visibleProducts.length,
    finalImportCount: enrichedResults.length,
    finalImportCandidates: enrichedResults,
    skippedTrackedCount: skippedTracked.length,
    skippedTracked,
    skippedFilteredCount: skippedFiltered.length,
    skippedFiltered,
  }, null, 2));

  try {
    await client.closePage();
  } catch {}
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : JSON.stringify(error, null, 2));
  process.exit(1);
});
