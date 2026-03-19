import type { CoffeeBean } from '../types';
import {
  type AtlasSilhouetteFrame,
  GENERATED_CONTINENT_SHAPES,
  GENERATED_COUNTRY_SHAPES,
} from './origin-atlas-shapes.generated';

export interface OriginAtlasContinent {
  id: 'asia' | 'africa' | 'americas';
  name: string;
  icon: string;
  color: string;
  path: string;
  viewBox: string;
  silhouetteFrame: AtlasSilhouetteFrame;
  editorialLabel: string;
  description: string;
  cardVariant: 'split' | 'column' | 'panorama';
  countries: string[];
}

export interface OriginAtlasCountry {
  id: string;
  name: string;
  continentId: OriginAtlasContinent['id'];
  color: string;
  path: string;
  viewBox: string;
  silhouetteFrame: AtlasSilhouetteFrame;
  aliases: string[];
  flavorLabel: string;
  editorialLabel: string;
  accent: string;
  layoutVariant: 'ridge' | 'archipelago' | 'ledger' | 'plateau' | 'coast';
  notableRegions: string[];
}

export interface CountryAtlasStats {
  beanCount: number;
  roasterCount: number;
  regions: string[];
  processes: string[];
  tastingNotes: string[];
  averagePrice: number | null;
  inStockCount: number;
  beans: CoffeeBean[];
}

function getCountryShape(name: string) {
  const shape = GENERATED_COUNTRY_SHAPES[name];
  if (!shape) {
    throw new Error(`Missing origin atlas shape for country: ${name}`);
  }
  return shape;
}

export const ORIGIN_ATLAS_CONTINENTS: OriginAtlasContinent[] = [
  {
    id: 'americas',
    name: '美洲',
    icon: '🌎',
    color: '#6F9F87',
    path: GENERATED_CONTINENT_SHAPES.americas.path,
    viewBox: GENERATED_CONTINENT_SHAPES.americas.viewBox,
    silhouetteFrame: GENERATED_CONTINENT_SHAPES.americas.silhouetteFrame,
    editorialLabel: '火山链、雨林与安第斯山脉',
    description: '从中美洲火山土到南美山脉，坚果、巧克力与热带水果在海拔差中形成层次。',
    cardVariant: 'panorama',
    countries: ['哥伦比亚', '巴西', '危地马拉', '哥斯达黎加', '巴拿马', '秘鲁', '洪都拉斯', '尼加拉瓜', '萨尔瓦多', '墨西哥', '厄瓜多尔', '玻利维亚'],
  },
  {
    id: 'africa',
    name: '非洲',
    icon: '🌍',
    color: '#D6A85C',
    path: GENERATED_CONTINENT_SHAPES.africa.path,
    viewBox: GENERATED_CONTINENT_SHAPES.africa.viewBox,
    silhouetteFrame: GENERATED_CONTINENT_SHAPES.africa.silhouetteFrame,
    editorialLabel: '花香基准与东非高原',
    description: '东非高原以清晰花香、莓果调和结构感著称，是精品咖啡风味的经典坐标。',
    cardVariant: 'column',
    countries: ['埃塞俄比亚', '肯尼亚', '卢旺达', '坦桑尼亚', '乌干达'],
  },
  {
    id: 'asia',
    name: '亚洲',
    icon: '🌏',
    color: '#D86F4C',
    path: GENERATED_CONTINENT_SHAPES.asia.path,
    viewBox: GENERATED_CONTINENT_SHAPES.asia.viewBox,
    silhouetteFrame: GENERATED_CONTINENT_SHAPES.asia.silhouetteFrame,
    editorialLabel: '高地、岛链与季风山谷',
    description: '从云南山地到印尼群岛，酸质、香料感与甜感在湿热海风里不断切换。',
    cardVariant: 'split',
    countries: ['云南', '印尼', '越南', '也门'],
  },
];

const continentColorMap = new Map(ORIGIN_ATLAS_CONTINENTS.map((continent) => [continent.id, continent.color]));

