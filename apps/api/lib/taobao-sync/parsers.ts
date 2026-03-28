import type {
  TaobaoArrivalEligibility,
  TaobaoCleanupCandidate,
  ExistingRoasterBeanRecord,
  ParsedBeanCandidate,
  ParsedTextSignals,
  TaobaoBinding,
  TaobaoConfidence,
  TaobaoItemIdentity,
  TaobaoParseSource,
  TaobaoRiskSignal,
  TaobaoSearchProduct,
  TaobaoShopIdentity,
  TaobaoStructuredProduct,
  VisionBeanCandidate,
} from './types.ts';

type KeywordRule = {
  value: string;
  patterns: string[];
};

const COUNTRY_RULES: KeywordRule[] = [
  { value: 'Ethiopia', patterns: ['ethiopia', '埃塞俄比亚', '埃塞', '衣索比亚'] },
  { value: 'Colombia', patterns: ['colombia', '哥伦比亚'] },
  { value: 'Kenya', patterns: ['kenya', '肯尼亚'] },
  { value: 'Brazil', patterns: ['brazil', '巴西'] },
  { value: 'Guatemala', patterns: ['guatemala', '危地马拉'] },
  { value: 'Costa Rica', patterns: ['costa rica', '哥斯达黎加', '塔拉珠'] },
  { value: 'Panama', patterns: ['panama', '巴拿马'] },
  { value: 'China', patterns: ['china', '中国', '云南', '保山', '普洱'] },
  { value: 'Rwanda', patterns: ['rwanda', '卢旺达'] },
  { value: 'Burundi', patterns: ['burundi', '布隆迪'] },
  { value: 'El Salvador', patterns: ['el salvador', '萨尔瓦多'] },
  { value: 'Honduras', patterns: ['honduras', '洪都拉斯'] },
  { value: 'Indonesia', patterns: ['indonesia', '印尼', '苏门答腊', '曼特宁'] },
  { value: 'Peru', patterns: ['peru', '秘鲁'] },
  { value: 'Mexico', patterns: ['mexico', '墨西哥'] },
  { value: 'Ecuador', patterns: ['ecuador', '厄瓜多尔'] },
  { value: 'Nicaragua', patterns: ['nicaragua', '尼加拉瓜'] },
  { value: 'Bolivia', patterns: ['bolivia', '玻利维亚'] },
  { value: 'Blend', patterns: ['blend', '拼配', 'soe', '意式', 'espresso'] },
];

const REGION_RULES: KeywordRule[] = [
  { value: 'Yirgacheffe', patterns: ['yirgacheffe', '耶加雪菲', '耶加'] },
  { value: 'Sidamo', patterns: ['sidamo', '西达摩', '西达玛'] },
  { value: 'Huila', patterns: ['huila', '慧兰', '薇拉', '韦拉'] },
  { value: 'Nyeri', patterns: ['nyeri', '涅里'] },
  { value: 'Antigua', patterns: ['antigua', '安提瓜'] },
  { value: 'Tarrazu', patterns: ['tarrazu', '塔拉珠'] },
  { value: 'Cusco', patterns: ['cusco', '库斯科'] },
  { value: 'Yunnan', patterns: ['yunnan', '云南'] },
  { value: 'Baoshan', patterns: ['baoshan', '保山'] },
  { value: 'Pu’er', patterns: ['puer', '普洱'] },
  { value: 'Boquete', patterns: ['boquete', '波奎特'] },
  { value: 'Mantening', patterns: ['mantening', '曼特宁'] },
];

const PROCESS_RULES: KeywordRule[] = [
  { value: 'Washed', patterns: ['washed', '水洗'] },
  { value: 'Natural', patterns: ['natural', '日晒'] },
  { value: 'Honey', patterns: ['honey', '蜜处理', '蜜'] },
  { value: 'Anaerobic', patterns: ['anaerobic', '厌氧'] },
  { value: 'Carbonic Maceration', patterns: ['carbonic', '二氧化碳'] },
  { value: 'Yeast Fermentation', patterns: ['yeast', '酵母'] },
  { value: 'Thermal Shock', patterns: ['thermal shock', '热冲击'] },
  { value: 'Washed Anaerobic', patterns: ['水洗厌氧'] },
  { value: 'Natural Anaerobic', patterns: ['日晒厌氧'] },
];

