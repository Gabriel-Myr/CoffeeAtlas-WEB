import { useState, useMemo, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { useReachBottom } from '@tarojs/taro';
import SearchBar from '../../components/SearchBar';
import BeanCard from '../../components/BeanCard';
import EmptyState from '../../components/EmptyState';
import { getBeans } from '../../services/api';
import type { CoffeeBean } from '../../types';
import './index.scss';

type TabKey = 'discover' | 'sales' | 'new';

const CONTINENTS = [
  { id: 'asia', name: '亚洲', icon: '🌏', color: '#E07A5F', countries: ['云南', '印尼', '越南', '泰国', '印度', '也门'] },
  { id: 'africa', name: '非洲', icon: '🌍', color: '#F2CC8F', countries: ['埃塞俄比亚', '肯尼亚', '卢旺达', '坦桑尼亚', '乌干达'] },
  { id: 'americas', name: '美洲', icon: '🌎', color: '#81B29A', countries: ['哥伦比亚', '巴西', '危地马拉', '哥斯达黎加', '巴拿马', '秘鲁', '洪都拉斯', '尼加拉瓜', '萨尔瓦多', '墨西哥', '厄瓜多尔', '玻利维亚'] },
];

const CONTINENT_PATHS: Record<string, string> = {
  americas: 'M 15,5 C 35,-5 60,5 65,15 C 68,25 55,35 52,45 C 50,55 65,60 70,70 C 75,85 60,98 52,95 C 45,90 38,75 35,65 C 32,55 25,50 22,40 C 18,30 5,15 15,5 Z',
  africa: 'M 42,12 C 55,10 75,18 85,32 C 95,45 88,60 80,72 C 70,85 62,95 52,95 C 45,95 40,85 35,75 C 25,60 12,50 15,38 C 18,28 28,25 32,22 C 35,18 38,15 42,12 Z',
  asia: 'M 35,15 C 60,5 88,10 92,30 C 95,45 85,60 80,75 C 75,90 60,95 50,85 C 40,75 32,70 25,60 C 15,50 12,35 18,25 C 22,18 28,18 35,15 Z',
};

const COUNTRY_PATHS: Record<string, string> = {
  '云南': 'M 45,15 C 60,12 75,18 82,30 C 88,40 82,55 75,70 C 68,85 55,92 45,88 C 30,82 20,70 18,55 C 15,40 18,25 30,18 C 35,15 40,16 45,15 Z',
  '印尼': 'M 15,45 C 25,40 35,50 45,45 C 55,40 65,48 75,45 C 85,42 92,55 88,62 C 80,68 70,62 60,65 C 50,68 40,60 30,65 C 20,70 10,60 15,45 Z',
  '越南': 'M 45,10 C 60,12 65,25 60,40 C 55,55 68,70 65,85 C 62,95 48,95 42,85 C 38,75 48,60 45,45 C 42,30 35,15 45,10 Z',
  '泰国': 'M 35,15 C 55,10 75,20 75,35 C 75,45 65,55 60,70 C 55,85 52,95 45,95 C 38,95 38,80 42,65 C 45,55 35,45 28,35 C 22,25 25,18 35,15 Z',
  '印度': 'M 35,15 C 55,12 75,25 80,40 C 85,55 70,75 60,88 C 55,95 45,95 40,88 C 30,75 15,55 20,40 C 25,25 25,18 35,15 Z',
  '也门': 'M 25,45 C 45,40 70,42 85,55 C 90,65 75,80 60,85 C 45,90 25,85 15,70 C 10,60 15,50 25,45 Z',
  '埃塞俄比亚': 'M 45,15 C 65,18 85,30 90,45 C 95,60 80,75 65,85 C 50,95 35,85 25,70 C 15,55 25,35 35,22 C 38,18 42,16 45,15 Z',
  '肯尼亚': 'M 35,20 C 55,15 75,25 82,45 C 88,65 75,85 55,90 C 35,95 20,75 18,55 C 15,35 25,25 35,20 Z',
  '卢旺达': 'M 50,25 C 70,25 80,45 75,65 C 70,85 45,90 30,75 C 15,60 25,35 50,25 Z',
  '坦桑尼亚': 'M 40,15 C 65,15 85,30 82,55 C 80,80 60,95 40,90 C 20,85 15,60 22,40 C 25,25 30,18 40,15 Z',
  '乌干达': 'M 45,20 C 65,22 75,40 70,60 C 65,80 45,90 30,75 C 15,60 20,35 45,20 Z',
  '哥伦比亚': 'M 35,15 C 55,10 75,25 80,45 C 85,65 70,85 55,92 C 40,98 25,80 20,60 C 15,40 20,20 35,15 Z',
  '巴西': 'M 40,10 C 65,8 85,25 92,45 C 98,65 80,85 60,95 C 40,105 25,80 18,60 C 12,40 20,15 40,10 Z',
  '危地马拉': 'M 40,15 C 65,15 75,35 70,55 C 65,75 45,90 25,80 C 15,75 20,45 30,25 C 35,18 38,16 40,15 Z',
  '哥斯达黎加': 'M 20,30 C 40,25 65,45 80,60 C 85,65 80,80 65,85 C 50,90 25,70 15,50 C 10,40 15,35 20,30 Z',
  '巴拿马': 'M 15,45 C 35,35 65,35 85,45 C 95,50 85,65 70,65 C 50,65 25,75 15,60 C 8,50 10,48 15,45 Z',
  '秘鲁': 'M 35,15 C 55,20 70,40 75,60 C 80,80 65,95 45,90 C 25,85 15,65 18,45 C 20,25 25,18 35,15 Z',
  '洪都拉斯': 'M 20,30 C 45,25 75,30 85,45 C 90,55 75,70 55,75 C 35,80 15,65 12,50 C 10,40 15,35 20,30 Z',
  '尼加拉瓜': 'M 25,30 C 50,25 75,35 82,50 C 88,65 70,80 50,82 C 30,85 12,70 10,52 C 8,40 15,35 25,30 Z',
  '萨尔瓦多': 'M 20,35 C 45,28 75,38 85,55 C 88,65 70,78 48,80 C 28,82 12,68 12,52 C 12,42 15,38 20,35 Z',
  '墨西哥': 'M 15,20 C 40,12 70,18 88,35 C 95,48 85,65 65,75 C 45,85 20,72 12,55 C 5,40 8,28 15,20 Z',
  '厄瓜多尔': 'M 35,20 C 60,18 78,35 75,55 C 72,75 52,88 32,82 C 15,75 12,55 18,38 C 22,25 28,22 35,20 Z',
  '玻利维亚': 'M 30,18 C 55,15 78,28 82,50 C 85,72 65,90 42,88 C 20,85 12,65 15,45 C 18,28 22,20 30,18 Z',
};

const FALLBACK_PATH = 'M 40,15 C 65,10 85,30 80,55 C 75,80 55,90 35,85 C 15,80 10,60 15,40 C 20,20 25,18 40,15 Z';

const COUNTRY_DETAILS: Record<string, { icon: string; flavors: string }> = {
  '云南': { icon: '🍃', flavors: '茶感·木质·甘蔗甜' },
  '印尼': { icon: '🌴', flavors: '泥土·药草·醇厚' },
  '越南': { icon: '☕', flavors: '浓郁·苦甜·平衡' },
  '泰国': { icon: '🏝️', flavors: '水果·酸甜·明亮' },
  '印度': { icon: '🌺', flavors: '香料·巧克力·醇厚' },
  '也门': { icon: '🕌', flavors: '红酒果香·复杂·神秘' },
  '埃塞俄比亚': { icon: '🌸', flavors: '柑橘·花香·莓果' },
  '肯尼亚': { icon: '🍅', flavors: '番茄·黑醋栗·明亮酸' },
  '卢旺达': { icon: '💐', flavors: '花香·柠檬·蜂蜜' },
  '坦桑尼亚': { icon: '🏔️', flavors: '黑莓·巧克力·明亮' },
  '乌干达': { icon: '🦍', flavors: '泥土·果香·醇厚' },
  '哥伦比亚': { icon: '🏔️', flavors: '坚果·巧克力·焦糖' },
  '巴西': { icon: '☕', flavors: '巧克力·坚果·平衡' },
  '危地马拉': { icon: '🏕️', flavors: '蜂蜜·可可·柔和酸' },
  '哥斯达黎加': { icon: '🌋', flavors: '柑橘·蜂蜜·明亮' },
  '巴拿马': { icon: '🌴', flavors: '茉莉花香·佛手柑·茶感' },
  '秘鲁': { icon: '🏞️', flavors: '坚果·柑橘·平衡' },
  '洪都拉斯': { icon: '🌾', flavors: '焦糖·坚果·柔和' },
  '尼加拉瓜': { icon: '🏔️', flavors: '巧克力·香料·醇厚' },
  '萨尔瓦多': { icon: '🌺', flavors: '柑橘·花香·优雅' },
  '墨西哥': { icon: '🌵', flavors: '坚果·巧克力·温和' },
  '厄瓜多尔': { icon: '🦙', flavors: '柑橘·红糖·明亮' },
  '玻利维亚': { icon: '🏔️', flavors: '花香·水果·稀有' },
};

function makeSvgUri(path: string, color: string, isLarge = false): string {
  const inner = isLarge
    ? `<path d="${path}" fill="none" stroke="${color}" stroke-width="0.8" transform="scale(0.8) translate(12,12)" opacity="0.4" stroke-dasharray="3 3"/>`
    : '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><path d="${path}" fill="${color}" opacity="0.25" transform="translate(0,4)"/><path d="${path}" fill="${color}15" stroke="${color}" stroke-width="${isLarge ? '1.5' : '2.5'}" stroke-linejoin="round" stroke-linecap="round"/>${inner}</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export default function Index() {
  const [activeTab, setActiveTab] = useState<TabKey>('discover');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadBeans();
  }, []);

  useEffect(() => {
    if (activeTab !== 'discover' && beans.length === 0) loadBeans();
  }, [activeTab]);

  const loadBeans = async () => {
    if (loading) return;
    setLoading(true);
    setErrorMessage('');
    try {
      const res = await getBeans({ pageSize: 50 });
      setBeans(res.items ?? []);
    } catch (error) {
      const message = error instanceof Error ? error.message : '加载失败';
      setErrorMessage(message);
      Taro.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  useReachBottom(() => {
    if (activeTab !== 'discover' && !loading) loadBeans();
  });

  const filteredBeans = useMemo(() => {
    let result = [...beans];
    if (activeTab === 'new') result = result.filter((b) => b.isNewArrival);
    else if (activeTab === 'sales') result.sort((a, b) => b.salesCount - a.salesCount);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (b) => b.name.toLowerCase().includes(q) || b.originCountry.toLowerCase().includes(q) || b.roasterName.toLowerCase().includes(q)
      );
    }
    return result;
  }, [beans, activeTab, searchQuery]);

  const countryBeans = (name: string) =>
    beans.filter((b) => b.originCountry?.includes(name) || b.name?.includes(name));

  const continentBeanCount = (cont: typeof CONTINENTS[0]) =>
    beans.filter((b) => cont.countries.some((c) => b.originCountry?.includes(c))).length;

  const activeCont = CONTINENTS.find((c) => c.id === selectedContinent);

  const handleBack = () => {
    if (selectedCountry) setSelectedCountry(null);
    else setSelectedContinent(null);
  };

  const handleTabChange = (tab: TabKey) => {
    setActiveTab(tab);
    setSelectedContinent(null);
    setSelectedCountry(null);
  };

  return (
    <View className="index-page">
      <View className="index-page__header">
        <Text className="index-page__title-en">COFFEE</Text>
        <Text className="index-page__title-atlas">Atlas</Text>
        <Text className="index-page__subtitle">探索精品咖啡与全球风味</Text>
      </View>

      <SearchBar value={searchQuery} placeholder="按烘焙商、产地或豆种搜索..." onInput={setSearchQuery} />

      <View className="index-page__tabs">
        {(['discover', 'sales', 'new'] as TabKey[]).map((tab) => (
          <View key={tab} className={`index-page__tab ${activeTab === tab ? 'index-page__tab--active' : ''}`} onClick={() => handleTabChange(tab)}>
            <Text className="index-page__tab-text">
              {tab === 'discover' ? '发现' : tab === 'sales' ? '销量' : '新品'}
            </Text>
          </View>
        ))}
      </View>

      <View className="index-page__content">
        {errorMessage && activeTab === 'discover' ? (
          <View className="index-page__notice">
            <Text className="index-page__notice-label">开发提示</Text>
            <Text className="index-page__notice-text">{errorMessage}</Text>
          </View>
        ) : null}
        {activeTab === 'discover' && (
          <View className="discover">
            {(selectedContinent || selectedCountry) && (
              <View className="discover__nav" onClick={handleBack}>
                <Text className="discover__nav-back">←</Text>
                <View className="discover__nav-info">
                  <Text className="discover__nav-title">
                    {selectedCountry ?? activeCont?.name}
                  </Text>
                  <Text className="discover__nav-sub">
                    {selectedCountry ? '选择咖啡豆' : '选择产区'}
                  </Text>
                </View>
              </View>
            )}

            {!selectedContinent && (
              <View className="discover__continents">
                {CONTINENTS.map((cont, index) => (
                  <View key={cont.id} className="continent-card" hoverClass="continent-card-active" hoverStartTime={20} hoverStayTime={70} style={{ animationDelay: `${index * 0.1}s` }} onClick={() => setSelectedContinent(cont.id)}>
                    <View className="continent-card__map">
                      <Image src={makeSvgUri(CONTINENT_PATHS[cont.id], cont.color)} className="continent-card__svg" mode="aspectFit" />
                    </View>
                    <View className="continent-card__body">
                      <Text className="continent-card__name">{cont.name}</Text>
                      <View className="continent-card__meta">
                        <View className="continent-card__dot" style={{ backgroundColor: cont.color }} />
                        <Text className="continent-card__count">{continentBeanCount(cont)} 款</Text>
                      </View>
                    </View>
                    <Text className="continent-card__arrow">›</Text>
                  </View>
                ))}
              </View>
            )}

            {selectedContinent && !selectedCountry && activeCont && (
              <View className="discover__countries">
                {activeCont.countries.map((country, index) => (
                  <View key={country} className="country-card" hoverClass="country-card-active" hoverStartTime={20} hoverStayTime={70} style={{ animationDelay: `${0.05 + index * 0.07}s` }} onClick={() => setSelectedCountry(country)}>
                    <View className="country-card__map">
                      <Image src={makeSvgUri(COUNTRY_PATHS[country] ?? FALLBACK_PATH, activeCont.color, true)} className="country-card__svg" mode="aspectFit" />
                    </View>
                    <View className="country-card__body">
                      <Text className="country-card__icon">{COUNTRY_DETAILS[country]?.icon ?? '☕'}</Text>
                      <Text className="country-card__name">{country}</Text>
                      <Text className="country-card__flavors">{COUNTRY_DETAILS[country]?.flavors}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {selectedCountry && (
              <View className="discover__beans">
                {countryBeans(selectedCountry).length > 0
                  ? countryBeans(selectedCountry).map((bean) => <BeanCard key={bean.id} bean={bean} />)
                  : <EmptyState message="该产区暂无收录豆款" />}
              </View>
            )}
          </View>
        )}

        {activeTab !== 'discover' && (
          <View className="index-page__list">
            {errorMessage ? (
              <EmptyState message={errorMessage} />
            ) : loading && beans.length === 0
              ? <EmptyState message="加载中..." />
              : filteredBeans.length === 0
              ? <EmptyState message="未找到咖啡豆" />
              : filteredBeans.map((bean) => <BeanCard key={bean.id} bean={bean} />)}
          </View>
        )}
      </View>
    </View>
  );
}