const COUNTRY_META: Array<Omit<OriginAtlasCountry, 'color' | 'path' | 'viewBox' | 'silhouetteFrame'>> = [
  {
    id: 'yunnan',
    name: '云南',
    continentId: 'asia',
    aliases: ['中国云南', '云南省', 'yunnan', 'china yunnan'],
    flavorLabel: '茶感·甘蔗甜·木质香',
    editorialLabel: '横断山脉的云雾高地，让甜感与干净度一起抬升。',
    accent: '#C2573C',
    layoutVariant: 'ridge',
    notableRegions: ['保山', '普洱', '临沧'],
  },
  {
    id: 'indonesia',
    name: '印尼',
    continentId: 'asia',
    aliases: ['印度尼西亚', 'indonesia', 'sumatra', 'java', 'sulawesi'],
    flavorLabel: '草本·黑糖·厚实口感',
    editorialLabel: '群岛地形让风味更宽广，常带有热带雨林般的深度与厚度。',
    accent: '#B65F47',
    layoutVariant: 'archipelago',
    notableRegions: ['苏门答腊', '爪哇', '苏拉威西'],
  },
  {
    id: 'vietnam',
    name: '越南',
    continentId: 'asia',
    aliases: ['vietnam', 'da lat', 'lam dong'],
    flavorLabel: '可可·果甜·饱满质地',
    editorialLabel: '从达拉特高地到中南半岛腹地，风味线条更直给也更浓缩。',
    accent: '#DA7E5E',
    layoutVariant: 'coast',
    notableRegions: ['大叻', '林同', '山罗'],
  },
  {
    id: 'yemen',
    name: '也门',
    continentId: 'asia',
    aliases: ['yemen', 'mocha', 'haraz'],
    flavorLabel: '红酒果香·香料·干果甜',
    editorialLabel: '古老梯田与干旱高地共同塑造了浓缩而神秘的层次。',
    accent: '#A44B39',
    layoutVariant: 'ledger',
    notableRegions: ['哈拉兹', '摩卡', '巴尼马塔尔'],
  },
  {
    id: 'ethiopia',
    name: '埃塞俄比亚',
    continentId: 'africa',
    aliases: ['ethiopia', 'yirgacheffe', 'sidama', 'guji'],
    flavorLabel: '茉莉·柑橘·莓果',
    editorialLabel: '它像一张风味坐标原点，高海拔与原生种带来极高辨识度。',
    accent: '#B78C40',
    layoutVariant: 'ridge',
    notableRegions: ['耶加雪菲', '西达摩', '古吉'],
  },
  {
    id: 'kenya',
    name: '肯尼亚',
    continentId: 'africa',
    aliases: ['kenya', 'nyeri', 'kirinyaga'],
    flavorLabel: '黑醋栗·番茄·闪亮酸质',
    editorialLabel: '肯尼亚常把酸质推到前景，结构锋利却仍保持甜感支撑。',
    accent: '#C69A4D',
    layoutVariant: 'plateau',
    notableRegions: ['涅里', '基里尼亚加', '穆兰加'],
  },
  {
    id: 'rwanda',
    name: '卢旺达',
    continentId: 'africa',
    aliases: ['rwanda', 'huye', 'nyamasheke'],
    flavorLabel: '蜂蜜·花香·柠檬皮',
    editorialLabel: '小而紧凑的高地国家，杯中常能看到清晰花香与柔亮酸值。',
    accent: '#D1A65D',
    layoutVariant: 'ledger',
    notableRegions: ['胡耶', '尼亚马谢凯', 'Gakenke'],
  },
  {
    id: 'tanzania',
    name: '坦桑尼亚',
    continentId: 'africa',
    aliases: ['tanzania', 'mbeya', 'kilimanjaro'],
    flavorLabel: '黑莓·可可·干净尾韵',
    editorialLabel: '火山山体与湖区气候并存，让风味在果感和可可调之间摇摆。',
    accent: '#C69B57',
    layoutVariant: 'coast',
    notableRegions: ['姆贝亚', '乞力马扎罗', '阿鲁沙'],
  },
  {
    id: 'uganda',
    name: '乌干达',
    continentId: 'africa',
    aliases: ['uganda', 'bugisu', 'rwenzori'],
    flavorLabel: '黑糖·果干·厚实口感',
    editorialLabel: '被湖泊和高地包围的地貌，让乌干达既有醇厚感也能出现明亮果调。',
    accent: '#AF8848',
    layoutVariant: 'plateau',
    notableRegions: ['布吉苏', '鲁文佐里', '西尼罗'],
  },
  {
    id: 'colombia',
    name: '哥伦比亚',
    continentId: 'americas',
    aliases: ['colombia', 'huila', 'narino', 'tolima'],
    flavorLabel: '焦糖·坚果·橙感酸质',
    editorialLabel: '安第斯山系把哥伦比亚切成多个风味走廊，平衡是它最稳定的特征。',
    accent: '#5D917A',
    layoutVariant: 'ridge',
    notableRegions: ['慧兰', '纳里尼奥', '托利马'],
  },
  {
    id: 'brazil',
    name: '巴西',
    continentId: 'americas',
    aliases: ['brazil', 'cerrado', 'mogiana', 'sul de minas'],
    flavorLabel: '巧克力·榛果·圆润甜感',
    editorialLabel: '巴西不是单一风味，而是一整块大地形下的稳定甜感和坚果基底。',
    accent: '#4E826B',
    layoutVariant: 'plateau',
    notableRegions: ['塞拉多', '莫吉亚纳', '南米纳斯'],
  },
  {
    id: 'guatemala',
    name: '危地马拉',
    continentId: 'americas',
    aliases: ['guatemala', 'antigua', 'huehuetenango'],
    flavorLabel: '可可·红糖·细致酸感',
    editorialLabel: '火山土与高海拔让危地马拉的风味拥有很强的骨架感。',
    accent: '#7AA08B',
    layoutVariant: 'ridge',
    notableRegions: ['安提瓜', '薇薇特南果', '科班'],
  },
  {
    id: 'costa-rica',
    name: '哥斯达黎加',
    continentId: 'americas',
    aliases: ['costa rica', 'tarrazu', 'west valley'],
    flavorLabel: '柑橘·蜂蜜·清晰甜感',
    editorialLabel: '处理法创新与高海拔小农体系，让它常带有明亮且精致的轮廓。',
    accent: '#7FA48E',
    layoutVariant: 'coast',
    notableRegions: ['塔拉珠', '西谷', '中央谷地'],
  },
  {
    id: 'panama',
    name: '巴拿马',
    continentId: 'americas',
    aliases: ['panama', 'boquete', 'volcan'],
    flavorLabel: '花香·佛手柑·茶感尾韵',
    editorialLabel: '细长的地峡连接两洋，也连接了极端精致与极高辨识度。',
    accent: '#89B19B',
    layoutVariant: 'ledger',
    notableRegions: ['波奎特', '沃肯', 'Renacimiento'],
  },
  {
    id: 'peru',
    name: '秘鲁',
    continentId: 'americas',
    aliases: ['peru', 'cajamarca', 'cusco'],
    flavorLabel: '可可·柑橘·柔和甜感',
    editorialLabel: '安第斯西侧山脉让秘鲁呈现柔和结构和更温润的果酸。',
    accent: '#6A977E',
    layoutVariant: 'ridge',
    notableRegions: ['卡哈马卡', '库斯科', '亚马逊纳斯'],
  },
  {
    id: 'honduras',
    name: '洪都拉斯',
    continentId: 'americas',
    aliases: ['honduras', 'copan', 'comayagua'],
    flavorLabel: '焦糖·坚果·可可甜',
    editorialLabel: '高地与微气候丰富，使它经常成为兼顾甜感与性价比的产地。',
    accent: '#88AD97',
    layoutVariant: 'plateau',
    notableRegions: ['科潘', '科马亚瓜', '圣巴巴拉'],
  },
  {
    id: 'nicaragua',
    name: '尼加拉瓜',
    continentId: 'americas',
    aliases: ['nicaragua', 'jinotega', 'matagalpa'],
    flavorLabel: '黑糖·香料·顺滑质地',
    editorialLabel: '大湖区与火山带共同拉出更厚实、更香料化的尾韵。',
    accent: '#6F977F',
    layoutVariant: 'ledger',
    notableRegions: ['希诺特加', '马塔加尔帕', 'Nueva Segovia'],
  },
  {
    id: 'el-salvador',
    name: '萨尔瓦多',
    continentId: 'americas',
    aliases: ['el salvador', 'apaleca', 'santa ana'],
    flavorLabel: '花香·焦糖·温柔酸质',
    editorialLabel: '体量虽小，却常凭波旁系品种展现出优雅而安静的层次。',
    accent: '#89AE98',
    layoutVariant: 'coast',
    notableRegions: ['阿帕内卡', '圣安娜', 'Chalatenango'],
  },
  {
    id: 'mexico',
    name: '墨西哥',
    continentId: 'americas',
    aliases: ['mexico', 'chiapas', 'oaxaca', 'veracruz'],
    flavorLabel: '坚果·可可·温和柑橘',
    editorialLabel: '南部高地和原住民小农体系，让墨西哥更像一张温和而稳定的底图。',
    accent: '#5E8A74',
    layoutVariant: 'coast',
    notableRegions: ['恰帕斯', '瓦哈卡', '韦拉克鲁斯'],
  },
  {
    id: 'ecuador',
    name: '厄瓜多尔',
    continentId: 'americas',
    aliases: ['ecuador', 'loja', 'pichincha'],
    flavorLabel: '柑橘·红糖·轻盈花香',
    editorialLabel: '安第斯与赤道交叠，风味常显得轻快而有空气感。',
    accent: '#79A08A',
    layoutVariant: 'coast',
    notableRegions: ['洛哈', '皮钦查', '萨莫拉'],
  },
  {
    id: 'bolivia',
    name: '玻利维亚',
    continentId: 'americas',
    aliases: ['bolivia', 'caranavi', 'la paz'],
    flavorLabel: '花香·核果·稀有甜感',
    editorialLabel: '高原边缘与亚马逊坡地让它经常出现细密又稀有的花果层次。',
    accent: '#6A8D77',
    layoutVariant: 'plateau',
    notableRegions: ['卡拉纳维', '拉巴斯', 'Yungas'],
  },
];