const VARIETY_RULES: KeywordRule[] = [
  { value: 'Geisha', patterns: ['geisha', 'gesha', '瑰夏'] },
  { value: 'Heirloom', patterns: ['heirloom', '原生种'] },
  { value: 'Pink Bourbon', patterns: ['pink bourbon', '粉红波旁'] },
  { value: 'Bourbon', patterns: ['bourbon', '波旁'] },
  { value: 'SL28', patterns: ['sl28'] },
  { value: 'SL34', patterns: ['sl34'] },
  { value: 'Caturra', patterns: ['caturra', '卡杜拉'] },
  { value: 'Catuai', patterns: ['catuai', '卡杜艾'] },
  { value: 'Catimor', patterns: ['catimor', '卡蒂姆', '卡蒂莫'] },
  { value: 'Typica', patterns: ['typica', '铁皮卡'] },
  { value: 'Pacamara', patterns: ['pacamara', '帕卡玛拉'] },
  { value: 'Java', patterns: ['java', '爪哇'] },
];

const ROAST_RULES: KeywordRule[] = [
  { value: '浅烘', patterns: ['浅烘', '浅度烘焙', 'light roast'] },
  { value: '中浅烘', patterns: ['中浅烘', '中浅'] },
  { value: '中烘', patterns: ['中烘', '中度烘焙', 'medium roast'] },
  { value: '中深烘', patterns: ['中深烘', 'medium dark'] },
  { value: '深烘', patterns: ['深烘', '深度烘焙', 'dark roast'] },
];

const TITLE_STOP_WORDS = [
  '咖啡豆',
  '咖啡',
  '新鲜烘焙',
  '现货',
  '包邮',
  '顺丰',
  '挂耳',
  '熟豆',
  '手冲',
  '新产季',
  '旗舰店',
  '淘宝',
  '天猫',
  '店铺',
  '新品',
  '推荐',
  '热卖',
  '预售',
  '拼单',
  '生豆',
  '冷萃',
  'drip bag',
  'dripbag',
  'filter',
  'bean',
  'beans',
  'coffee',
];

const PRODUCT_NOISE_PATTERNS = [
  /^¥?\d+(?:\.\d+)?$/,
  /^[\d.]+g$/i,
  /^已售\d+/,
  /^销量/,
  /^关注/,
  /^客服/,
  /^进店/,
  /^全部/,
  /^新品$/,
  /^综合$/,
  /^默认$/,
  /^价格$/,
  /^排序$/,
  /^店铺$/,
  /^详情$/,
  /^优惠/,
  /^立即/,
  /^加入/,
  /^收藏/,
  /^运费/,
  /^月销/,
  /^付款/,
  /^评价/,
  /^活动/,
  /^规格/,
  /^口味/,
  /^选择/,
  /^参数/,
];

const SHOP_NOISE_PATTERNS = [
  /粉丝/,
  /店铺榜/,
  /工厂直供/,
  /老店/,
  /评价味道/,
  /下单/,
  /查看资质/,
  /扫码进店/,
  /已关注/,
  /白鲸服务/,
  /Little\.M/i,
  /^搜本店$/,
  /^搜索$/,
  /^全部宝贝$/,
  /^组合套装$/,
  /^咖啡器具$/,
  /^滴滤日常$/,
  /^omni烘焙$/i,
  /^重塑的风味$/,
  /^意式咖啡豆$/,
  /^好豆#\d+$/i,
  /ORIGAMI/i,
  /滤杯/,
  /V60/i,
  /挂耳架/,
  /配碟/,
  /套装/,
  /补邮费/,
  /专拍/,
];

const RISK_PATTERNS: Array<{ reason: string; pattern: RegExp }> = [
  { reason: 'captcha', pattern: /验证码|安全验证|请完成验证|拖动滑块|异常验证/ },
  { reason: 'login_required', pattern: /登录后|重新登录|登录已过期|请先登录|扫码登录/ },
  { reason: 'rate_limit', pattern: /访问受限|访问异常|系统繁忙|稍后再试|频繁/ },
  { reason: 'blank_page', pattern: /页面加载失败|页面异常|内容为空|暂无内容/ },
];

const HARD_ESPRESSO_BLEND_PATTERNS = [
  /\bsoe\b/i,
  /\bespresso\b/i,
  /意式浓缩/,
  /浓缩拼配/,
  /意式拼配/,
  /\bblend\b/i,
  /拼配/,
];

const HARD_COLD_BREW_PATTERNS = [/冷萃(?:专用)?(?:豆)?/, /冷泡(?:专用)?(?:豆)?/, /冰滴(?:专用)?(?:豆)?/];
const SOFT_STYLE_PATTERNS = [/精品意式/, /意式手冲/, /手冲意式/, /\bomni\b/i, /omni烘焙/i, /意式/];
const STRICT_SINGLE_ORIGIN_ESPRESSO_PATTERNS = [/奶咖/, /拿铁/];
const LOT_CODE_PATTERN = /\b[A-Z]\d{2,3}\b/i;

