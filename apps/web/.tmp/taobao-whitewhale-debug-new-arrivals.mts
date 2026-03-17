import 'dotenv/config';

import { TaobaoMcpClient } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/mcp-client.ts';
import { getTaobaoSyncConfig, sleepWithJitter } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/config.ts';
import {
  detectTaobaoRiskSignals,
  extractElementIndex,
  extractShopProductsFromContent,
} from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/parsers.ts';
import { TaobaoSyncRepository } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/repository.ts';

function ensureSafePage(inputs: Array<string | null | undefined>) {
  const signals = detectTaobaoRiskSignals(inputs);
  if (signals.length > 0) {
    throw new Error(`Taobao risk signal detected: ${signals.map((signal) => signal.reason).join(', ')}`);
  }
}

async function main() {
  const config = getTaobaoSyncConfig();
  const client = new TaobaoMcpClient(config.mcpUrl);
  const repository = new TaobaoSyncRepository();
  const binding = await repository.findBindingByRoasterName('白鲸');
  if (!binding) throw new Error('Binding not found for 白鲸');

  await client.navigateToUrl(binding.canonicalShopUrl);
  await sleepWithJitter(config);

  const initialRead = await client.readPageContent({ maxLength: config.pageReadMaxLength });
  const initialScan = await client.scanPageElements({ filter: '新品' });
  ensureSafePage([initialRead.title, initialRead.content, initialScan.dom]);

  const newArrivalIndex = extractElementIndex(initialScan.dom, '新品');
  if (newArrivalIndex !== null) {
    await client.clickElement({ index: newArrivalIndex });
    await sleepWithJitter(config);
  }

  const rounds: Array<{ round: number; titles: string[]; rawTitle: string; rawUrl: string }> = [];
  const seen = new Set<string>();

  for (let round = 0; round < 6; round += 1) {
    if (round > 0) {
      await client.scrollPage({ direction: 'down', amount: 720 });
      await sleepWithJitter(config);
    }

    const read = await client.readPageContent({ maxLength: config.pageReadMaxLength });
    ensureSafePage([read.title, read.content]);
    const products = extractShopProductsFromContent(read.content, 80, binding);
    const titles = products.map((p) => p.title);
    titles.forEach((title) => seen.add(title));
    rounds.push({ round, titles, rawTitle: read.title, rawUrl: read.url });
  }

  console.log(JSON.stringify({
    shopName: binding.canonicalShopName,
    newArrivalIndex,
    initialScanDom: initialScan.dom,
    uniqueTitleCount: seen.size,
    uniqueTitles: [...seen],
    rounds,
  }, null, 2));

  try {
    await client.closePage();
  } catch {}
}

main().catch(async (error) => {
  console.error(error instanceof Error ? error.stack ?? error.message : JSON.stringify(error, null, 2));
  process.exit(1);
});
