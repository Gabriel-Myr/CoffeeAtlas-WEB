import { supabaseServer } from '@/lib/supabase';
import AllBeansClient from './AllBeansClient';

async function getBeans() {
  // 获取所有咖啡豆，按销量降序排序
  const { data: rbData, error } = await supabaseServer
    .from('roaster_beans')
    .select('id, display_name, roast_level, price_amount, price_currency, sales_count, is_in_stock, roaster_id, bean_id, image_url')
    .eq('status', 'ACTIVE')
    .order('sales_count', { ascending: false, nullsFirst: false });

  if (error || !rbData || rbData.length === 0) {
    return [];
  }

  // 获取关联的 roasters 和 beans
  const roasterIds = [...new Set(rbData.map((r) => r.roaster_id).filter(Boolean))];
  const beanIds = [...new Set(rbData.map((r) => r.bean_id).filter(Boolean))];

  const queries = [];
  if (roasterIds.length > 0) {
    queries.push(supabaseServer.from('roasters').select('id, name, city').in('id', roasterIds));
  } else {
    queries.push(Promise.resolve({ data: [], error: null }));
  }
  if (beanIds.length > 0) {
    queries.push(supabaseServer.from('beans').select('id, canonical_name, origin_country, farm, variety, process_method, flavor_tags').in('id', beanIds));
  } else {
    queries.push(Promise.resolve({ data: [], error: null }));
  }

  const [roastersRes, beansRes] = await Promise.all(queries);

  const roastersMap = new Map((roastersRes.data || []).map((r: any) => [r.id, r]));
  const beansMap = new Map((beansRes.data || []).map((b: any) => [b.id, b]));

  return rbData.map((item: any) => {
    const roaster = roastersMap.get(item.roaster_id);
    const bean = beansMap.get(item.bean_id);

    return {
      id: item.id,
      name: item.display_name,
      roasterId: item.roaster_id || '',
      roasterName: roaster?.name || '',
      city: roaster?.city || '',
      originCountry: bean?.origin_country || '',
      originRegion: '',
      farm: bean?.farm || '',
      variety: bean?.variety || '',
      process: bean?.process_method || '',
      roastLevel: item.roast_level || '',
      price: item.price_amount || 0,
      discountedPrice: item.price_amount || 0,
      currency: item.price_currency || 'CNY',
      salesCount: item.sales_count || 0,
      tastingNotes: bean?.flavor_tags || [],
      imageUrl: item.image_url || null,
      isNewArrival: false,
      isInStock: item.is_in_stock ?? true,
    };
  });
}

export default async function AllBeansPage() {
  const beans = await getBeans();
  
  // 将数据传递给客户端组件
  return <AllBeansClient beans={beans} />;
}
