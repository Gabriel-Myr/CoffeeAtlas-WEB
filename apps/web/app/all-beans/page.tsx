import AllBeansClient from './AllBeansClient';
import { getCatalogBeans } from '@/lib/catalog';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AllBeansPage() {
  const beans = await getCatalogBeans();

  return <AllBeansClient beans={beans} />;
}
