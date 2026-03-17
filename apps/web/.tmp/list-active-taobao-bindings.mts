import 'dotenv/config';
import { TaobaoSyncRepository } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/taobao-sync/repository.ts';

const repo = new TaobaoSyncRepository();
const bindings = await repo.listActiveBindings();
console.log(JSON.stringify(bindings.map((b) => ({ id: b.id, roasterName: b.roasterName, shopName: b.canonicalShopName })), null, 2));
