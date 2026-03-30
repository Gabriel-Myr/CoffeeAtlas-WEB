export type TaobaoParseSource = 'title' | 'page' | 'ocr' | 'vision' | 'fallback';
export type TaobaoConfidence = 'high' | 'medium' | 'low';
export type TaobaoSyncStatus = 'SUCCEEDED' | 'FAILED' | 'PARTIAL';
export type TaobaoImportJobStatus = 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'PARTIAL';
export type TaobaoImportJobType = 'SCRAPE_SYNC' | 'MANUAL_PATCH';
export type TaobaoPublishStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type ParsedBeanField =
  | 'beanName'
  | 'originCountry'
  | 'originRegion'
  | 'processMethod'
  | 'variety'
  | 'roastLevel'
  | 'weightGrams';
export type ParsedBeanConflictSeverity = 'blocking' | 'warning';

export interface TaobaoSyncConfig {
  mcpUrl: string;
  maxItemsPerShop: number;
  delayMinMs: number;
  delayMaxMs: number;
  pageReadMaxLength: number;
  maxLowConfidenceDetailReadsPerShop: number;
  maxShopRetries: number;
  visionBaseUrl: string | null;
  visionApiKey: string | null;
  visionModel: string | null;
}

export interface TaobaoMcpSseEnvelope {
  result?: {
    content?: Array<{
      type: string;
      text?: string;
    }>;
  };
  error?: {
    code: number;
    message: string;
  };
  id?: number | string | null;
  jsonrpc?: string;
}

export interface TaobaoMcpReadPageResult {
  url: string;
  title: string;
  content: string;
  totalLength: number;
  truncated: boolean;
}

export interface TaobaoMcpCurrentTabResult {
  url: string;
  title: string;
}

export interface TaobaoBrowseHistoryItem {
  url: string;
  itemId?: string | null;
  title?: string | null;
  shopName?: string | null;
  imageUrl?: string | null;
  openTime?: number | null;
  discountedPrice?: string | null;
  originalPrice?: string | null;
}

export interface TaobaoBrowseHistoryResult {
  type: string;
  count: number;
  items: TaobaoBrowseHistoryItem[];
}

export interface TaobaoInspectPageResult {
  url: string;
  title: string;
  overlays?: Array<{
    selector: string;
    className: string;
    visible: boolean;
    text: string;
  }>;
  [key: string]: unknown;
}

export interface TaobaoSearchProduct {
  image?: string;
  productUrl?: string;
  itemId?: string;
  skuId?: string;
  title?: string;
  shopUrl?: string;
  shopName?: string;
  price?: string;
}

export interface TaobaoSearchProductsResult {
  keyword: string;
  count: number;
  products: TaobaoSearchProduct[];
}

export interface TaobaoBinding {
  id: string;
  roasterId: string;
  roasterName: string;
  sourceId: string;
  sourceName: string;
  canonicalShopUrl: string;
  canonicalShopName: string;
  searchKeyword: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
}

export interface TaobaoItemIdentity {
  itemId: string;
  skuId: string | null;
  canonicalProductUrl: string;
  isTmall: boolean;
}

export interface TaobaoShopIdentity {
  appUid: string | null;
  canonicalShopUrl: string | null;
}

export interface ParsedBeanCandidate {
  displayName: string;
  beanName: string;
  originCountry: string | null;
  originRegion: string | null;
  processMethod: string | null;
  variety: string | null;
  roastLevel: string | null;
  weightGrams: number | null;
  parseSource: TaobaoParseSource;
  parseWarnings: string[];
  confidence: TaobaoConfidence;
  conflicts?: ParsedBeanConflict[];
}

export interface ParsedBeanConflict {
  field: ParsedBeanField;
  severity: ParsedBeanConflictSeverity;
  textualSource: TaobaoParseSource;
  textualValue: string | number;
  visualSource: TaobaoParseSource;
  visualValue: string | number;
}

