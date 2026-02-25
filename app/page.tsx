'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Coffee, Palette, Settings } from 'lucide-react';
import { motion } from 'motion/react';
import { supabaseBrowser } from '@/lib/supabase';

interface CoffeeBean {
  id: string;
  name: string;
  roasterId: string;
  roasterName: string;
  city: string;
  originCountry: string;
  originRegion: string;
  farm: string;
  variety: string;
  process: string;
  roastLevel: string;
  price: number;
  discountedPrice: number;
  currency: string;
  salesCount: number;
  tastingNotes: string[];
  imageUrl: string | null;
  isNewArrival: boolean;
  isInStock: boolean;
}

type ThemeOption = 'warm' | 'dark' | 'green' | 'minimal' | 'japanese';

const themes: { id: ThemeOption; name: string; color: string }[] = [
  { id: 'warm', name: '温暖奶咖', color: '#f5f0e8' },
  { id: 'dark', name: '深色咖啡馆', color: '#1a1614' },
  { id: 'green', name: '清新绿茶', color: '#f0f5f2' },
  { id: 'minimal', name: '极简白咖啡', color: '#fafafa' },
  { id: 'japanese', name: '日式和风', color: '#f4f1ee' },
];

// 产区数据
const REGIONS = [
  { 
    id: 'ethiopia', 
    name: '埃塞俄比亚', 
    icon: '🌸', 
    color: '#F2CC8F',
    flavors: '柑橘·花香·莓果',
    count: 0
  },
  { 
    id: 'colombia', 
    name: '哥伦比亚', 
    icon: '🏔️', 
    color: '#81B29A',
    flavors: '坚果·巧克力·焦糖',
    count: 0
  },
  { 
    id: 'brazil', 
    name: '巴西', 
    icon: '☕', 
    color: '#E07A5F',
    flavors: '巧克力·坚果·平衡',
    count: 0
  },
  { 
    id: 'kenya', 
    name: '肯尼亚', 
    icon: '🍅', 
    color: '#F28482',
    flavors: '番茄·黑醋栗·明亮酸',
    count: 0
  },
  { 
    id: 'yunnan', 
    name: '云南', 
    icon: '🍃', 
    color: '#84A98C',
    flavors: '茶感·木质·甘蔗甜',
    count: 0
  },
  { 
    id: 'indonesia', 
    name: '印度尼西亚', 
    icon: '🌴', 
    color: '#6B705C',
    flavors: '泥土·药草·醇厚',
    count: 0
  },
  { 
    id: 'guatemala', 
    name: '危地马拉', 
    icon: '🏕️', 
    color: '#A5A58D',
    flavors: '蜂蜜·可可·柔和酸',
    count: 0
  },
  { 
    id: 'rwanda', 
    name: '卢旺达', 
    icon: '💐', 
    color: '#FFE5D9',
    flavors: '花香·柠檬·蜂蜜',
    count: 0
  },
];

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'sales' | 'new'>('discover');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeOption>('warm');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [beans, setBeans] = useState<CoffeeBean[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从 localStorage 获取主题
    const savedTheme = localStorage.getItem('coffee-atlas-theme') as ThemeOption;
    if (savedTheme) {
      setActiveTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  useEffect(() => {
    async function fetchBeans() {
      // 直接查询 roaster_beans
      const { data: rbData, error } = await supabaseBrowser
        .from('roaster_beans')
        .select('id, display_name, roast_level, price_amount, price_currency, sales_count, is_in_stock, roaster_id, bean_id, image_url')
        .eq('status', 'ACTIVE')
        .order('sales_count', { ascending: false, nullsFirst: false })
        .limit(50);

      if (error) {
        console.error('Fetch error:', error);
        setLoading(false);
        return;
      }

      if (!rbData || rbData.length === 0) {
        setBeans([]);
        setLoading(false);
        return;
      }

      // 获取关联的 roasters 和 beans
      const roasterIds = [...new Set(rbData.map((r: any) => r.roaster_id).filter(Boolean))];
      const beanIds = [...new Set(rbData.map((r: any) => r.bean_id).filter(Boolean))];

      const queries = [];
      if (roasterIds.length > 0) {
        queries.push(supabaseBrowser.from('roasters').select('id, name, city').in('id', roasterIds));
      } else {
        queries.push(Promise.resolve({ data: [], error: null }));
      }
      if (beanIds.length > 0) {
        queries.push(supabaseBrowser.from('beans').select('id, canonical_name, origin_country, farm, variety, process_method, flavor_tags').in('id', beanIds));
      } else {
        queries.push(Promise.resolve({ data: [], error: null }));
      }

      const [roastersRes, beansRes] = await Promise.all(queries);

      const roastersMap = new Map((roastersRes.data || []).map((r: any) => [r.id, r]));
      const beansMap = new Map((beansRes.data || []).map((b: any) => [b.id, b]));

      const mapped = (rbData || []).map((item: any) => {
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

      setBeans(mapped);
      setLoading(false);
    }
    fetchBeans();
  }, []);

  const filteredBeans = useMemo(() => {
    let result = [...beans];

    if (activeTab === 'new') {
      result = result.filter((bean) => bean.isNewArrival);
    } else if (activeTab === 'sales') {
      // 数据已从数据库按销量降序获取，直接使用
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (bean) =>
          bean.name.toLowerCase().includes(query) ||
          bean.originCountry.toLowerCase().includes(query) ||
          bean.roasterName.toLowerCase().includes(query) ||
          bean.tastingNotes.some((note) => note.toLowerCase().includes(query))
      );
    }

    return result;
  }, [searchQuery, activeTab]);

  const applyTheme = (theme: ThemeOption) => {
    setActiveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('coffee-atlas-theme', theme);
    setShowThemePicker(false);
  };

  return (
    <div className="min-h-screen pb-20" data-theme={activeTheme}>
      {/* Header */}
      <header className="pt-12 pb-8 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center justify-center relative">
        {/* Theme Picker Toggle */}
        <div className="absolute top-6 right-6 flex items-center gap-3">
          <a
            href="/admin"
            className="p-2.5 rounded-full bg-white border border-[var(--color-coffee-light)]/20 shadow-sm hover:shadow-md transition-all text-[var(--color-coffee-light)] hover:text-[var(--color-coffee-dark)]"
            title="管理后台"
          >
            <Settings className="h-5 w-5" />
          </a>
          <button
            onClick={() => setShowThemePicker(!showThemePicker)}
            className="p-2.5 rounded-full bg-white border border-[var(--color-coffee-light)]/20 shadow-sm hover:shadow-md transition-all text-[var(--color-coffee-light)]"
          >
            <Palette className="h-5 w-5" />
          </button>
        </div>

        {/* Theme Picker Dropdown */}
        {showThemePicker && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-16 right-6 bg-white border border-[var(--color-coffee-light)]/20 rounded-2xl shadow-lg p-3 z-50 min-w-[160px]"
          >
            <p className="text-xs font-medium uppercase tracking-wider mb-3 px-2 text-[var(--color-coffee-light)]">
              选择主题
            </p>
            <div className="flex flex-col gap-1">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => applyTheme(theme.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all ${
                    activeTheme === theme.id
                      ? 'bg-[var(--color-bg-warm)]'
                      : 'hover:bg-[var(--color-bg-warm)]'
                  }`}
                >
                  <span
                    className="w-5 h-5 rounded-full border-2"
                    style={{
                      backgroundColor: theme.color,
                      borderColor:
                        activeTheme === theme.id
                          ? 'var(--color-accent-rust)'
                          : 'var(--color-coffee-light)',
                    }}
                  />
                  <span
                    className={`text-sm font-medium ${
                      activeTheme === theme.id
                        ? 'text-[var(--color-coffee-dark)]'
                        : 'text-[var(--color-coffee-light)]'
                    }`}
                  >
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        <div className="flex flex-col items-center">
          {/* COFFEE 大字 */}
          <h1 className="text-[28px] md:text-[36px] font-bold text-[var(--color-coffee-dark)] tracking-[0.05em] leading-none" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            COFFEE
          </h1>
          {/* Atlas 斜体衬线 */}
          <h2 className="text-[32px] md:text-[42px] italic font-medium text-[var(--color-coffee-light)] tracking-[0.02em] leading-none -mt-1 md:-mt-2" style={{ fontFamily: '"Cormorant Garamond", "Playfair Display", serif' }}>
            Atlas
          </h2>
        </div>
        <p className="mt-4 text-sm text-[var(--color-coffee-light)]/80 font-medium tracking-widest uppercase">
          探索精品咖啡与全球风味
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-12">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[var(--color-coffee-light)]/60" />
          </div>
          <input
            type="text"
            className="block w-full pl-11 pr-4 py-4 bg-white border border-[var(--color-coffee-light)]/20 rounded-full text-[var(--color-coffee-dark)] placeholder-[var(--color-coffee-light)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-light)]/30 focus:border-transparent transition-all shadow-sm"
            placeholder="按烘焙商、产地或豆种搜索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
            <button className="p-2 text-[var(--color-coffee-light)]/60 hover:text-[var(--color-coffee-dark)] transition-colors rounded-full hover:bg-[var(--color-bg-warm)]">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center space-x-8 mb-12 border-b border-[var(--color-coffee-light)]/20">
          <button
            onClick={() => { setActiveTab('discover'); setSelectedRegion(null); }}
            className={`pb-4 text-sm font-medium tracking-wider uppercase transition-colors relative ${
              activeTab === 'discover'
                ? 'text-[var(--color-coffee-dark)]'
                : 'text-[var(--color-coffee-light)]/60 hover:text-[var(--color-coffee-dark)]/80'
            }`}
          >
            发现
            {activeTab === 'discover' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-coffee-dark)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`pb-4 text-sm font-medium tracking-wider uppercase transition-colors relative ${
              activeTab === 'sales'
                ? 'text-[var(--color-coffee-dark)]'
                : 'text-[var(--color-coffee-light)]/60 hover:text-[var(--color-coffee-dark)]/80'
            }`}
          >
            销量
            {activeTab === 'sales' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-coffee-dark)]"
              />
            )}
          </button>
          <button
            onClick={() => setActiveTab('new')}
            className={`pb-4 text-sm font-medium tracking-wider uppercase transition-colors relative ${
              activeTab === 'new'
                ? 'text-[var(--color-coffee-dark)]'
                : 'text-[var(--color-coffee-light)]/60 hover:text-[var(--color-coffee-dark)]/80'
            }`}
          >
            新品
            {activeTab === 'new' && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-coffee-dark)]"
              />
            )}
          </button>
        </div>

        {/* 发现 - 产区探索 */}
        {activeTab === 'discover' && (
          <div className="mb-12">
            {/* 产区标题 */}
            <div className="flex items-center gap-3 mb-8">
              <span className="text-2xl">🗺️</span>
              <h2 className="text-xl font-bold text-[var(--color-coffee-dark)] tracking-wide">
                {selectedRegion 
                  ? `📍 ${REGIONS.find(r => r.id === selectedRegion)?.name}` 
                  : '产区探索'}
              </h2>
              {selectedRegion && (
                <button 
                  onClick={() => setSelectedRegion(null)}
                  className="ml-2 text-sm text-[var(--color-coffee-light)] hover:text-[var(--color-coffee-dark)]"
                >
                  ← 返回产区列表
                </button>
              )}
            </div>

            {/* 产区卡片网格 - 未选择时 */}
            {!selectedRegion && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {REGIONS.map((region) => (
                  <motion.button
                    key={region.id}
                    whileHover={{ y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedRegion(region.id)}
                    className="relative overflow-hidden rounded-2xl p-5 text-left transition-all duration-300 border border-[var(--color-coffee-light)]/10"
                    style={{ 
                      backgroundColor: region.color + '20',
                      boxShadow: '0 4px 20px -5px rgba(0,0,0,0.08)'
                    }}
                  >
                    <div className="text-3xl mb-3">{region.icon}</div>
                    <h3 className="font-bold text-[var(--color-coffee-dark)] mb-1">{region.name}</h3>
                    <p className="text-xs text-[var(--color-coffee-light)] leading-relaxed">
                      {region.flavors}
                    </p>
                    <div className="mt-3 pt-3 border-t border-[var(--color-coffee-light)]/10 flex items-center justify-between">
                      <span className="text-xs text-[var(--color-coffee-light)]">点击探索</span>
                      <span className="text-lg">→</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            )}

            {/* 产区详情 - 选择后显示该产区豆款 */}
            {selectedRegion && (
              <div>
                {/* 产区简介卡片 */}
                <div 
                  className="rounded-2xl p-6 mb-8"
                  style={{ 
                    backgroundColor: REGIONS.find(r => r.id === selectedRegion)?.color + '15',
                    border: `1px solid ${REGIONS.find(r => r.id === selectedRegion)?.color}30`
                  }}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-4xl">{REGIONS.find(r => r.id === selectedRegion)?.icon}</span>
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-coffee-dark)] mb-2">
                        {REGIONS.find(r => r.id === selectedRegion)?.name}
                      </h3>
                      <p className="text-sm text-[var(--color-coffee-light)] mb-3">
                        典型风味：{REGIONS.find(r => r.id === selectedRegion)?.flavors}
                      </p>
                      <p className="text-xs text-[var(--color-coffee-light)]/70">
                        该产区咖啡豆 · 共 {beans.filter(b => b.originCountry.includes(REGIONS.find(r => r.id === selectedRegion)?.name || '')).length} 款
                      </p>
                    </div>
                  </div>
                </div>

                {/* 该产区豆款列表 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {beans
                    .filter(b => b.originCountry.includes(REGIONS.find(r => r.id === selectedRegion)?.name || ''))
                    .slice(0, 6)
                    .map((bean) => (
                      <motion.div
                        key={bean.id}
                        whileHover={{ y: -4 }}
                        className="bg-white rounded-2xl p-4 border border-[var(--color-coffee-light)]/10 shadow-sm hover:shadow-md transition-all"
                      >
                        <div className="flex gap-4">
                          {bean.imageUrl ? (
                            <img src={bean.imageUrl} alt={bean.name} className="w-20 h-20 rounded-xl object-cover" />
                          ) : (
                            <div className="w-20 h-20 rounded-xl bg-[var(--color-bg-warm)] flex items-center justify-center">
                              <Coffee className="w-8 h-8 text-[var(--color-coffee-light)]/40" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-[var(--color-coffee-dark)] text-sm truncate">{bean.name}</h4>
                            <p className="text-xs text-[var(--color-coffee-light)] truncate">{bean.roasterName}</p>
                            <p className="text-xs text-[var(--color-coffee-light)]/60 mt-1">{bean.originCountry}</p>
                            <p className="text-sm font-bold text-[var(--color-coffee-dark)] mt-2">
                              ¥{bean.price}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>

                {beans.filter(b => b.originCountry.includes(REGIONS.find(r => r.id === selectedRegion)?.name || '')).length === 0 && (
                  <div className="text-center py-12 text-[var(--color-coffee-light)]">
                    <Coffee className="w-12 h-12 mx-auto mb-4 opacity-30" />
                    <p>暂无该产区豆款</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Results Grid - 销量 & 新品 */}
        {activeTab !== 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {loading ? (
            <div className="col-span-full text-center py-20">
              <div className="animate-pulse">
                <Coffee className="h-12 w-12 mx-auto text-[var(--color-coffee-light)]/30 mb-4" />
                <p className="text-[var(--color-coffee-light)]">加载中...</p>
              </div>
            </div>
          ) : (
            <>
              {(activeTab === 'sales' ? filteredBeans.slice(0, 10) : filteredBeans).map((bean, index) => (
                <BeanCard key={bean.id} bean={bean} index={index} />
              ))}
            </>
          )}
        </div>
        )}

        {/* 查看全部按钮 - 仅在销量标签显示 */}
        {activeTab === 'sales' && !loading && filteredBeans.length > 10 && (
          <div className="text-center mt-12">
            <a
              href="/all-beans"
              className="inline-flex items-center gap-2 px-8 py-3 bg-white border-2 border-[var(--color-coffee-light)]/30 text-[var(--color-coffee-dark)] font-medium rounded-full hover:bg-[var(--color-coffee-light)]/10 hover:border-[var(--color-coffee-light)]/50 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              查看全部
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        )}

        {filteredBeans.length === 0 && (
          <div className="text-center py-20">
            <Coffee className="h-12 w-12 mx-auto text-[var(--color-coffee-light)]/30 mb-4" />
            <h3 className="text-xl font-serif text-[var(--color-coffee-dark)] mb-2">未找到咖啡豆</h3>
            <p className="text-[var(--color-coffee-light)]">试试调整搜索条件或筛选器</p>
          </div>
        )}
      </main>
    </div>
  );
}

function BeanCard({ bean, index }: { bean: CoffeeBean; index: number }) {
  // 第一行：烘焙商 + 产地
  // 第一行：烘焙商 + 产地
  const titleLine1Fields = [bean.roasterName, bean.originCountry].filter(Boolean);
  // 第二行：产区 + 庄园/生产者 + 品种（拆分成多个片段）
  const titleLine2Fields = [bean.originRegion, bean.farm, bean.variety].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[var(--color-coffee-light)]/10 flex flex-col h-full"
    >
      {/* Image Section - 统一正方形 */}
      <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-warm)]">
        {bean.imageUrl ? (
          <img
            src={bean.imageUrl}
            alt={bean.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Coffee className="h-16 w-16 text-[var(--color-coffee-light)]/30" />
          </div>
        )}
        {/* 标签 */}
        {bean.isNewArrival && (
          <div className="absolute top-4 left-4">
            <span className="bg-white/90 backdrop-blur-sm text-[var(--color-coffee-dark)] text-xs font-bold px-3 py-1.5 rounded-full tracking-wider uppercase shadow-sm">
              新品
            </span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 md:p-6 flex flex-col flex-grow">
        {/* 标题：两行 + 标签（右对齐） */}
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* 第一行 */}
            <h3 className="text-base font-serif font-medium text-[var(--color-coffee-dark)] leading-[1.3]">
              <span className="inline-flex items-center">
                {titleLine1Fields.map((field, idx) => (
                  <span key={idx} className="inline-flex items-center">
                    {field}
                    {idx < titleLine1Fields.length - 1 && (
                      <span className="mx-1 text-sm text-[var(--color-coffee)] opacity-50 align-middle">·</span>
                    )}
                  </span>
                ))}
              </span>
            </h3>
            {/* 第二行 */}
            {titleLine2Fields.length > 0 && (
              <h3 className="text-base font-serif font-medium text-[var(--color-coffee)] opacity-70 leading-[1.3]">
                <span className="inline-flex items-center">
                  {titleLine2Fields.map((field, idx) => (
                    <span key={idx} className="inline-flex items-center">
                      {field}
                      {idx < titleLine2Fields.length - 1 && (
                        <span className="mx-1 text-sm text-[var(--color-coffee)] opacity-50 align-middle">·</span>
                      )}
                    </span>
                  ))}
                </span>
              </h3>
            )}
          </div>
          {/* 右侧标签 */}
          <div className="flex flex-col items-end gap-0.5 shrink-0">
            {bean.salesCount > 0 && (
              <span className="bg-[var(--color-accent-olive)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {bean.salesCount >= 1000
                  ? `${(bean.salesCount / 1000).toFixed(1)}K`
                  : bean.salesCount >= 100
                    ? `${(bean.salesCount / 1000).toFixed(1)}K`
                    : bean.salesCount}
              </span>
            )}
            {bean.discountedPrice > 0 && (
              <span className="bg-[var(--color-accent-rust)] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                ¥{bean.discountedPrice}
              </span>
            )}
          </div>
        </div>

        {/* 处理法 */}
        <div className="pt-4 border-t border-[var(--color-coffee-light)]/10 flex items-start mt-auto">
          <div className="flex flex-col">
            <span className="text-xs text-[var(--color-coffee-light)] uppercase tracking-wider">处理法</span>
            <span className="text-sm font-medium text-[var(--color-coffee-dark)]">{bean.process || '-'}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
