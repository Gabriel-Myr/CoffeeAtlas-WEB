import 'dotenv/config';
import { TaobaoSyncRepository } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/repository.ts';
import { normalizeComparisonText } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/parsers.ts';

const titles = [
  '【白鲸咖啡】C63/C136 新产季哥伦比亚前景庄园瑰夏水洗/日晒 75g',
  '【白鲸咖啡】C149 白花橙子 秘鲁 库斯科 SL09 水洗',
  '白鲸咖啡D51 印尼 苏门答腊 Sinar曼特宁 铁皮卡 湿刨处理 深烘版',
  '【白鲸咖啡】C139 花香桃子 哥斯达黎加 雪松庄园瑰夏厌氧蜜处理',
  '【白鲸咖啡】C144 花香葡萄 秘鲁 安德雷斯瑰夏日晒COE非竞拍批次',
  '【白鲸咖啡】C145 花香柑橘 哥斯达黎加 圣特雷莎 SL28 双重水洗',
  '【白鲸咖啡】C146 柠檬红茶 萨尔瓦多 巨树庄园 Lot2 瑰夏水洗',
  '【白鲸咖啡】C142 咖啡花黄柠檬 洪都拉斯 柏树庄园 瑰夏 水洗',
];

const repo = new TaobaoSyncRepository();
const binding = await repo.findBindingByRoasterName('白鲸');
if (!binding) throw new Error('binding not found');
const db = /** @type {any} */ (repo).db;

const { data, error } = await db
  .from('roaster_beans')
  .select('id, source_id, display_name, status, is_in_stock, price_amount, image_url, product_url, source_item_id, source_sku_id, updated_at')
  .eq('roaster_id', binding.roasterId)
  .in('status', ['ACTIVE', 'DRAFT'])
  .order('updated_at', { ascending: false });

if (error) throw error;

const rows = (data ?? []).filter((row) => {
  const key = normalizeComparisonText(row.display_name ?? '');
  return titles.some((title) => normalizeComparisonText(title) === key);
});

console.log(JSON.stringify(rows, null, 2));
