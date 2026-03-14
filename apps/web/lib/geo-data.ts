/**
 * Atlas geography source of truth.
 *
 * The homepage atlas, geo preview page, and precision comparison page all
 * consume this module for continent/country metadata and the default paths.
 */

export interface OriginAtlasContinent {
  id: 'asia' | 'africa' | 'americas';
  name: string;
  icon: string;
  color: string;
  path: string;
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
}

export const CONTINENT_PATHS: Record<OriginAtlasContinent['id'], string> = {
  americas:
    'M 32,10 C 38,8 45,7 52,9 C 58,11 62,15 64,20 C 66,25 65,30 62,34 C 59,38 57,42 56,47 C 55,52 56,57 59,62 C 62,67 66,71 68,76 C 70,81 69,86 66,90 C 63,94 58,96 53,97 C 48,98 43,97 39,94 C 35,91 33,87 32,83 C 31,79 32,75 34,71 C 36,67 37,63 36,59 C 35,55 33,51 31,48 C 29,45 27,42 26,38 C 25,34 25,30 27,26 C 29,22 31,18 32,14 C 32,12 32,11 32,10 Z',
  africa:
    'M 35,15 C 43,12 52,11 61,12 C 69,13 76,16 81,21 C 86,26 89,33 90,41 C 91,49 89,57 85,64 C 81,71 76,77 70,82 C 66,86 62,89 57,91 C 52,93 47,93 43,91 C 39,89 37,85 36,81 C 35,77 35,73 36,69 C 37,65 37,61 36,57 C 35,53 33,49 31,46 C 29,43 27,40 26,36 C 25,32 25,28 26,24 C 27,20 29,17 32,15 C 33,15 34,15 35,15 Z',
  asia:
    'M 38,12 C 47,9 57,7 67,8 C 76,9 85,12 92,17 C 97,21 100,27 100,34 C 100,41 97,48 92,54 C 87,60 81,65 74,69 C 69,72 65,76 62,81 C 59,86 57,91 54,95 C 51,98 47,99 43,98 C 39,97 37,94 36,90 C 35,86 35,82 36,78 C 37,74 38,70 37,66 C 36,62 34,58 32,55 C 30,52 28,49 26,46 C 24,43 23,39 23,35 C 23,31 24,27 26,23 C 28,19 31,16 35,13 C 36,13 37,12 38,12 Z',
};

