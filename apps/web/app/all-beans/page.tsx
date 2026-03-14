import AllBeansClient from './AllBeansClient';
import { getCatalogBeans } from '@/lib/catalog';

export default async function AllBeansPage() {
  const beans = await getCatalogBeans();

  return <AllBeansClient beans={beans} />;
}
