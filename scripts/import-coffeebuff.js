const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lkadpxktijdtibftuuwi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYWRweGt0aWpkdGliZnR1dXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MTUxNiwiZXhwIjoyMDg2NjM3NTE2fQ.bmiravHx9Gb9EhhPTDteo-Rlr0WKN7Bi7r0dScZrdtc'
);

// 读取清洗后的数据
const workbook = XLSX.readFile('/Users/gabi/Downloads/Coffeebuff_清洗后.xlsx');
const data = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);

// 国家代码映射
const countryCodeMap = {
  '埃塞俄比亚': 'ET',
  '坦桑尼亚': 'TZ',
  '哥伦比亚': 'CO',
  '巴拿马': 'PA',
  '厄瓜多尔': 'EC',
  '肯尼亚': 'KE',
  '哥斯达黎加': 'CR',
  '卢旺达': 'RW',
  '云南': 'CN',
  '萨尔瓦多': 'SV',
  '尼加拉瓜': 'NI',
  '秘鲁': 'PE',
};

async function importData() {
  console.log('=== 开始导入数据 ===\n');

  // 1. 创建/获取 CoffeeBuff roaster
  const roasterName = 'CoffeeBuff';
  let { data: roaster, error: roasterError } = await supabase
    .from('roasters')
    .select('*')
    .ilike('name', roasterName)
    .single();

  if (!roaster) {
    const { data: newRoaster, error: createError } = await supabase
      .from('roasters')
      .insert({
        name: roasterName,
        country_code: 'CN',
        city: '上海',
        description: 'CoffeeBuff 咖啡品牌',
        website_url: 'https://coffeebuff.com',
        is_public: true
      })
      .select()
      .single();
    
    if (createError) {
      console.error('创建 roaster 失败:', createError);
      process.exit(1);
    }
    roaster = newRoaster;
    console.log(`✅ 创建烘焙商: ${roaster.name} (${roaster.id})`);
  } else {
    console.log(`✅ 已存在烘焙商: ${roaster.name} (${roaster.id})`);
  }

  // 2. 导入 beans
  let imported = 0;
  let skipped = 0;

  for (const row of data) {
    const beanName = row['商品名称'];
    const originCountry = row['产地'] || '';
    const farm = row['庄园'] || '';
    const variety = row['品种'] || '';
    const processMethod = row['处理法'] || '';
    const harvestYear = row['产季'] ? parseInt(row['产季']) : null;

    // 跳过没有产地的
    if (!originCountry) {
      console.log(`⏭️ 跳过: ${beanName} (无产地)`);
      skipped++;
      continue;
    }

    const { data: newBean, error: beanError } = await supabase
      .from('beans')
      .insert({
        canonical_name: beanName,
        origin_country: originCountry,
        farm: farm || null,
        variety: variety || null,
        process_method: processMethod || null,
        harvest_year: harvestYear,
        flavor_tags: [],
        is_public: true
      })
      .select()
      .single();

    if (beanError) {
      console.error(`❌ 导入失败: ${beanName}`, beanError);
    } else {
      console.log(`✅ 导入: ${beanName.substring(0, 40)}...`);
      imported++;
    }
  }

  console.log(`\n=== 导入完成 ===`);
  console.log(`成功: ${imported} 条`);
  console.log(`跳过: ${skipped} 条`);
}

importData().catch(console.error);
