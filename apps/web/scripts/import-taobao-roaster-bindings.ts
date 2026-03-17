import 'dotenv/config';

import { taobaoRoasterBindingSeeds } from '../data/taobao-roaster-bindings.ts';
import { getTaobaoSyncConfig } from '../lib/taobao-sync/config.ts';
import { TaobaoMcpClient } from '../lib/taobao-sync/mcp-client.ts';
import { isExactShopMatch, normalizeTaobaoShopIdentity } from '../lib/taobao-sync/parsers.ts';
import { TaobaoSyncRepository } from '../lib/taobao-sync/repository.ts';
import type { TaobaoBinding, TaobaoBindingSeedInput } from '../lib/taobao-sync/types.ts';

function toTemporaryBinding(seed: TaobaoBindingSeedInput): TaobaoBinding {
  return {
    id: 'seed',
    roasterId: 'seed',
    roasterName: seed.roasterName,
    sourceId: 'seed',
    sourceName: seed.canonicalShopName,
    canonicalShopUrl: seed.canonicalShopUrl ?? '',
    canonicalShopName: seed.canonicalShopName,
    searchKeyword: seed.searchKeyword ?? null,
    isActive: seed.isActive ?? true,
    lastSyncedAt: null,
  };
}

async function resolveCanonicalShopUrl(client: TaobaoMcpClient, seed: TaobaoBindingSeedInput) {
  if (seed.canonicalShopUrl) return seed.canonicalShopUrl;

  const keyword = seed.searchKeyword?.trim() || seed.canonicalShopName;
  const result = await client.searchProducts(keyword);
  const binding = toTemporaryBinding(seed);
  const matched = result.products.find((product) => {
    if (!product.shopUrl && !product.shopName) return false;
    return isExactShopMatch(binding, {
      shopName: product.shopName,
      shopUrl: product.shopUrl,
    });
  });

  const canonicalShopUrl = normalizeTaobaoShopIdentity(matched?.shopUrl ?? null).canonicalShopUrl;
  if (!canonicalShopUrl) {
    throw new Error(`Unable to resolve canonical shop url for ${seed.roasterName} / ${seed.canonicalShopName}`);
  }

  return canonicalShopUrl;
}

async function main() {
  console.log('淘宝店铺绑定导入开始：将写入 sources / roaster_source_bindings');

  const repository = new TaobaoSyncRepository();
  const config = getTaobaoSyncConfig();
  const mcpClient = new TaobaoMcpClient(config.mcpUrl);
  const results: Array<{ roasterName: string; action: 'inserted' | 'updated'; bindingId: string }> = [];

  for (const seed of taobaoRoasterBindingSeeds) {
    const canonicalShopUrl = await resolveCanonicalShopUrl(mcpClient, seed);
    const result = await repository.upsertBindingFromSeed({
      ...seed,
      canonicalShopUrl,
    });
    results.push({
      roasterName: seed.roasterName,
      action: result.action,
      bindingId: result.bindingId,
    });
  }

  console.log(JSON.stringify({ count: results.length, results }, null, 2));
}

main().catch((error) => {
  console.error('淘宝店铺绑定导入失败:', error instanceof Error ? error.message : error);
  process.exit(1);
});