export const ORIGIN_ATLAS_COUNTRIES: OriginAtlasCountry[] = COUNTRY_META.map((country) => {
  const shape = getCountryShape(country.name);
  return {
    ...country,
    color: continentColorMap.get(country.continentId) ?? '#6F9F87',
    path: shape.path,
    viewBox: shape.viewBox,
    silhouetteFrame: shape.silhouetteFrame,
  };
});

export const ORIGIN_ATLAS_COUNTRY_MAP = new Map(ORIGIN_ATLAS_COUNTRIES.map((country) => [country.name, country]));
export const ORIGIN_ATLAS_CONTINENT_MAP = new Map(ORIGIN_ATLAS_CONTINENTS.map((continent) => [continent.id, continent]));
export const ORIGIN_ATLAS_COUNTRIES_BY_CONTINENT = new Map(
  ORIGIN_ATLAS_CONTINENTS.map((continent) => [
    continent.id,
    ORIGIN_ATLAS_COUNTRIES.filter((country) => country.continentId === continent.id),
  ])
);

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getCountriesByContinent(continentId: OriginAtlasContinent['id']): OriginAtlasCountry[] {
  return ORIGIN_ATLAS_COUNTRIES_BY_CONTINENT.get(continentId) ?? [];
}

export function matchAtlasCountry(value: string | null | undefined): OriginAtlasCountry | null {
  if (!value) return null;

  const normalizedValue = normalizeLabel(value);
  let bestMatch: { country: OriginAtlasCountry; score: number } | null = null;

  for (const country of ORIGIN_ATLAS_COUNTRIES) {
    const candidates = [country.name, country.id, ...country.aliases];
    for (const candidate of candidates) {
      const normalizedCandidate = normalizeLabel(candidate);
      if (
        normalizedValue === normalizedCandidate ||
        normalizedValue.includes(normalizedCandidate) ||
        normalizedCandidate.includes(normalizedValue)
      ) {
        const score = normalizedCandidate.length;
        if (!bestMatch || score > bestMatch.score) {
          bestMatch = { country, score };
        }
      }
    }
  }

  return bestMatch?.country ?? null;
}