export const COUNTRY_PATHS: Record<string, string> = {
  云南: 'M 45,28 C 52,26 60,25 67,27 C 73,29 78,33 81,39 C 83,45 83,52 80,58 C 77,64 72,68 66,71 C 60,73 54,73 49,71 C 44,69 41,65 39,60 C 37,55 37,49 39,44 C 41,39 43,34 45,30 C 45,29 45,28 45,28 Z',
  印尼: 'M 32,48 C 42,45 54,43 66,44 C 77,45 87,48 94,53 C 99,58 101,65 100,72 C 99,79 95,85 89,89 C 83,92 75,94 67,94 C 59,94 52,92 46,89 C 40,86 36,81 34,75 C 32,69 32,62 33,56 C 33,52 33,50 32,48 Z',
  越南: 'M 52,32 C 56,31 61,30 65,31 C 68,32 71,34 73,37 C 74,40 75,44 74,48 C 73,52 72,56 70,59 C 68,62 65,64 62,66 C 59,67 56,68 53,67 C 50,66 48,64 47,61 C 46,58 46,54 47,50 C 48,46 49,42 50,38 C 51,35 51,33 52,32 Z',
  泰国: 'M 48,35 C 54,33 61,32 68,33 C 74,34 79,37 82,42 C 84,47 85,53 83,59 C 81,64 78,68 74,71 C 70,73 66,74 62,74 C 58,74 54,73 51,71 C 48,69 46,66 45,62 C 44,58 44,53 45,48 C 46,43 47,39 48,36 C 48,35 48,35 48,35 Z',
  印度: 'M 40,22 C 50,19 61,18 72,19 C 81,20 89,24 94,31 C 98,38 100,46 98,54 C 96,62 92,69 86,75 C 80,80 73,83 65,84 C 57,85 50,84 45,81 C 40,78 37,73 35,68 C 33,63 33,57 34,51 C 35,45 37,39 40,33 C 40,28 40,25 40,22 Z',
  也门: 'M 54,40 C 60,38 67,37 74,38 C 80,39 85,42 88,47 C 90,52 90,58 87,63 C 84,68 79,71 73,73 C 67,74 61,74 56,72 C 51,70 48,66 47,61 C 46,56 47,51 50,46 C 51,43 53,41 54,40 Z',
  埃塞俄比亚: 'M 44,30 C 53,27 63,26 73,28 C 81,30 88,35 93,42 C 96,49 97,57 95,65 C 93,72 88,78 82,82 C 76,85 69,87 62,86 C 55,85 49,82 45,77 C 41,72 39,66 39,60 C 39,54 41,48 43,42 C 43,37 44,33 44,30 Z',
  肯尼亚: 'M 52,44 C 58,42 65,41 72,42 C 78,43 83,46 86,51 C 88,56 89,62 87,68 C 85,73 81,77 76,80 C 71,82 65,83 59,82 C 53,81 49,78 47,73 C 45,68 45,62 47,56 C 48,51 50,47 52,45 C 52,44 52,44 52,44 Z',
  卢旺达: 'M 56,50 C 60,49 65,48 69,49 C 72,50 75,52 76,55 C 77,58 77,62 76,65 C 75,68 73,70 70,72 C 67,73 64,74 61,73 C 58,72 56,70 55,67 C 54,64 54,60 55,56 C 55,53 56,51 56,50 Z',
  坦桑尼亚: 'M 48,48 C 58,45 69,44 80,46 C 89,48 97,52 102,59 C 106,66 107,74 105,82 C 103,89 98,95 92,99 C 86,102 79,103 72,102 C 65,101 59,98 55,93 C 51,88 49,82 49,75 C 49,68 49,61 50,55 C 50,51 49,49 48,48 Z',
  乌干达: 'M 54,46 C 59,45 65,44 70,45 C 74,46 78,48 80,52 C 82,56 82,61 80,65 C 78,69 75,72 71,74 C 67,75 63,76 59,75 C 55,74 52,72 51,68 C 50,64 50,59 51,55 C 52,51 53,48 54,46 Z',
  墨西哥: 'M 28,24 C 38,21 50,19 62,20 C 72,21 81,25 87,32 C 91,39 93,47 91,55 C 89,62 85,68 79,73 C 73,77 66,80 59,81 C 52,82 46,80 42,76 C 38,72 36,67 35,62 C 34,57 35,52 37,47 C 37,40 35,34 32,29 C 29,26 28,25 28,24 Z',
  危地马拉: 'M 42,34 C 46,33 51,32 55,33 C 58,34 61,36 62,39 C 63,42 63,46 61,49 C 59,52 56,54 53,55 C 50,55 47,54 45,52 C 43,50 42,47 42,44 C 42,41 42,38 42,35 C 42,34 42,34 42,34 Z',
  洪都拉斯: 'M 46,36 C 51,35 57,34 62,35 C 66,36 70,38 72,42 C 74,46 74,51 72,55 C 70,59 67,62 63,64 C 59,65 55,66 51,65 C 47,64 45,61 44,57 C 43,53 43,49 44,45 C 45,41 45,38 46,36 Z',
  尼加拉瓜: 'M 48,40 C 53,39 59,38 64,39 C 68,40 72,42 74,46 C 76,50 76,55 74,59 C 72,63 69,66 65,68 C 61,69 57,70 53,69 C 49,68 47,65 46,61 C 45,57 45,52 46,47 C 47,44 48,41 48,40 Z',
  哥斯达黎加: 'M 50,44 C 54,43 58,42 62,43 C 65,44 68,46 69,49 C 70,52 70,56 68,59 C 66,62 64,64 61,65 C 58,66 55,66 53,65 C 51,64 50,61 49,58 C 48,55 49,51 50,48 C 50,46 50,45 50,44 Z',
  巴拿马: 'M 52,48 C 55,47 59,46 62,47 C 65,48 67,50 68,53 C 69,56 68,59 66,61 C 64,63 61,64 58,64 C 55,64 53,63 52,60 C 51,57 51,54 52,51 C 52,50 52,49 52,48 Z',
  萨尔瓦多: 'M 48,38 C 52,37 56,36 60,37 C 63,38 65,40 66,43 C 67,46 66,49 64,51 C 62,53 59,54 56,54 C 53,54 51,52 50,49 C 49,46 49,43 50,40 C 49,39 48,38 48,38 Z',
  哥伦比亚: 'M 38,44 C 46,42 55,41 64,43 C 72,45 79,50 84,57 C 87,64 88,72 86,80 C 84,87 79,93 73,97 C 67,100 60,101 54,100 C 48,99 43,96 40,91 C 37,86 36,80 37,74 C 38,68 39,62 40,56 C 39,51 38,47 38,44 Z',
  巴西: 'M 42,50 C 54,47 68,46 82,48 C 94,50 104,54 111,61 C 116,68 118,77 116,86 C 114,94 109,101 102,106 C 95,110 86,112 77,112 C 68,112 60,110 54,106 C 48,102 44,96 42,89 C 40,82 40,74 41,66 C 41,59 42,54 42,51 C 42,50 42,50 42,50 Z',
  秘鲁: 'M 35,54 C 42,52 50,51 58,52 C 65,53 71,56 75,61 C 78,66 79,72 77,78 C 75,83 71,87 66,90 C 61,92 56,93 51,92 C 46,91 42,88 40,84 C 38,80 37,75 38,70 C 39,65 40,60 40,56 C 38,55 36,54 35,54 Z',
  厄瓜多尔: 'M 38,50 C 43,49 48,48 53,49 C 57,50 60,52 62,56 C 63,60 63,64 61,68 C 59,71 56,73 53,74 C 50,74 47,73 45,71 C 43,69 42,66 42,63 C 42,60 42,57 43,54 C 42,52 40,51 38,50 Z',
  玻利维亚: 'M 45,60 C 52,58 60,57 68,58 C 75,59 81,62 85,67 C 88,72 89,78 87,84 C 85,89 81,93 76,96 C 71,98 65,99 59,98 C 53,97 49,94 47,89 C 45,84 45,78 46,72 C 46,67 46,63 45,61 C 45,60 45,60 45,60 Z',
};