function normalizeWhitespace(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export function normalizeComparisonText(value: string | null | undefined) {
  if (!value) return '';
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[【】\[\]()（）{}]/g, ' ')
    .replace(/[\s\-_/|.,，。:：;；'"“”‘’!?！？~`@#$%^&*+=<>]+/g, '')
    .trim();
}

function normalizeReadableText(value: string | null | undefined) {
  if (!value) return '';
  return normalizeWhitespace(
    value
      .normalize('NFKC')
      .replace(/[\t\r]+/g, ' ')
      .replace(/\u00a0/g, ' ')
  );
}

function stripShopDecorators(value: string) {
  return normalizeWhitespace(
    value
      .replace(/【[^】]+】/g, ' ')
      .replace(/\[[^\]]+\]/g, ' ')
      .replace(/\([^)]*店[^)]*\)/g, ' ')
  );
}

function stripTitleNoise(value: string) {
  let result = stripShopDecorators(value)
    .replace(/¥\s*\d+(?:\.\d+)?/g, ' ')
    .replace(/\d+\s*(?:g|kg|克|千克|ml|毫升|袋|包)\b/gi, ' ')
    .replace(/\b(?:浅烘|中浅烘|中烘|中深烘|深烘|light roast|medium roast|dark roast)\b/gi, ' ')
    .replace(/\b(?:水洗|日晒|蜜处理|厌氧|anaerobic|washed|natural|honey)\b/gi, ' ')
    .replace(/[-_/|+]+/g, ' ');

  for (const stopWord of TITLE_STOP_WORDS) {
    result = result.replace(new RegExp(stopWord, 'ig'), ' ');
  }

  return normalizeWhitespace(result);
}

function titleLooksLikeProduct(value: string) {
  if (!value) return false;
  if (value.length < 4 || value.length > 120) return false;
  if (PRODUCT_NOISE_PATTERNS.some((pattern) => pattern.test(value))) return false;
  if (SHOP_NOISE_PATTERNS.some((pattern) => pattern.test(value))) return false;
  if (/^\d+$/.test(value)) return false;

  return /咖啡豆|专用豆|精品意式|精品espresso|espresso|soe|拼配|blend|水洗|日晒|蜜处理|厌氧|瑰夏|geisha|gesha|耶加|西达摩|慧兰|曼特宁|波旁|卡杜|庄园|产季|深烘|浅烘|中烘|手冲|埃塞|埃塞俄比亚|哥伦比亚|肯尼亚|巴西|危地马拉|哥斯达黎加|秘鲁|卢旺达|萨尔瓦多|洪都拉斯|印尼|苏门答腊/i.test(
    value
  );
}

function hasNearbyCommerceSignal(lines: string[], index: number) {
  const window = lines.slice(index + 1, index + 7);
  const joined = window.join('\n');
  return /¥|人付款|月销|已售/.test(joined);
}