export function buildCountryAtlasStats(beans: CoffeeBean[]): Map<string, CountryAtlasStats> {
  const statsMap = new Map<string, CountryAtlasStats>();

  for (const bean of beans) {
    const country = matchAtlasCountry(bean.originCountry) ?? matchAtlasCountry(bean.name);
    if (!country) continue;

    const stats = statsMap.get(country.name) ?? {
      beanCount: 0,
      roasterCount: 0,
      regions: [],
      processes: [],
      tastingNotes: [],
      averagePrice: null,
      inStockCount: 0,
      beans: [],
    };

    stats.beanCount += 1;
    stats.beans.push(bean);
    if (bean.isInStock) stats.inStockCount += 1;
    if (bean.originRegion && !stats.regions.includes(bean.originRegion)) stats.regions.push(bean.originRegion);
    if (bean.process && !stats.processes.includes(bean.process)) stats.processes.push(bean.process);
    for (const note of bean.tastingNotes ?? []) {
      if (note && !stats.tastingNotes.includes(note)) stats.tastingNotes.push(note);
    }

    statsMap.set(country.name, stats);
  }

  for (const [, stats] of statsMap) {
    const roasterIds = new Set(stats.beans.map((bean) => bean.roasterId).filter(Boolean));
    stats.roasterCount = roasterIds.size;
    const pricedBeans = stats.beans.filter((bean) => bean.price > 0);
    stats.averagePrice =
      pricedBeans.length > 0
        ? Math.round(pricedBeans.reduce((sum, bean) => sum + bean.price, 0) / pricedBeans.length)
        : null;
    stats.beans.sort((left, right) => right.salesCount - left.salesCount);
  }

  return statsMap;
}

