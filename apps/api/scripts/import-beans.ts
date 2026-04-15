import { createAdminSupabaseClient, parseImportArgs, reportScriptError } from './import-script-helpers.ts';

const SCRIPT_NAME = 'import-beans.ts';

// 烘焙商名称映射 (key: 数据库中的名称)
const roasterNameMap: Record<string, string> = {
  'LAVAZZA': 'LAVAZZA',
  'illy': 'illy',
  'UCC': 'UCC',
  "Peet's Coffee": "Peet's Coffee",
  '星巴克': 'Starbucks',
  '%Arabica': '%Arabica',
  '布蕾克Cafebreak': '布蕾克Cafebreak',
  'MANNER COFFEE': 'MANNER COFFEE',
  'M Stand': 'M Stand',
  'Seesaw': 'Seesaw',
  '挪瓦咖啡': '挪瓦咖啡',
  '麦隆咖啡': '麦隆咖啡',
  '辛鹿咖啡': '辛鹿咖啡',
  '后谷咖啡': '后谷咖啡',
  '云咖': '云咖',
  '鱼眼咖啡': '鱼眼咖啡',
  'M2M咖啡': 'M2M咖啡',
  '豆叔咖啡': '豆叔咖啡',
  '乔治队长': '乔治队长',
  '每日咖啡': '每日咖啡',
  '微焙咖啡': '微焙咖啡',
  'Manner Coffee': 'Manner Coffee'
};

// 咖啡豆基础数据
const beansData = [
  // 埃塞俄比亚系列
  { canonical_name: 'Ethiopia Yirgacheffe', canonical_name_en: 'Ethiopia Yirgacheffe', origin_country: 'Ethiopia', origin_region: 'Yirgacheffe', process_method: 'Washed', variety: 'Heirloom', flavor_tags: ['jasmine', 'lemon', 'tea', 'floral'], altitude_min_m: 1700, altitude_max_m: 2200, harvest_year: 2024 },
  { canonical_name: 'Ethiopia Sidamo', canonical_name_en: 'Ethiopia Sidamo', origin_country: 'Ethiopia', origin_region: 'Sidamo', process_method: 'Washed', variety: 'Heirloom', flavor_tags: ['blueberry', 'wine', 'citrus'], altitude_min_m: 1500, altitude_max_m: 2200, harvest_year: 2024 },
  { canonical_name: 'Ethiopia Natural', canonical_name_en: 'Ethiopia Natural', origin_country: 'Ethiopia', origin_region: 'Gedeo', process_method: 'Natural', variety: 'Heirloom', flavor_tags: ['strawberry', 'chocolate', 'sweet'], altitude_min_m: 1800, altitude_max_m: 2300, harvest_year: 2024 },

  // 哥伦比亚系列
  { canonical_name: 'Colombia Huila', canonical_name_en: 'Colombia Huila', origin_country: 'Colombia', origin_region: 'Huila', process_method: 'Washed', variety: 'Caturra', flavor_tags: ['caramel', 'orange', 'chocolate'], altitude_min_m: 1500, altitude_max_m: 1800, harvest_year: 2024 },
  { canonical_name: 'Colombia Supremo', canonical_name_en: 'Colombia Supremo', origin_country: 'Colombia', origin_region: 'Huila', process_method: 'Washed', variety: 'Castillo', flavor_tags: ['nutty', 'chocolate', 'citrus'], altitude_min_m: 1400, altitude_max_m: 1800, harvest_year: 2024 },

  // 肯尼亚系列
  { canonical_name: 'Kenya AA', canonical_name_en: 'Kenya AA', origin_country: 'Kenya', origin_region: 'Nyeri', process_method: 'Washed', variety: 'SL28', flavor_tags: ['blackcurrant', 'tomato', 'wine', 'bright'], altitude_min_m: 1500, altitude_max_m: 1900, harvest_year: 2024 },

  // 巴西系列
  { canonical_name: 'Brazil Santos', canonical_name_en: 'Brazil Santos', origin_country: 'Brazil', origin_region: 'Minas Gerais', process_method: 'Natural', variety: 'Yellow Bourbon', flavor_tags: ['nutty', 'chocolate', 'smooth'], altitude_min_m: 800, altitude_max_m: 1200, harvest_year: 2024 },

  // 危地马拉
  { canonical_name: 'Guatemala Antigua', canonical_name_en: 'Guatemala Antigua', origin_country: 'Guatemala', origin_region: 'Antigua', process_method: 'Washed', variety: 'Bourbon', flavor_tags: ['chocolate', 'spice', 'smoky'], altitude_min_m: 1500, altitude_max_m: 1700, harvest_year: 2024 },

  // 哥斯达黎加
  { canonical_name: 'Costa Rica Tarrazu', canonical_name_en: 'Costa Rica Tarrazu', origin_country: 'Costa Rica', origin_region: 'Tarrazu', process_method: 'Honey', variety: 'Catuai', flavor_tags: ['honey', 'citrus', 'sweet'], altitude_min_m: 1200, altitude_max_m: 1700, harvest_year: 2024 },

  // 云南咖啡
  { canonical_name: 'Yunnan Catimor', canonical_name_en: 'Yunnan Catimor', origin_country: 'China', origin_region: 'Yunnan', process_method: 'Washed', variety: 'Catimor', flavor_tags: ['chocolate', 'nutty', 'earthy'], altitude_min_m: 1000, altitude_max_m: 1600, harvest_year: 2024 },
  { canonical_name: 'Yunnan Purple Coffee', canonical_name_en: 'Yunnan Purple Coffee', origin_country: 'China', origin_region: 'Yunnan', process_method: 'Natural', variety: 'Purple', flavor_tags: ['fruity', 'sweet', 'floral'], altitude_min_m: 1200, altitude_max_m: 1600, harvest_year: 2024 },

  // 巴拿马
  { canonical_name: 'Panama Geisha', canonical_name_en: 'Panama Geisha', origin_country: 'Panama', origin_region: 'Boquete', process_method: 'Washed', variety: 'Geisha', flavor_tags: [' jasmine', 'peach', 'bergamot', 'floral'], altitude_min_m: 1500, altitude_max_m: 1700, harvest_year: 2024 },
];

