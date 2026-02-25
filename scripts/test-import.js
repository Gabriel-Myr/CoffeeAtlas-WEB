const XLSX = require('xlsx');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://lkadpxktijdtibftuuwi.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYWRweGt0aWpkdGliZnR1dXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MTUxNiwiZXhwIjoyMDg2NjM3NTE2fQ.bmiravHx9Gb9EhhPTDteo-Rlr0WKN7Bi7r0dScZrdtc'
);

const wb = XLSX.readFile('/Users/gabi/Downloads/Coffeebuff_清洗后.xlsx');
const data = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);

async function importWithDebug() {
  // 获取或创建 CoffeeBuff roaster
  let { data: roaster } = await supabase.from('roasters').select('*').ilike('name', 'CoffeeBuff').single();
  if (!roaster) {
    ({ data: roaster } = await supabase.from('roasters').insert({ name: 'CoffeeBuff', country_code: 'CN', city: '上海' }).select().single());
  }
  console.log('Roaster:', roaster.id);

  // 删除旧的 CoffeeBuff 数据
  const { data: old } = await supabase.from('beans').select('id').ilike('canonical_name', '%CoffeeBuff%');
  if (old && old.length > 0) {
    for (const b of old) {
      await supabase.from('beans').delete().eq('id', b.id);
    }
    console.log('Deleted', old.length, 'old records');
  }

  // 逐条导入并检查前5条
  for (const row of data.slice(0, 5)) {
    const farm = row['庄园'] || '';
    const variety = row['品种'] || '';
    const processMethod = row['处理法'] || '';
    
    console.log(`\n导入: ${row['商品名称'].substring(0,30)}...`);
    console.log(`  farm='${farm}' variety='${variety}' process='${processMethod}'`);
    
    const { data: newBean, error } = await supabase.from('beans').insert({
      canonical_name: row['商品名称'],
      origin_country: row['产地'] || '未知',
      farm: farm || null,
      variety: variety || null,
      process_method: processMethod || null,
      is_public: true,
      flavor_tags: []
    }).select().single();
    
    if (error) {
      console.log('  Error:', error.message);
    } else {
      console.log(`  ✅ farm=${newBean.farm} variety=${newBean.variety}`);
    }
  }
  
  console.log('\n=== 检查导入结果 ===');
  const { data: check } = await supabase.from('beans').select('canonical_name, farm, variety').ilike('canonical_name', '%CoffeeBuff%').limit(5);
  check.forEach(b => console.log(`  farm=${b.farm} variety=${b.variety} | ${b.canonical_name.substring(0,30)}`));
}

importWithDebug().catch(console.error);
