import HomePageClient from './HomePageClient';
import { getCatalogBeans } from '@/lib/catalog';

export default async function HomePage() {
  const initialBeans = await getCatalogBeans(50);

  return <HomePageClient initialBeans={initialBeans} />;
}