export function getContinentSummary(
  continentId: OriginAtlasContinent['id'],
  statsMap: Map<string, CountryAtlasStats>
): { beanCount: number; roasterCount: number } {
  const continent = ORIGIN_ATLAS_CONTINENT_MAP.get(continentId);
  if (!continent) return { beanCount: 0, roasterCount: 0 };

  return continent.countries.reduce(
    (summary, countryName) => {
      const stats = statsMap.get(countryName);
      summary.beanCount += stats?.beanCount ?? 0;
      summary.roasterCount += stats?.roasterCount ?? 0;
      return summary;
    },
    { beanCount: 0, roasterCount: 0 }
  );
}

export function makeAtlasSvgUri(path: string, viewBox: string, color: string, detail = false): string {
  const [, , widthValue = '120', heightValue = '120'] = viewBox.split(' ');
  const minSide = Math.min(Number(widthValue) || 120, Number(heightValue) || 120);
  const strokeWidth = Math.max(1.2, Number((minSide * 0.018).toFixed(2)));
  const detailStrokeWidth = Math.max(0.8, Number((strokeWidth * 0.58).toFixed(2)));
  const overlay = detail
    ? `<path d="${path}" fill="none" stroke="${color}" stroke-width="${detailStrokeWidth}" stroke-dasharray="5 5" opacity="0.22" vector-effect="non-scaling-stroke" />`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"><path d="${path}" fill="${color}" opacity="0.1" /><path d="${path}" fill="${color}22" stroke="${color}" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke" />${overlay}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
