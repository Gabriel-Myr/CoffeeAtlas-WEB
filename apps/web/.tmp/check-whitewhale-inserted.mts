import 'dotenv/config';
import { TaobaoSyncRepository } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/repository.ts';

const repo = new TaobaoSyncRepository();
const binding = await repo.findBindingByRoasterName('白鲸');
if (!binding) throw new Error('binding not found');

const db = /** @type {any} */ (repo).db;
const { data, error } = await db
  .from('roaster_beans')
  .select('id, display_name, status, is_in_stock, price_amount, image_url, product_url, source_item_id, updated_at')
  .eq('source_id', binding.sourceId)
  .order('updated_at', { ascending: false })
  .limit(10);

if (error) throw error;
console.log(JSON.stringify(data, null, 2));