function findNearbyPrice(lines: string[], index: number) {
  const window = lines.slice(index + 1, index + 8);

  for (let offset = 0; offset < window.length; offset += 1) {
    const line = window[offset];
    if (!line || /消费券|满\d+件|已降|降\d+元|退货宝|折$/.test(line)) continue;

    const inlinePrice = line.match(/¥\s*(\d+(?:\.\d+)?)/);
    if (inlinePrice) {
      const parsed = Number(inlinePrice[1]);
      if (Number.isFinite(parsed)) return parsed;
    }

    if (line === '¥') {
      const nextLine = window[offset + 1] ?? '';
      const nextPrice = nextLine.match(/^(\d+(?:\.\d+)?)$/);
      if (nextPrice) {
        const parsed = Number(nextPrice[1]);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
  }

  for (const line of window) {
    if (!line || /消费券|满\d+件|已降|降\d+元|退货宝|折$/.test(line)) continue;
    if (/人付款|月销|已售/.test(line)) continue;
    if (!/^\d+(?:\.\d+)?$/.test(line)) continue;

    const parsed = Number(line);
    if (Number.isFinite(parsed) && parsed >= 10) return parsed;
  }
  return null;
}

function collectListingBlock(lines: string[], index: number) {
  const block: string[] = [];
  for (let cursor = index; cursor < Math.min(lines.length, index + 8); cursor += 1) {
    const line = lines[cursor];
    if (!line) continue;
    if (cursor > index && titleLooksLikeProduct(line) && hasNearbyCommerceSignal(lines, cursor)) {
      break;
    }
    block.push(line);
  }
  return block;
}

function findKeywordValue(text: string, rules: KeywordRule[]) {
  const normalized = text.toLowerCase();
  for (const rule of rules) {
    if (rule.patterns.some((pattern) => normalized.includes(pattern.toLowerCase()))) {
      return rule.value;
    }
  }
  return null;
}

function extractWeight(text: string) {
  const normalized = normalizeReadableText(text).toLowerCase();
  const kgMatch = normalized.match(/(\d+(?:\.\d+)?)\s*kg\b/);
  if (kgMatch) {
    const value = Number(kgMatch[1]);
    return Number.isFinite(value) ? Math.round(value * 1000) : null;
  }

  const gramMatch = normalized.match(/(\d+(?:\.\d+)?)\s*(?:g|克)\b/);
  if (gramMatch) {
    const value = Number(gramMatch[1]);
    return Number.isFinite(value) ? Math.round(value) : null;
  }

  return null;
}

function cleanBeanNameCandidate(value: string) {
  return normalizeWhitespace(
    value
      .replace(/^[-_/|+]+/, '')
      .replace(/[-_/|+]+$/, '')
      .replace(/\b(?:拼单|现货|包邮|新品|推荐)\b/gi, ' ')
  );
}

function buildBeanNameFromSignals(displayName: string, signals: Omit<ParsedTextSignals, 'beanName'>) {
  if (signals.originCountry && signals.originRegion) {
    return `${signals.originCountry} ${signals.originRegion}`;
  }
  if (signals.originCountry && signals.variety && signals.originCountry !== 'Blend') {
    return `${signals.originCountry} ${signals.variety}`;
  }
  if (signals.originCountry && signals.originCountry !== 'Blend') {
    return signals.originCountry;
  }
  if (signals.variety === 'Geisha') {
    return 'Geisha';
  }

  const fallback = cleanBeanNameCandidate(stripTitleNoise(displayName));
  return fallback || null;
}

export function parsePriceAmount(value: string | null | undefined) {
  if (!value) return null;
  const match = value.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeTaobaoProductIdentity(url: string | null | undefined): TaobaoItemIdentity | null {
  if (!url) return null;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  const queryKeys = ['id', 'itemId', 'item_id', 'itemNumId', 'item_num_id'];
  const skuKeys = ['skuId', 'sku_id'];

  const itemId =
    queryKeys.map((key) => parsedUrl.searchParams.get(key)).find((value) => typeof value === 'string' && value.length > 0) ??
    parsedUrl.pathname.match(/\/(\d+)(?:\.htm)?$/)?.[1] ??
    null;

  if (!itemId) return null;

  const skuId =
    skuKeys.map((key) => parsedUrl.searchParams.get(key)).find((value) => typeof value === 'string' && value.length > 0) ?? null;

  const isTmall = /tmall\.com$/i.test(parsedUrl.hostname) || parsedUrl.hostname.includes('detail.tmall');
  const canonicalProductUrl = new URL(isTmall ? 'https://detail.tmall.com/item.htm' : 'https://item.taobao.com/item.htm');
  canonicalProductUrl.searchParams.set('id', itemId);
  if (skuId) canonicalProductUrl.searchParams.set('skuId', skuId);

  return {
    itemId,
    skuId,
    canonicalProductUrl: canonicalProductUrl.toString(),
    isTmall,
  };
}

export function normalizeTaobaoShopIdentity(url: string | null | undefined): TaobaoShopIdentity {
  if (!url) {
    return {
      appUid: null,
      canonicalShopUrl: null,
    };
  }

  try {
    const parsedUrl = new URL(url);
    const appUid = parsedUrl.searchParams.get('appUid');
    if (appUid) {
      const canonical = new URL('https://store.taobao.com/shop/view_shop.htm');
      canonical.searchParams.set('appUid', appUid);
      return {
        appUid,
        canonicalShopUrl: canonical.toString(),
      };
    }

    parsedUrl.hash = '';
    const safeParams = new URLSearchParams();
    ['shopId', 'sellerId', 'user_number_id'].forEach((key) => {
      const value = parsedUrl.searchParams.get(key);
      if (value) safeParams.set(key, value);
    });
    parsedUrl.search = safeParams.toString();
    return {
      appUid: null,
      canonicalShopUrl: parsedUrl.toString(),
    };
  } catch {
    return {
      appUid: null,
      canonicalShopUrl: null,
    };
  }
}

function normalizeShopName(value: string | null | undefined) {
  const normalized = normalizeComparisonText(value);
  return normalized.replace(/(?:旗舰店|企业店|淘宝店|天猫店|店铺|淘宝|天猫|店)$/g, '');
}

export function isExactShopMatch(binding: TaobaoBinding, product: Pick<TaobaoSearchProduct, 'shopName' | 'shopUrl'>) {
  const bindingShop = normalizeTaobaoShopIdentity(binding.canonicalShopUrl);
  const productShop = normalizeTaobaoShopIdentity(product.shopUrl ?? null);

  if (bindingShop.appUid && productShop.appUid) {
    return bindingShop.appUid === productShop.appUid;
  }

  if (bindingShop.canonicalShopUrl && productShop.canonicalShopUrl) {
    return bindingShop.canonicalShopUrl === productShop.canonicalShopUrl;
  }

  const bindingName = normalizeShopName(binding.canonicalShopName);
  const productName = normalizeShopName(product.shopName ?? null);
  return Boolean(bindingName && productName && bindingName === productName);
}

function titleScore(productTitle: string, visibleTitles: string[]) {
  if (visibleTitles.length === 0) return 0.5;
  const normalizedProduct = normalizeComparisonText(productTitle);
  if (!normalizedProduct) return 0;

  let bestScore = 0;
  for (const title of visibleTitles) {
    const normalizedTitle = normalizeComparisonText(title);
    if (!normalizedTitle) continue;
    if (normalizedTitle === normalizedProduct) return 1;
    if (normalizedTitle.includes(normalizedProduct) || normalizedProduct.includes(normalizedTitle)) {
      bestScore = Math.max(bestScore, 0.85);
      continue;
    }

    const overlap = normalizedTitle
      .split(/(?=[A-Za-z])|(?<=[\u4e00-\u9fff])/)
      .filter(Boolean)
      .filter((token) => normalizedProduct.includes(token)).length;
    if (overlap > 0) {
      bestScore = Math.max(bestScore, Math.min(0.75, overlap / Math.max(2, normalizedTitle.length / 4)));
    }
  }

  return bestScore;
}

export function extractProductTitlesFromShopContent(content: string, maxItems: number) {
  return extractShopProductsFromContent(content, maxItems).map((product) => product.title);
}

export function extractShopProductsFromContent(content: string, maxItems: number, binding?: TaobaoBinding) {
  const seen = new Set<string>();
  const products: TaobaoStructuredProduct[] = [];
  const rawLines = content.split(/\r?\n/).map((line) => normalizeReadableText(line));

  for (const [index, line] of rawLines.entries()) {
    if (!titleLooksLikeProduct(line)) continue;
    if (!hasNearbyCommerceSignal(rawLines, index)) continue;

    const cleaned = line
      .replace(/已售\s*\d+/g, ' ')
      .replace(/月销\s*\d+/g, ' ')
      .replace(/¥\s*\d+(?:\.\d+)?/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();

    const key = normalizeComparisonText(cleaned);
    if (!key || seen.has(key)) continue;

    const listingBlock = collectListingBlock(rawLines, index);
    seen.add(key);
    products.push({
      title: cleaned,
      shopName: binding?.canonicalShopName ?? '',
      shopUrl: binding?.canonicalShopUrl ?? null,
      productUrl: null,
      imageUrl: null,
      priceAmount: findNearbyPrice(rawLines, index),
      sourceItemId: buildShopListingIdentity(cleaned),
      sourceSkuId: null,
      listingText: listingBlock.join('\n'),
    });
    if (products.length >= maxItems) break;
  }

  return products;
}

export function extractElementIndex(dom: string, label: string) {
  const lines = dom.split(/\r?\n/);
  for (const line of lines) {
    if (!line.includes(label)) continue;
    const match = line.match(/\[(\d+)\]/);
    if (match) return Number(match[1]);
  }
  return null;
}

export function extractFirstElementIndex(dom: string, labels: string[]) {
  for (const label of labels) {
    const index = extractElementIndex(dom, label);
    if (index !== null) return index;
  }
  return null;
}

export function buildSourceIdentityKey(itemId: string | null | undefined, skuId: string | null | undefined) {
  return `${itemId ?? ''}:${skuId ?? ''}`;
}

export function buildShopListingIdentity(title: string) {
  return `listing:${normalizeComparisonText(title)}`;
}

export function filterStructuredProducts(
  binding: TaobaoBinding,
  products: TaobaoSearchProduct[],
  visibleTitles: string[],
  maxItems: number
) {
  const deduped = new Map<string, TaobaoStructuredProduct & { score: number }>();

  for (const product of products) {
    if (!isExactShopMatch(binding, product)) continue;
    if (!titleLooksLikeProduct(product.title ?? '')) continue;

    const identity = normalizeTaobaoProductIdentity(product.productUrl ?? null);
    if (!identity || !product.title) continue;

    const score = titleScore(product.title, visibleTitles);
    const normalizedTitle = normalizeComparisonText(product.title);
    const key = `${identity.itemId}:${identity.skuId ?? ''}`;

    const candidate: TaobaoStructuredProduct & { score: number } = {
      title: normalizeWhitespace(product.title),
      shopName: normalizeWhitespace(product.shopName ?? binding.canonicalShopName),
      shopUrl: normalizeTaobaoShopIdentity(product.shopUrl ?? null).canonicalShopUrl,
      productUrl: identity.canonicalProductUrl,
      imageUrl: product.image ? product.image.trim() : null,
      priceAmount: parsePriceAmount(product.price),
      sourceItemId: identity.itemId,
      sourceSkuId: identity.skuId,
      score,
    };

    const existing = deduped.get(key);
    if (!existing || candidate.score > existing.score || normalizedTitle.length > normalizeComparisonText(existing.title).length) {
      deduped.set(key, candidate);
    }
  }

  const sorted = [...deduped.values()]
    .sort((left, right) => right.score - left.score)
    .slice(0, maxItems);

  if (visibleTitles.length === 0) {
    return sorted.map(({ score: _score, ...product }) => product);
  }

  const withStrongMatch = sorted.filter((product) => product.score >= 0.55);
  return withStrongMatch.map(({ score: _score, ...product }) => product);
}

export function filterStructuredProductsForShop(binding: TaobaoBinding, products: TaobaoSearchProduct[], maxItems: number) {
  const deduped = new Map<string, TaobaoStructuredProduct>();

  for (const product of products) {
    if (!isExactShopMatch(binding, product)) continue;

    const identity = normalizeTaobaoProductIdentity(product.productUrl ?? null);
    if (!identity || !product.title) continue;

    const key = buildSourceIdentityKey(identity.itemId, identity.skuId);
    const candidate: TaobaoStructuredProduct = {
      title: normalizeWhitespace(product.title),
      shopName: normalizeWhitespace(product.shopName ?? binding.canonicalShopName),
      shopUrl: normalizeTaobaoShopIdentity(product.shopUrl ?? null).canonicalShopUrl,
      productUrl: identity.canonicalProductUrl,
      imageUrl: product.image ? product.image.trim() : null,
      priceAmount: parsePriceAmount(product.price),
      sourceItemId: identity.itemId,
      sourceSkuId: identity.skuId,
    };

    const existing = deduped.get(key);
    if (!existing || candidate.title.length > existing.title.length) {
      deduped.set(key, candidate);
    }
  }

  return [...deduped.values()].slice(0, maxItems);
}

export function cleanOcrText(text: string) {
  return normalizeWhitespace(
    text
      .replace(/[|¦]/g, ' ')
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/[。，、]/g, ' ')
  );
}

function extractSignals(text: string, displayName: string): ParsedTextSignals {
  const normalizedText = normalizeReadableText(text).toLowerCase();
  const originCountry = findKeywordValue(normalizedText, COUNTRY_RULES);
  const region = findKeywordValue(normalizedText, REGION_RULES);
  const processMethod = findKeywordValue(normalizedText, PROCESS_RULES);
  const variety = findKeywordValue(normalizedText, VARIETY_RULES);
  const roastLevel = findKeywordValue(normalizedText, ROAST_RULES);
  const weightGrams = extractWeight(normalizedText);

  const signals: Omit<ParsedTextSignals, 'beanName'> = {
    originCountry,
    originRegion: region,
    processMethod,
    variety,
    roastLevel,
    weightGrams,
  };

  return {
    beanName: buildBeanNameFromSignals(displayName, signals),
    ...signals,
  };
}

function scoreCandidate(signals: ParsedTextSignals) {
  let score = 0;
  if (signals.beanName) score += 3;
  if (signals.originCountry) score += 2;
  if (signals.originRegion) score += 2;
  if (signals.processMethod) score += 1;
  if (signals.variety) score += 1;
  if (signals.roastLevel) score += 1;
  if (signals.weightGrams) score += 1;
  return score;
}

function confidenceFromScore(score: number): TaobaoConfidence {
  if (score >= 6) return 'high';
  if (score >= 4) return 'medium';
  return 'low';
}

function warningsForSignals(signals: ParsedTextSignals) {
  const warnings: string[] = [];
  if (!signals.beanName) warnings.push('bean_name_missing');
  if (!signals.weightGrams) warnings.push('weight_missing');
  if (!signals.originCountry && !signals.originRegion) warnings.push('origin_missing');
  return warnings;
}

function buildCandidate(displayName: string, text: string, parseSource: TaobaoParseSource): ParsedBeanCandidate {
  const signals = extractSignals(text, displayName);
  const score = scoreCandidate(signals);
  const confidence = confidenceFromScore(score);
  const beanName = signals.beanName ?? (cleanBeanNameCandidate(stripTitleNoise(displayName)) || displayName);
  const parseWarnings = warningsForSignals(signals);
  if (beanName === displayName && confidence === 'low') {
    parseWarnings.push('display_name_fallback');
  }

  return {
    displayName,
    beanName,
    originCountry: signals.originCountry,
    originRegion: signals.originRegion,
    processMethod: signals.processMethod,
    variety: signals.variety,
    roastLevel: signals.roastLevel,
    weightGrams: signals.weightGrams,
    parseSource,
    parseWarnings: [...new Set(parseWarnings)],
    confidence,
  };
}

export function extractProcessMethodFromText(text: string | null | undefined) {
  if (!text) return null;
  const normalizedText = normalizeReadableText(text).toLowerCase();
  return findKeywordValue(normalizedText, PROCESS_RULES);
}

export function applyOcrProcessFallback(candidate: ParsedBeanCandidate, ocrText: string | null | undefined): ParsedBeanCandidate {
  if (candidate.processMethod) {
    return candidate;
  }

  const processMethod = extractProcessMethodFromText(ocrText);
  if (!processMethod) {
    return candidate;
  }

  return {
    ...candidate,
    processMethod,
    parseWarnings: [...new Set([...candidate.parseWarnings, 'process_method_from_ocr'])],
  };
}

function candidateScore(candidate: ParsedBeanCandidate) {
  let score = scoreCandidate(candidate);
  if (candidate.confidence === 'high') score += 2;
  if (candidate.confidence === 'medium') score += 1;
  if (candidate.parseSource === 'page') score += 0.2;
  if (candidate.parseSource === 'ocr') score += 0.4;
  if (candidate.parseSource === 'vision') score += 0.5;
  score -= candidate.parseWarnings.length * 0.2;
  return score;
}

function toParsedBeanCandidate(
  displayName: string,
  parseSource: TaobaoParseSource,
  candidate: VisionBeanCandidate
): ParsedBeanCandidate {
  const parseWarnings = [...new Set(candidate.parseWarnings ?? [])];
  const beanName = candidate.beanName?.trim() || cleanBeanNameCandidate(stripTitleNoise(displayName)) || displayName;
  const score = scoreCandidate({
    beanName,
    originCountry: candidate.originCountry ?? null,
    originRegion: candidate.originRegion ?? null,
    processMethod: candidate.processMethod ?? null,
    variety: candidate.variety ?? null,
    roastLevel: candidate.roastLevel ?? null,
    weightGrams: candidate.weightGrams ?? null,
  });
  const confidence = confidenceFromScore(score);
  if (!candidate.beanName) parseWarnings.push('vision_missing_bean_name');

  return {
    displayName,
    beanName,
    originCountry: candidate.originCountry ?? null,
    originRegion: candidate.originRegion ?? null,
    processMethod: candidate.processMethod ?? null,
    variety: candidate.variety ?? null,
    roastLevel: candidate.roastLevel ?? null,
    weightGrams: candidate.weightGrams ?? null,
    parseSource,
    parseWarnings: [...new Set(parseWarnings)],
    confidence,
  };
}

export function parseBeanCandidateFromSources(args: {
  displayName: string;
  titleText: string;
  pageText?: string | null;
  ocrText?: string | null;
  visionCandidate?: VisionBeanCandidate | null;
}) {
  const candidates = [buildCandidate(args.displayName, args.titleText, 'title')];

  const pageText = args.pageText ? normalizeReadableText(args.pageText) : '';
  if (pageText) {
    candidates.push(buildCandidate(args.displayName, `${args.titleText}\n${pageText}`, 'page'));
  }

  const ocrText = args.ocrText ? cleanOcrText(args.ocrText) : '';
  if (ocrText) {
    candidates.push(buildCandidate(args.displayName, `${args.titleText}\n${pageText}\n${ocrText}`, 'ocr'));
  }

  if (args.visionCandidate) {
    candidates.push(toParsedBeanCandidate(args.displayName, 'vision', args.visionCandidate));
  }

  const best = candidates.sort((left, right) => candidateScore(right) - candidateScore(left))[0];
  if (!best) {
    return buildCandidate(args.displayName, args.displayName, 'fallback');
  }

  return {
    ...best,
    parseWarnings: [...new Set(best.parseWarnings)],
  };
}

function hasStrongSingleOriginSignals(candidate: ParsedBeanCandidate, text: string) {
  if (!candidate.originCountry || candidate.originCountry === 'Blend') return false;
  if (candidate.originRegion || candidate.variety || candidate.processMethod) return true;
  if (LOT_CODE_PATTERN.test(text)) return true;
  return false;
}

export function evaluateTaobaoArrivalEligibility(args: {
  displayName: string;
  titleText: string;
  pageText?: string | null;
}) : TaobaoArrivalEligibility {
  const candidate = parseBeanCandidateFromSources(args);
  const combinedText = normalizeReadableText([args.titleText, args.pageText ?? ''].filter(Boolean).join('\n'));
  const warnings: string[] = [];
  const strongSingleOrigin = hasStrongSingleOriginSignals(candidate, combinedText);

  for (const pattern of HARD_COLD_BREW_PATTERNS) {
    if (!pattern.test(combinedText)) continue;
    warnings.push(`matched:${pattern.source}`);
    return {
      shouldImport: false,
      reason: 'cold_brew',
      warnings,
      candidate,
    };
  }

  if (candidate.originCountry === 'Blend') {
    warnings.push('origin_country_blend');
    return {
      shouldImport: false,
      reason: 'espresso_blend',
      warnings,
      candidate,
    };
  }

  for (const pattern of HARD_ESPRESSO_BLEND_PATTERNS) {
    if (!pattern.test(combinedText)) continue;
    warnings.push(`matched:${pattern.source}`);
    return {
      shouldImport: false,
      reason: 'espresso_blend',
      warnings,
      candidate,
    };
  }

  for (const pattern of STRICT_SINGLE_ORIGIN_ESPRESSO_PATTERNS) {
    if (!pattern.test(combinedText)) continue;
    warnings.push(`matched:${pattern.source}`);
    return {
      shouldImport: false,
      reason: 'non_target_style',
      warnings,
      candidate,
    };
  }

  const hasSoftStyleSignal = SOFT_STYLE_PATTERNS.some((pattern) => pattern.test(combinedText));
  if (hasSoftStyleSignal && !strongSingleOrigin) {
    warnings.push('soft_style_without_single_origin_identity');
    return {
      shouldImport: false,
      reason: 'non_target_style',
      warnings,
      candidate,
    };
  }

  if (hasSoftStyleSignal) {
    warnings.push('soft_style_with_single_origin_identity');
  }

  return {
    shouldImport: true,
    reason: 'eligible',
    warnings,
    candidate,
  };
}

export function detectTaobaoRiskSignals(inputs: Array<string | null | undefined>): TaobaoRiskSignal[] {
  const joined = normalizeReadableText(inputs.filter(Boolean).join('\n'));
  const signals: TaobaoRiskSignal[] = [];

  for (const { reason, pattern } of RISK_PATTERNS) {
    const match = joined.match(pattern);
    if (!match) continue;
    signals.push({
      reason,
      text: match[0],
    });
  }

  return signals;
}

export function shouldSkipExistingProduct(existing: ExistingRoasterBeanRecord | null, product: TaobaoStructuredProduct) {
  if (!existing) return false;
  const sameTitle = normalizeComparisonText(existing.displayName) === normalizeComparisonText(product.title);
  const samePrice = existing.priceAmount === product.priceAmount;
  const sameUrl =
    product.productUrl === null
      ? existing.productUrl === null
      : normalizeTaobaoProductIdentity(existing.productUrl)?.canonicalProductUrl ===
        normalizeTaobaoProductIdentity(product.productUrl)?.canonicalProductUrl;
  return sameTitle && samePrice && sameUrl;
}

export function shouldSkipTrackedShopListingProduct(existingProducts: ExistingRoasterBeanRecord[], product: TaobaoStructuredProduct) {
  const titleKey = normalizeComparisonText(product.title);
  if (!titleKey) return false;

  return existingProducts.some((existing) => {
    const hasStableSourceIdentity = Boolean(existing.sourceItemId);
    const hasDetailData = Boolean(existing.imageUrl && existing.productUrl);
    return hasStableSourceIdentity && hasDetailData && normalizeComparisonText(existing.displayName) === titleKey;
  });
}

export function buildOffshelfCandidates(args: {
  currentProducts: ExistingRoasterBeanRecord[];
  listingTitles: string[];
  structuredProducts: TaobaoStructuredProduct[];
}) {
  const listingTitleSet = new Set(args.listingTitles.map((title) => normalizeComparisonText(title)).filter(Boolean));
  const identitySet = new Set(
    args.structuredProducts.map((product) => buildSourceIdentityKey(product.sourceItemId, product.sourceSkuId)).filter(Boolean)
  );

  const candidates: TaobaoCleanupCandidate[] = [];
  for (const product of args.currentProducts) {
    const identityKey = buildSourceIdentityKey(product.sourceItemId, product.sourceSkuId);
    const titleKey = normalizeComparisonText(product.displayName);
    const missingIdentity = !product.sourceItemId || !identitySet.has(identityKey);
    const missingTitle = !listingTitleSet.has(titleKey);

    if (missingIdentity && missingTitle) {
      candidates.push({
        roasterBeanId: product.id,
        displayName: product.displayName,
        sourceItemId: product.sourceItemId,
        sourceSkuId: product.sourceSkuId,
        productUrl: product.productUrl,
        reason: 'missing_from_current_shop_listing',
      });
    }
  }

  return candidates;
}