// 每个烘焙商的产品配置
const roasterProducts: Record<string, Array<{
  beanName: string;
  displayName: string;
  roastLevel: string;
  priceAmount: number;
  priceCurrency: string;
  weightGrams: number;
  isInStock: boolean;
}>> = {
  'LAVAZZA': [
    { beanName: 'Italy Espresso Blend', displayName: '意式浓缩拼配', roastLevel: '深烘', priceAmount: 89, priceCurrency: 'CNY', weightGrams: 250, isInStock: true },
  ],
  'illy': [
    { beanName: 'illy Espresso Blend', displayName: '意式浓缩拼配', roastLevel: '中深烘', priceAmount: 128, priceCurrency: 'CNY', weightGrams: 250, isInStock: true },
  ],
  'UCC': [
    { beanName: 'Brazil Santos', displayName: '巴西单品咖啡', roastLevel: '中烘', priceAmount: 68, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
    { beanName: 'Colombia Supremo', displayName: '哥伦比亚单品咖啡', roastLevel: '中烘', priceAmount: 78, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
  ],
  "Peet's Coffee": [
    { beanName: "Peet's Major Dickason", displayName: '狄克森少校拼配', roastLevel: '深烘', priceAmount: 128, priceCurrency: 'CNY', weightGrams: 340, isInStock: true },
    { beanName: 'Ethiopia Yirgacheffe', displayName: '埃塞俄比亚耶加雪菲', roastLevel: '中烘', priceAmount: 148, priceCurrency: 'CNY', weightGrams: 227, isInStock: true },
  ],
  'Starbucks': [
    { beanName: 'Starbucks Espresso', displayName: '星巴克意式浓缩拼配', roastLevel: '中深烘', priceAmount: 95, priceCurrency: 'CNY', weightGrams: 250, isInStock: true },
    { beanName: 'Guatemala Antigua', displayName: '危地马拉安提瓜', roastLevel: '中烘', priceAmount: 108, priceCurrency: 'CNY', weightGrams: 250, isInStock: true },
  ],
  '%Arabica': [
    { beanName: 'Ethiopia Yirgacheffe', displayName: '埃塞俄比亚耶加雪菲', roastLevel: '浅烘', priceAmount: 128, priceCurrency: 'CNY', weightGrams: 150, isInStock: true },
    { beanName: 'Colombia Huila', displayName: '哥伦比亚慧兰', roastLevel: '中烘', priceAmount: 98, priceCurrency: 'CNY', weightGrams: 150, isInStock: true },
  ],
  '布蕾克Cafebreak': [
    { beanName: 'Yunnan Catimor', displayName: '云南小粒咖啡', roastLevel: '中烘', priceAmount: 68, priceCurrency: 'CNY', weightGrams: 227, isInStock: true },
    { beanName: 'Ethiopia Sidamo', displayName: '埃塞俄比亚西达摩', roastLevel: '浅烘', priceAmount: 88, priceCurrency: 'CNY', weightGrams: 227, isInStock: true },
  ],
  'MANNER COFFEE': [
    { beanName: 'Manner Espresso Blend', displayName: '意式浓缩拼配', roastLevel: '中深烘', priceAmount: 75, priceCurrency: 'CNY', weightGrams: 250, isInStock: true },
    { beanName: 'Ethiopia Natural', displayName: '埃塞俄比亚日晒', roastLevel: '浅烘', priceAmount: 85, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
  ],
  'M Stand': [
    { beanName: 'Colombia Huila', displayName: '哥伦比亚慧兰', roastLevel: '中烘', priceAmount: 88, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
    { beanName: 'Kenya AA', displayName: '肯尼亚AA', roastLevel: '中烘', priceAmount: 108, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
  ],
  'Seesaw': [
    { beanName: 'Ethiopia Yirgacheffe', displayName: '埃塞俄比亚耶加雪菲', roastLevel: '浅烘', priceAmount: 98, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
    { beanName: 'Yunnan Catimor', displayName: '云南咖啡', roastLevel: '中烘', priceAmount: 68, priceCurrency: 'CNY', weightGrams: 227, isInStock: true },
  ],
  '挪瓦咖啡': [
    { beanName: 'Nowwa Espresso Blend', displayName: '意式浓缩拼配', roastLevel: '中深烘', priceAmount: 59, priceCurrency: 'CNY', weightGrams: 250, isInStock: true },
    { beanName: 'Brazil Santos', displayName: '巴西单品咖啡', roastLevel: '中烘', priceAmount: 49, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
  ],
  '麦隆咖啡': [
    { beanName: 'Colombia Huila', displayName: '哥伦比亚慧兰', roastLevel: '中烘', priceAmount: 78, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
    { beanName: 'Costa Rica Tarrazu', displayName: '哥斯达黎加塔拉珠', roastLevel: '中烘', priceAmount: 88, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
  ],
  '辛鹿咖啡': [
    { beanName: 'Yunnan Catimor', displayName: '云南咖啡', roastLevel: '中烘', priceAmount: 45, priceCurrency: 'CNY', weightGrams: 227, isInStock: true },
    { beanName: 'Ethiopia Sidamo', displayName: '埃塞俄比亚西达摩', roastLevel: '浅烘', priceAmount: 65, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
  ],
  '后谷咖啡': [
    { beanName: 'Yunnan Catimor', displayName: '德宏后谷小粒咖啡', roastLevel: '中烘', priceAmount: 39, priceCurrency: 'CNY', weightGrams: 250, isInStock: true },
    { beanName: 'Yunnan Purple Coffee', displayName: '云南紫咖啡', roastLevel: '浅烘', priceAmount: 58, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
  ],
  '云咖': [
    { beanName: 'Yunnan Catimor', displayName: '云南阿拉比卡', roastLevel: '中烘', priceAmount: 35, priceCurrency: 'CNY', weightGrams: 250, isInStock: true },
    { beanName: 'Yunnan Catimor', displayName: '云南罗布斯塔', roastLevel: '深烘', priceAmount: 28, priceCurrency: 'CNY', weightGrams: 250, isInStock: true },
  ],
  '鱼眼咖啡': [
    { beanName: 'Ethiopia Yirgacheffe', displayName: '埃塞俄比亚耶加雪菲', roastLevel: '浅烘', priceAmount: 98, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
    { beanName: 'Colombia Huila', displayName: '哥伦比亚慧兰', roastLevel: '中烘', priceAmount: 78, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
  ],
  'M2M咖啡': [
    { beanName: 'M2M Espresso Blend', displayName: '意式浓缩拼配', roastLevel: '中深烘', priceAmount: 88, priceCurrency: 'CNY', weightGrams: 250, isInStock: true },
    { beanName: 'Ethiopia Natural', displayName: '埃塞俄比亚日晒', roastLevel: '浅烘', priceAmount: 98, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
  ],
  '豆叔咖啡': [
    { beanName: 'Brazil Santos', displayName: '巴西单品咖啡', roastLevel: '中烘', priceAmount: 58, priceCurrency: 'CNY', weightGrams: 227, isInStock: true },
    { beanName: 'Colombia Supremo', displayName: '哥伦比亚单品', roastLevel: '中烘', priceAmount: 68, priceCurrency: 'CNY', weightGrams: 227, isInStock: true },
  ],
  '乔治队长': [
    { beanName: 'Ethiopia Yirgacheffe', displayName: '埃塞俄比亚耶加雪菲', roastLevel: '浅烘', priceAmount: 118, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
    { beanName: 'Kenya AA', displayName: '肯尼亚AA', roastLevel: '中烘', priceAmount: 138, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
  ],
  '每日咖啡': [
    { beanName: 'Daily Espresso Blend', displayName: '意式浓缩拼配', roastLevel: '中深烘', priceAmount: 55, priceCurrency: 'CNY', weightGrams: 250, isInStock: true },
    { beanName: 'Brazil Santos', displayName: '巴西单品咖啡', roastLevel: '中烘', priceAmount: 45, priceCurrency: 'CNY', weightGrams: 200, isInStock: true },
  ],
  '微焙咖啡': [
    { beanName: 'Panama Geisha', displayName: '巴拿马瑰夏', roastLevel: '浅烘', priceAmount: 268, priceCurrency: 'CNY', weightGrams: 100, isInStock: true },
    { beanName: 'Ethiopia Yirgacheffe', displayName: '埃塞俄比亚耶加雪菲', roastLevel: '浅烘', priceAmount: 108, priceCurrency: 'CNY', weightGrams: 150, isInStock: true },
  ],
  'Manner Coffee': [
    { beanName: 'Manner House Blend', displayName: '澳洲家庭拼配', roastLevel: '中烘', priceAmount: 25, priceCurrency: 'AUD', weightGrams: 250, isInStock: true },
    { beanName: 'Ethiopia Sidamo', displayName: '埃塞俄比亚西达摩', roastLevel: '浅烘', priceAmount: 28, priceCurrency: 'AUD', weightGrams: 200, isInStock: true },
  ],
};

// 创建不在beans表中的咖啡豆数据
const newBeanNames = [
  { canonical_name: 'Italy Espresso Blend', canonical_name_en: 'Italian Espresso Blend', origin_country: 'Blend', origin_region: 'Blend', process_method: 'Washed', variety: 'Blend', flavor_tags: ['chocolate', 'nutty', 'bold'], altitude_min_m: null, altitude_max_m: null, harvest_year: null },
  { canonical_name: 'illy Espresso Blend', canonical_name_en: 'illy Espresso Blend', origin_country: 'Blend', origin_region: 'Blend', process_method: 'Washed', variety: 'Blend', flavor_tags: ['chocolate', 'caramel', 'smooth'], altitude_min_m: null, altitude_max_m: null, harvest_year: null },
  { canonical_name: "Peet's Major Dickason", canonical_name_en: "Peet's Major Dickason's Blend", origin_country: 'Blend', origin_region: 'Blend', process_method: 'Washed', variety: 'Blend', flavor_tags: ['chocolate', 'spice', 'bold'], altitude_min_m: null, altitude_max_m: null, harvest_year: null },
  { canonical_name: 'Starbucks Espresso', canonical_name_en: 'Starbucks Espresso Blend', origin_country: 'Blend', origin_region: 'Blend', process_method: 'Washed', variety: 'Blend', flavor_tags: ['chocolate', 'caramel', 'bold'], altitude_min_m: null, altitude_max_m: null, harvest_year: null },
  { canonical_name: 'Nowwa Espresso Blend', canonical_name_en: 'Nowwa Espresso Blend', origin_country: 'Blend', origin_region: 'Blend', process_method: 'Washed', variety: 'Blend', flavor_tags: ['chocolate', 'nutty', 'smooth'], altitude_min_m: null, altitude_max_m: null, harvest_year: null },
  { canonical_name: 'Manner Espresso Blend', canonical_name_en: 'Manner Espresso Blend', origin_country: 'Blend', origin_region: 'Blend', process_method: 'Washed', variety: 'Blend', flavor_tags: ['chocolate', 'caramel', 'balanced'], altitude_min_m: null, altitude_max_m: null, harvest_year: null },
  { canonical_name: 'M2M Espresso Blend', canonical_name_en: 'M2M Espresso Blend', origin_country: 'Blend', origin_region: 'Blend', process_method: 'Washed', variety: 'Blend', flavor_tags: ['chocolate', 'fruity', 'complex'], altitude_min_m: null, altitude_max_m: null, harvest_year: null },
  { canonical_name: 'M2M Espresso Blend', canonical_name_en: 'M2M Espresso Blend', origin_country: 'Blend', origin_region: 'Blend', process_method: 'Washed', variety: 'Blend', flavor_tags: ['chocolate', 'fruity', 'complex'], altitude_min_m: null, altitude_max_m: null, harvest_year: null },
  { canonical_name: 'Daily Espresso Blend', canonical_name_en: 'Daily Espresso Blend', origin_country: 'Blend', origin_region: 'Blend', process_method: 'Washed', variety: 'Blend', flavor_tags: ['chocolate', 'nutty', 'balanced'], altitude_min_m: null, altitude_max_m: null, harvest_year: null },
  { canonical_name: 'Manner House Blend', canonical_name_en: 'Manner House Blend', origin_country: 'Blend', origin_region: 'Blend', process_method: 'Washed', variety: 'Blend', flavor_tags: ['chocolate', 'caramel', 'smooth'], altitude_min_m: null, altitude_max_m: null, harvest_year: null },
];

// 去重newBeanNames
const uniqueNewBeans = newBeanNames.filter((bean, index, self) =>
  index === self.findIndex((b) => b.canonical_name === bean.canonical_name)
);

async function main() {
  parseImportArgs(process.argv.slice(2), { scriptName: SCRIPT_NAME, allowInput: false });
  const supabase = createAdminSupabaseClient();

  console.log('=== 开始导入咖啡豆产品数据 ===\n');

  // 1. 获取所有烘焙商
  const { data: roasters, error: roastersError } = await supabase
    .from('roasters')
    .select('id, name');

  if (roastersError) {
    console.error('获取烘焙商失败:', roastersError);
    process.exit(1);
  }

  console.log(`获取到 ${roasters.length} 家烘焙商`);

  // 2. 获取现有咖啡豆
  const { data: allBeans, error: allBeansError } = await supabase
    .from('beans')
    .select('id, canonical_name');

  if (allBeansError) {
    console.error('获取咖啡豆失败:', allBeansError);
    process.exit(1);
  }

  // 创建现有咖啡豆ID映射
  const beanIdMap = new Map<string, string>();
  allBeans?.forEach(bean => {
    beanIdMap.set(bean.canonical_name, bean.id);
  });

  console.log(`现有 ${allBeans?.length || 0} 款咖啡豆基础数据`);

  // 3. 插入新的咖啡豆基础数据
  const beansToInsert = [];
  for (const bean of beansData) {
    const existing = beanIdMap.get(bean.canonical_name);
    if (!existing) {
      beansToInsert.push(bean);
    }
  }

  if (beansToInsert.length > 0) {
    const { data: insertedBeans, error: beansError } = await supabase
      .from('beans')
      .insert(beansToInsert)
      .select();

    if (beansError) {
      console.error('插入咖啡豆基础数据失败:', beansError);
      process.exit(1);
    }

    console.log(`插入 ${insertedBeans?.length || 0} 款新的咖啡豆基础数据`);

    // 更新beanIdMap
    insertedBeans?.forEach(bean => {
      beanIdMap.set(bean.canonical_name, bean.id);
    });
  } else {
    console.log('所有咖啡豆数据已存在，跳过插入');
  }

  // 4. 准备roaster_beans数据
  const roasterBeansData: Array<{
    roaster_id: string;
    bean_id: string;
    display_name: string;
    roast_level: string;
    price_amount: number;
    price_currency: string;
    weight_grams: number;
    status: string;
    is_in_stock: boolean;
  }> = [];

  for (const roaster of roasters) {
    const products = roasterProducts[roaster.name];
    if (!products) continue;

    for (const product of products) {
      const beanId = beanIdMap.get(product.beanName);
      if (!beanId) {
        console.warn(`警告: 未找到咖啡豆 ${product.beanName} 的ID`);
        continue;
      }

      roasterBeansData.push({
        roaster_id: roaster.id,
        bean_id: beanId,
        display_name: product.displayName,
        roast_level: product.roastLevel,
        price_amount: product.priceAmount,
        price_currency: product.priceCurrency,
        weight_grams: product.weightGrams,
        status: 'ACTIVE',
        is_in_stock: product.isInStock
      });
    }
  }

  console.log(`准备插入 ${roasterBeansData.length} 条roaster_beans数据`);

  // 5. 获取现有的roaster_beans数据
  const { data: existingRoasterBeans } = await supabase
    .from('roaster_beans')
    .select('roaster_id, bean_id, display_name');

  const existingSet = new Set<string>();
  existingRoasterBeans?.forEach(rb => {
    existingSet.add(`${rb.roaster_id}-${rb.bean_id}-${rb.display_name}`);
  });

  // 过滤掉已存在的
  const newRoasterBeansData = roasterBeansData.filter(rb => {
    return !existingSet.has(`${rb.roaster_id}-${rb.bean_id}-${rb.display_name}`);
  });

  console.log(`其中 ${newRoasterBeansData.length} 条为新数据`);

  // 5. 插入roaster_beans数据
  let insertedCount = 0;
  if (newRoasterBeansData.length > 0) {
    const { data: insertedRoasterBeans, error: roasterBeansError } = await supabase
      .from('roaster_beans')
      .insert(newRoasterBeansData)
      .select();

    insertedCount = insertedRoasterBeans?.length || 0;

    if (roasterBeansError) {
      console.error('插入roaster_beans数据失败:', roasterBeansError);
      process.exit(1);
    }

    console.log(`成功插入 ${insertedCount} 条roaster_beans数据`);
  } else {
    console.log('所有roaster_beans数据已存在，跳过插入');
  }

  console.log(`\n=== 导入完成! ===`);
  console.log(`成功插入 ${insertedCount} 条roaster_beans数据`);

  // 6. 统计结果
  const { data: finalRoasterBeans } = await supabase
    .from('roaster_beans')
    .select('*, roasters(name), beans(canonical_name)');

  console.log(`\n总计 roaster_beans 数量: ${finalRoasterBeans?.length || 0}`);
}

main().catch((error) => {
  reportScriptError(SCRIPT_NAME, error);
});