export interface TaobaoArrivalEligibility {
  shouldImport: boolean;
  reason: 'eligible' | 'espresso_blend' | 'cold_brew' | 'non_target_style';
  warnings: string[];
  candidate: ParsedBeanCandidate;
}

export interface ParsedTextSignals {
  beanName: string | null;
  originCountry: string | null;
  originRegion: string | null;
  processMethod: string | null;
  variety: string | null;
  roastLevel: string | null;
  weightGrams: number | null;
}

export interface VisionBeanCandidate {
  beanName?: string | null;
  originCountry?: string | null;
  originRegion?: string | null;
  processMethod?: string | null;
  variety?: string | null;
  roastLevel?: string | null;
  weightGrams?: number | null;
  parseWarnings?: string[];
}

export interface TaobaoStructuredProduct {
  title: string;
  shopName: string;
  shopUrl: string | null;
  productUrl: string | null;
  imageUrl: string | null;
  priceAmount: number | null;
  sourceItemId: string | null;
  sourceSkuId: string | null;
  listingText?: string | null;
}

export interface ExistingRoasterBeanRecord {
  id: string;
  beanId: string;
  displayName: string;
  priceAmount: number | null;
  productUrl: string | null;
  imageUrl: string | null;
  sourceItemId: string | null;
  sourceSkuId: string | null;
  status: TaobaoPublishStatus;
}

export interface TaobaoSyncOutputRow {
  roasterId: string;
  sourceId: string;
  sourceItemId: string | null;
  sourceSkuId: string | null;
  displayName: string;
  beanName: string;
  productUrl: string | null;
  imageUrl: string | null;
  priceAmount: number | null;
  shopName: string;
  parseSource: TaobaoParseSource;
  parseWarnings: string[];
}

export interface TaobaoPersistRowResult {
  action: 'inserted' | 'updated' | 'skipped';
  beanId: string;
  roasterBeanId: string;
  status: TaobaoPublishStatus;
  output: TaobaoSyncOutputRow;
}

export interface TaobaoSyncSummary {
  processedShops: number;
  failedShops: number;
  processedRows: number;
  skippedRows: number;
  errorRows: number;
  insertedBeans: number;
  insertedRoasterBeans: number;
  updatedRoasterBeans: number;
  draftRows: number;
}

export interface TaobaoSyncResult extends TaobaoSyncSummary {
  importJobId: string;
  status: TaobaoSyncStatus;
}

export interface TaobaoBindingSeedInput {
  roasterName: string;
  canonicalShopName: string;
  canonicalShopUrl?: string;
  searchKeyword?: string;
  isActive?: boolean;
}

export interface TaobaoOcrResult {
  text: string;
  confidence: TaobaoConfidence;
  warnings: string[];
}

export interface TaobaoShopSyncPayload {
  binding: TaobaoBinding;
  visibleTitles: string[];
  structuredProducts: TaobaoStructuredProduct[];
}

export interface TaobaoRiskSignal {
  reason: string;
  text: string;
}

export interface TaobaoCleanupCandidate {
  roasterBeanId: string;
  displayName: string;
  sourceItemId: string | null;
  sourceSkuId: string | null;
  productUrl: string | null;
  reason: 'missing_from_current_shop_listing';
}

export interface TaobaoCleanupPreview {
  token: string;
  binding: TaobaoBinding;
  createdAt: string;
  expiresAt: string;
  canApply: boolean;
  warnings: string[];
  currentDbCount: number;
  scannedTitleCount: number;
  scannedStructuredCount: number;
  stopReason: 'no_growth' | 'end_reached' | 'safe_limit';
  candidates: TaobaoCleanupCandidate[];
}

export interface TaobaoCleanupSnapshot extends TaobaoCleanupPreview {
  version: 1;
  listingTitles: string[];
  structuredProducts: TaobaoStructuredProduct[];
  hash: string;
}

export interface TaobaoCleanupApplyResult {
  token: string;
  importJobId: string;
  binding: TaobaoBinding;
  archivedCount: number;
  skippedCount: number;
  warnings: string[];
}
