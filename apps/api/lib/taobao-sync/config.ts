import type { TaobaoSyncConfig } from './types.ts';

const DEFAULT_TAOBAO_MCP_URL = 'http://localhost:3655/mcp';
const DEFAULT_MAX_ITEMS_PER_SHOP = 20;
const DEFAULT_DELAY_MIN_MS = 1400;
const DEFAULT_DELAY_MAX_MS = 2600;
const DEFAULT_PAGE_READ_MAX_LENGTH = 8000;
const DEFAULT_MAX_LOW_CONFIDENCE_DETAIL_READS_PER_SHOP = 4;
const DEFAULT_MAX_SHOP_RETRIES = 1;

function parsePositiveInt(value: string | undefined, fallback: number) {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function readOptionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

export function getTaobaoSyncConfig(): TaobaoSyncConfig {
  const delayMinMs = parsePositiveInt(process.env.TAOBAO_SYNC_DELAY_MIN_MS, DEFAULT_DELAY_MIN_MS);
  const delayMaxMs = parsePositiveInt(process.env.TAOBAO_SYNC_DELAY_MAX_MS, DEFAULT_DELAY_MAX_MS);

  return {
    mcpUrl: process.env.TAOBAO_MCP_URL?.trim() || DEFAULT_TAOBAO_MCP_URL,
    maxItemsPerShop: parsePositiveInt(process.env.TAOBAO_SYNC_MAX_ITEMS_PER_SHOP, DEFAULT_MAX_ITEMS_PER_SHOP),
    delayMinMs: Math.min(delayMinMs, delayMaxMs),
    delayMaxMs: Math.max(delayMinMs, delayMaxMs),
    pageReadMaxLength: parsePositiveInt(process.env.TAOBAO_SYNC_PAGE_READ_MAX_LENGTH, DEFAULT_PAGE_READ_MAX_LENGTH),
    maxLowConfidenceDetailReadsPerShop: parsePositiveInt(
      process.env.TAOBAO_SYNC_MAX_LOW_CONFIDENCE_DETAIL_READS_PER_SHOP,
      DEFAULT_MAX_LOW_CONFIDENCE_DETAIL_READS_PER_SHOP
    ),
    maxShopRetries: DEFAULT_MAX_SHOP_RETRIES,
    visionBaseUrl: readOptionalEnv('VISION_BASE_URL'),
    visionApiKey: readOptionalEnv('VISION_API_KEY'),
    visionModel: readOptionalEnv('VISION_MODEL'),
  };
}

export function randomDelayMs(config: Pick<TaobaoSyncConfig, 'delayMinMs' | 'delayMaxMs'>) {
  if (config.delayMaxMs <= config.delayMinMs) return config.delayMinMs;
  return Math.floor(Math.random() * (config.delayMaxMs - config.delayMinMs + 1)) + config.delayMinMs;
}

export async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function sleepWithJitter(config: Pick<TaobaoSyncConfig, 'delayMinMs' | 'delayMaxMs'>) {
  await sleep(randomDelayMs(config));
}