export const FALLBACK_COUNTRY_PATH =
  'M 40,15 C 65,10 85,30 80,55 C 75,80 55,90 35,85 C 15,80 10,60 15,40 C 20,20 25,18 40,15 Z';

export const ORIGIN_ATLAS_CONTINENTS: OriginAtlasContinent[] = [
  {
    id: 'asia',
    name: '亚洲',
    icon: '🌏',
    color: '#D86F4C',
    path: CONTINENT_PATHS.asia,
    editorialLabel: '高地、岛链与季风山谷',
    description: '从云南山地到印尼群岛，酸质、香料感与甜感在湿热海风里不断切换。',
    cardVariant: 'split',
    countries: ['云南', '印尼', '越南', '泰国', '印度', '也门'],
  },
  {
    id: 'africa',
    name: '非洲',
    icon: '🌍',
    color: '#D6A85C',
    path: CONTINENT_PATHS.africa,
    editorialLabel: '花香基准与东非高原',
    description: '东非高原以清晰花香、莓果调和结构感著称，是精品咖啡风味的经典坐标。',
    cardVariant: 'column',
    countries: ['埃塞俄比亚', '肯尼亚', '卢旺达', '坦桑尼亚', '乌干达'],
  },
  {
    id: 'americas',
    name: '美洲',
    icon: '🌎',
    color: '#6F9F87',
    path: CONTINENT_PATHS.americas,
    editorialLabel: '火山链、雨林与安第斯山脉',
    description: '从中美洲火山土到南美山脉，坚果、巧克力与热带水果在海拔差中形成层次。',
    cardVariant: 'panorama',
    countries: ['哥伦比亚', '巴西', '危地马拉', '哥斯达黎加', '巴拿马', '秘鲁', '洪都拉斯', '尼加拉瓜', '萨尔瓦多', '墨西哥', '厄瓜多尔', '玻利维亚'],
  },
];

