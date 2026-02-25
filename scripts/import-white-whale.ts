import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://lkadpxktijdtibftuuwi.supabase.co';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxrYWRweGt0aWpkdGliZnR1dXdpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTA2MTUxNiwiZXhwIjoyMDg2NjM3NTE2fQ.bmiravHx9Gb9EhhPTDteo-Rlr0WKN7Bi7r0dScZrdtc';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function cleanExistingData() {
  console.log('清空现有数据...');
  await supabase.from('roaster_beans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('beans').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('bean_aliases').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('现有数据已清空');
}

async function getOrCreateRoaster(name: string) {
  const { data: existing } = await supabase.from('roasters').select('id').eq('name', name).single();
  if (existing) return existing.id;

  const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const { data, error } = await supabase.from('roasters').insert({ name, slug, is_public: true }).select('id').single();
  if (error) throw error;
  console.log('创建烘焙商:', name);
  return data.id;
}

async function importWhiteWhaleData() {
  console.log('读取 Excel 文件...');
  const workbook = XLSX.readFile('/Users/gabi/Downloads/白鲸咖啡_清洗后.xlsx');
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as Record<string, unknown>[];
  console.log('共 ' + data.length + ' 条记录');

  const roasterId = await getOrCreateRoaster('白鲸咖啡');
  console.log('导入咖啡豆数据...');

  for (const row of data) {
    const productName = String(row['商品名称'] || '');
    const flavorDesc = String(row['风味描述'] || '');
    const origin = String(row['产地'] || '');
    const farm = String(row['庄园'] || '');
    const variety = String(row['品种'] || '');
    const processMethod = String(row['处理法'] || '');
    const harvestYear = row['产季'] ? String(row['产季']).replace('产季', '').trim() : '';
    const salesCountText = String(row['销量'] || '');
    const currentPriceText = String(row['商品现价'] || '');
    const originalPriceText = String(row['商品券前价'] || '');
    const imageUrl = String(row['图片链接'] || '');
    const productUrl = String(row['商品链接'] || '');

    let harvestYearNum = null;
    const yearMatch = harvestYear.match(/\d{4}/);
    if (yearMatch) {
      harvestYearNum = parseInt(yearMatch[0]);
      if (harvestYearNum < 1990 || harvestYearNum > 2100) harvestYearNum = null;
    }

    let currentPrice = 0;
    const currentPriceMatch = currentPriceText.match(/[\d.]+/);
    if (currentPriceMatch) currentPrice = parseFloat(currentPriceMatch[0]);

    let originalPrice = 0;
    const originalPriceMatch = originalPriceText.match(/[\d.]+/);
    if (originalPriceMatch) originalPrice = parseFloat(originalPriceMatch[0]);

    const flavorTags = flavorDesc ? flavorDesc.split(/[,，、]/).map((s: string) => s.trim()).filter(Boolean) : [];

    const { data: newBean, error: beanError } = await supabase.from('beans').insert({
      canonical_name: productName,
      origin_country: origin,
      farm: farm || null,
      variety: variety || null,
      process_method: processMethod || null,
      harvest_year: harvestYearNum,
      flavor_tags: flavorTags,
      notes: salesCountText || null,
      is_public: true
    }).select('id').single();

    if (beanError) {
      console.error('创建 bean 失败: ' + productName, beanError.message);
      continue;
    }

    const beanId = newBean.id;

    const { error: roasterBeanError } = await supabase.from('roaster_beans').insert({
      roaster_id: roasterId,
      bean_id: beanId,
      display_name: productName,
      roast_level: '浅烘',
      price_amount: currentPrice,
      price_currency: 'CNY',
      product_url: productUrl || null,
      status: 'ACTIVE',
      is_in_stock: true,
      image_url: imageUrl || null,
      original_price: originalPrice || null
    });

    if (roasterBeanError) {
      console.error('创建 roaster_bean 失败: ' + productName, roasterBeanError.message);
    }
  }

  console.log('白鲸咖啡数据导入完成');
}

async function main() {
  await cleanExistingData();
  await importWhiteWhaleData();
  console.log('全部完成!');
}

main().catch(console.error);
