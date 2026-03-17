import 'dotenv/config';
import { listBeansV1 } from '/Users/gabi/CoffeeAtlas-Web/apps/web/lib/server/public-api.ts';

const result = await listBeansV1({
  page: 1,
  pageSize: 50,
  sort: 'updated_desc',
  isNewArrival: true,
});

console.log(JSON.stringify({
  total: result.pageInfo.total,
  count: result.items.length,
  items: result.items.map((item) => ({
    id: item.id,
    name: item.name,
    roasterName: item.roasterName,
    isNewArrival: item.isNewArrival,
  })),
}, null, 2));