const continentColorMap = new Map(ORIGIN_ATLAS_CONTINENTS.map((continent) => [continent.id, continent.color]));

const COUNTRY_META: Array<Omit<OriginAtlasCountry, 'color' | 'path'>> = [
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
    id: 'thailand',
    name: '泰国',
    continentId: 'asia',
    aliases: ['thailand', 'chiang mai', 'chiang rai'],
    flavorLabel: '熟果·焦糖·明亮甜酸',
    editorialLabel: '北部山地与热带气候交叠，常呈现圆润甜感和柔和花果香。',
    accent: '#D98B6A',
    layoutVariant: 'coast',
    notableRegions: ['清迈', '清莱', 'Doi Chang'],
  },
  {
    id: 'india',
    name: '印度',
    continentId: 'asia',
    aliases: ['india', 'karnataka', 'bababudangiri'],
    flavorLabel: '香料·巧克力·低调果调',
    editorialLabel: '季风与阴影种植带来更圆润的体感，香料调是它的独特记忆点。',
    accent: '#C96D52',
    layoutVariant: 'plateau',
    notableRegions: ['卡纳塔克', '巴巴布丹吉里', 'Kerala'],
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

export const ORIGIN_ATLAS_COUNTRIES: OriginAtlasCountry[] = COUNTRY_META.map((country) => ({
  ...country,
  color: continentColorMap.get(country.continentId) ?? '#6F9F87',
  path: COUNTRY_PATHS[country.name] ?? FALLBACK_COUNTRY_PATH,
}));

export const ORIGIN_ATLAS_CONTINENT_MAP = new Map(
  ORIGIN_ATLAS_CONTINENTS.map((continent) => [continent.id, continent])
);

export const ORIGIN_ATLAS_COUNTRY_MAP = new Map(
  ORIGIN_ATLAS_COUNTRIES.map((country) => [country.name, country])
);

export const ORIGIN_ATLAS_COUNTRIES_BY_CONTINENT = new Map(
  ORIGIN_ATLAS_CONTINENTS.map((continent) => [
    continent.id,
    ORIGIN_ATLAS_COUNTRIES.filter((country) => country.continentId === continent.id),
  ])
);

function normalizeLabel(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function getCountryPath(countryName: string): string {
  return ORIGIN_ATLAS_COUNTRY_MAP.get(countryName)?.path ?? FALLBACK_COUNTRY_PATH;
}

export function getContinentPath(continentId: string): string {
  return ORIGIN_ATLAS_CONTINENT_MAP.get(continentId as OriginAtlasContinent['id'])?.path ?? CONTINENT_PATHS.americas;
}

export function getAtlasCountryByName(countryName: string): OriginAtlasCountry | null {
  return ORIGIN_ATLAS_COUNTRY_MAP.get(countryName) ?? null;
}

export function getAtlasContinentById(continentId: string): OriginAtlasContinent | null {
  return ORIGIN_ATLAS_CONTINENT_MAP.get(continentId as OriginAtlasContinent['id']) ?? null;
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

export const GEO_CONFIG = {
  VIEWBOX: '0 0 120 120',
  VIEWBOX_SIZE: 120,
  STROKE_WIDTH: 2.75,
  CONTOUR_STROKE_WIDTH: 0.8,
  ENABLE_CONTOUR_LINES: true,
};
