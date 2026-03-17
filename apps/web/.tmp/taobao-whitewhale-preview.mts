import 'dotenv/config';

import { TaobaoMcpClient } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/mcp-client.ts';
import { getTaobaoSyncConfig, sleepWithJitter } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/config.ts';
import {
  detectTaobaoRiskSignals,
  evaluateTaobaoArrivalEligibility,
  extractElementIndex,
  extractShopProductsFromContent,
  normalizeComparisonText,
  normalizeTaobaoProductIdentity,
  parsePriceAmount,
} from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/parsers.ts';
import { TaobaoSyncRepository } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/repository.ts';

function ensureSafePage(inputs: Array<string | null | undefined>) {
  const signals = detectTaobaoRiskSignals(inputs);
  if (signals.length > 0) {
    throw new Error(`Taobao risk signal detected: ${signals.map((signal) => signal.reason).join(', ')}`);
  }
}

function mergeTexts(parts: Array<string | null | undefined>) {
  return parts.filter((part): part is string => typeof part === 'string' && part.trim().length > 0).join('\n');
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

async function openShopNewArrivalsPage(args: {
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
  const initialScan = await client.scanPageElements({ filter: '新品' });
  ensureSafePage([initialRead.title, initialRead.content, initialScan.dom]);
  const newArrivalIndex = extractElementIndex(initialScan.dom, '新品');
  if (newArrivalIndex !== null) {
    await client.clickElement({ index: newArrivalIndex });
    await sleepWithJitter(args);
  }
  const firstRead = await client.readPageContent({ maxLength: pageReadMaxLength });
  ensureSafePage([firstRead.title, firstRead.content]);
  return firstRead;
}

async function collectShopProducts(args: {
  client: TaobaoMcpClient;
  shopUrl: string;
  maxItems: number;
  pageReadMaxLength: number;
  delayMinMs: number;
  delayMaxMs: number;
  binding: { canonicalShopName: string; canonicalShopUrl: string };
}) {
  const firstRead = await openShopNewArrivalsPage(args);
  const products = extractShopProductsFromContent(firstRead.content, args.maxItems, args.binding as any);
  const contentParts = [firstRead.content];

  if (products.length < Math.min(args.maxItems, 6)) {
    await args.client.scrollPage({ direction: 'down', amount: 560 });
    await sleepWithJitter(args);
    const secondRead = await args.client.readPageContent({ maxLength: args.pageReadMaxLength });
    ensureSafePage([secondRead.title, secondRead.content]);
    contentParts.push(secondRead.content);
    const secondProducts = extractShopProductsFromContent(secondRead.content, args.maxItems, args.binding as any);
    const deduped = [
      ...new Map([...products, ...secondProducts].map((product) => [normalizeComparisonText(product.title), product])).values(),
    ].slice(0, args.maxItems);
    return { products: deduped, shopText: mergeTexts(contentParts) };
  }

  return { products, shopText: mergeTexts(contentParts) };
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

  await openShopNewArrivalsPage({
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

  const maxItems = 8;
  const { products } = await collectShopProducts({
    client,
    shopUrl: binding.canonicalShopUrl,
    maxItems,
    pageReadMaxLength: config.pageReadMaxLength,
    delayMinMs: config.delayMinMs,
    delayMaxMs: config.delayMaxMs,
    binding,
  });

  const kept: any[] = [];
  const skipped: any[] = [];

  for (const product of products) {
    const eligibility = evaluateTaobaoArrivalEligibility({
      displayName: product.title,
      titleText: product.title,
      pageText: product.listingText ?? '',
    });

    if (!eligibility.shouldImport) {
      skipped.push({
        title: product.title,
        priceAmount: product.priceAmount,
        reason: eligibility.reason,
        warnings: eligibility.warnings,
        parsedOrigin: eligibility.candidate.originCountry,
        parsedBeanName: eligibility.candidate.beanName,
      });
      continue;
    }

    const enriched = await enrichProduct({
      client,
      product,
      shopUrl: binding.canonicalShopUrl,
      pageReadMaxLength: config.pageReadMaxLength,
      delayMinMs: config.delayMinMs,
      delayMaxMs: config.delayMaxMs,
    });

    kept.push({
      title: enriched.title,
      priceAmount: enriched.priceAmount,
      imageUrl: enriched.imageUrl,
      productUrl: enriched.productUrl,
      sourceItemId: enriched.sourceItemId,
      sourceSkuId: enriched.sourceSkuId,
      detailClickUsed: enriched.detailClickUsed,
      parsedBeanName: eligibility.candidate.beanName,
      parsedOrigin: eligibility.candidate.originCountry,
      parseWarnings: eligibility.candidate.parseWarnings,
    });
  }

  console.log(JSON.stringify({
    roasterName: binding.roasterName,
    shopName: binding.canonicalShopName,
    scannedCount: products.length,
    keptCount: kept.length,
    skippedCount: skipped.length,
    kept,
    skipped,
  }, null, 2));

  try {
    await client.closePage();
  } catch {}
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : JSON.stringify(error, null, 2));
  process.exit(1);
});
