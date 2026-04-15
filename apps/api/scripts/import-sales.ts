import * as XLSX from 'xlsx';

import { createAdminSupabaseClient, parseImportArgs, reportScriptError } from './import-script-helpers.ts';

const SCRIPT_NAME = 'import-sales.ts';

async function importSalesAndPrice(inputFile: string) {
  const supabase = createAdminSupabaseClient();

  console.log(`读取 Excel 文件: ${inputFile}`);
  const workbook = XLSX.readFile(inputFile);
  const sheetName = workbook.SheetNames[0];
  const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as Record<string, unknown>[];
  console.log('共 ' + data.length + ' 条记录');

  let updatedCount = 0;
  let skippedCount = 0;

  for (const row of data) {
    const productName = String(row['商品名称'] || '');
    const salesText = String(row['销量'] || '');
    const currentPriceText = String(row['商品现价'] || '');
    const imageUrl = String(row['图片链接'] || '');

    // 解析销量
    let salesCount = 0;
    if (salesText) {
      const salesMatch = String(salesText).match(/\d+/);
      if (salesMatch) {
        salesCount = parseInt(salesMatch[0], 10);
      }
    }

    // 解析价格（券后价）
    let priceAmount = null;
    if (currentPriceText) {
      const priceMatch = String(currentPriceText).replace(/[^\d.]/g, '').match(/[\d.]+/);
      if (priceMatch) {
        priceAmount = parseFloat(priceMatch[0]);
      }
    }

    // 查找匹配的 roaster_bean
    const { data: roasterBeans, error: searchError } = await supabase
      .from('roaster_beans')
      .select('id, display_name')
      .ilike('display_name', '%' + productName.replace(/【白鲸咖啡】/g, '').substring(0, 20) + '%')
      .limit(1);

    if (searchError) {
      console.error('搜索错误: ' + productName, searchError.message);
      continue;
    }

    if (!roasterBeans || roasterBeans.length === 0) {
      console.log('未找到匹配: ' + productName);
      skippedCount++;
      continue;
    }

    const roasterBeanId = roasterBeans[0].id;

    // 更新销量、价格和图片
    const updateData: any = {};
    if (salesCount > 0) {
      updateData.sales_count = salesCount;
    }
    if (priceAmount !== null) {
      updateData.price_amount = priceAmount;
    }
    if (imageUrl) {
      updateData.image_url = imageUrl;
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from('roaster_beans')
        .update(updateData)
        .eq('id', roasterBeanId);

      if (updateError) {
        console.error('更新失败: ' + productName, updateError.message);
      } else {
        console.log(`更新成功: ${productName.substring(0, 30)}... - 销量: ${salesCount}, 价格: ${priceAmount}, 图片: ${imageUrl ? '有' : '无'}`);
        updatedCount++;
      }
    }
  }

  console.log(`\n导入完成! 更新: ${updatedCount} 条, 跳过: ${skippedCount} 条`);
}

async function main() {
  const args = parseImportArgs(process.argv.slice(2), { scriptName: SCRIPT_NAME, allowInput: true });
  await importSalesAndPrice(args.input!);
  console.log('全部完成!');
}

main().catch((error) => {
  reportScriptError(SCRIPT_NAME, error);
});
