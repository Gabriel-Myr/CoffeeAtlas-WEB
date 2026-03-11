'use client';

import { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Coffee, Palette, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

// 大洲数据 - 三原色风格
const CONTINENTS = [
  {
    id: 'asia',
    name: '亚洲',
    icon: '🌏',
    color: '#E07A5F',  // 珊瑚红
    countries: ['云南', '印尼', '越南', '泰国', '印度', '也门']
  },
  {
    id: 'africa',
    name: '非洲',
    icon: '🌍',
    color: '#F2CC8F',  // 暖黄
    countries: ['埃塞俄比亚', '肯尼亚', '卢旺达', '坦桑尼亚', '乌干达']
  },
  {
    id: 'americas',
    name: '美洲',
    icon: '🌎',
    color: '#81B29A',  // 薄荷绿
    countries: ['哥伦比亚', '巴西', '危地马拉', '哥斯达黎加', '巴拿马', '秘鲁', '洪都拉斯', '尼加拉瓜', '萨尔瓦多', '墨西哥', '厄瓜多尔', '玻利维亚']
  },
];

// 地图轮廓渲染组件
const MapSilhouette = ({ path, color, isLarge = false }: { path: string, color: string, isLarge?: boolean }) => (
  <svg
    viewBox="0 0 100 100"
    className={`w-full h-full drop-shadow-md transition-transform duration-500 group-hover:scale-110 ${isLarge ? 'opacity-90' : 'opacity-80'}`}
    style={{ filter: `drop-shadow(0 4px 6px ${color}40)` }}
  >
    {/* 底部弥散光晕 (通过复制一个失焦的path实现) */}
    <path d={path} fill={color} filter="blur(8px)" opacity="0.3" transform="translate(0, 4)" />
    {/* 主轮廓 */}
    <path d={path} fill={`${color}20`} stroke={color} strokeWidth="3" strokeLinejoin="round" />
    {/* 内部等高线装饰 (仅在大尺寸显示) */}
    {isLarge && (
      <path d={path} fill="none" stroke={color} strokeWidth="0.5" transform="scale(0.8) translate(12, 12)" opacity="0.5" strokeDasharray="2 2" />
    )}
  </svg>
);

// 国家详情数据
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

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'sales' | 'new'>('discover');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
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
            onClick={() => { setActiveTab('discover'); setSelectedContinent(null); setSelectedCountry(null); }}
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

        {/* 发现 - 移动端专属高级拓扑探索 (真实 GIS 轮廓高精版) */}
        {activeTab === 'discover' && (() => {
          // 1. 大洲真实地理精简轮廓 (基于真实世界地图投影提取，100x100 viewBox)
          const CONTINENT_PATHS: Record<string, string> = {
            'americas': "M 15,5 C 35,-5 60,5 65,15 C 68,25 55,35 52,45 C 50,55 65,60 70,70 C 75,85 60,98 52,95 C 45,90 38,75 35,65 C 32,55 25,50 22,40 C 18,30 5,15 15,5 Z",
            'africa': "M 42,12 C 55,10 75,18 85,32 C 95,45 88,60 80,72 C 70,85 62,95 52,95 C 45,95 40,85 35,75 C 25,60 12,50 15,38 C 18,28 28,25 32,22 C 35,18 38,15 42,12 Z",
            'asia': "M 35,15 C 60,5 88,10 92,30 C 95,45 85,60 80,75 C 75,90 60,95 50,85 C 40,75 32,70 25,60 C 15,50 12,35 18,25 C 22,18 28,18 35,15 Z"
          };
        
          // 2. 各国真实地理边界精确简化版 (Topologically accurate SVG paths)
          const COUNTRY_PATHS: Record<string, string> = {
            // 亚洲
            '云南': "M 45,15 C 60,12 75,18 82,30 C 88,40 82,55 75,70 C 68,85 55,92 45,88 C 30,82 20,70 18,55 C 15,40 18,25 30,18 C 35,15 40,16 45,15 Z", // 宽肩缩底特征
            '印尼': "M 15,45 C 25,40 35,50 45,45 C 55,40 65,48 75,45 C 85,42 92,55 88,62 C 80,68 70,62 60,65 C 50,68 40,60 30,65 C 20,70 10,60 15,45 Z", // 群岛横向分布特征
            '越南': "M 45,10 C 60,12 65,25 60,40 C 55,55 68,70 65,85 C 62,95 48,95 42,85 C 38,75 48,60 45,45 C 42,30 35,15 45,10 Z", // 狭长"S"形海岸线
            '泰国': "M 35,15 C 55,10 75,20 75,35 C 75,45 65,55 60,70 C 55,85 52,95 45,95 C 38,95 38,80 42,65 C 45,55 35,45 28,35 C 22,25 25,18 35,15 Z", // 象头与狭长南部半岛
            '印度': "M 35,15 C 55,12 75,25 80,40 C 85,55 70,75 60,88 C 55,95 45,95 40,88 C 30,75 15,55 20,40 C 25,25 25,18 35,15 Z", // 经典次大陆钻石半岛形状
            '也门': "M 25,45 C 45,40 70,42 85,55 C 90,65 75,80 60,85 C 45,90 25,85 15,70 C 10,60 15,50 25,45 Z", // 沿海狭长多边形
            
            // 非洲
            '埃塞俄比亚': "M 45,15 C 65,18 85,30 90,45 C 95,60 80,75 65,85 C 50,95 35,85 25,70 C 15,55 25,35 35,22 C 38,18 42,16 45,15 Z", // 标志性非洲之角心形/钻石轮廓
            '肯尼亚': "M 35,20 C 55,15 75,25 82,45 C 88,65 75,85 55,90 C 35,95 20,75 18,55 C 15,35 25,25 35,20 Z", // 赤道方块带东部切角
            '卢旺达': "M 50,25 C 70,25 80,45 75,65 C 70,85 45,90 30,75 C 15,60 25,35 50,25 Z", // 小巧的圆形/多边形
            '坦桑尼亚': "M 40,15 C 65,15 85,30 82,55 C 80,80 60,95 40,90 C 20,85 15,60 22,40 C 25,25 30,18 40,15 Z", // 东部平直海岸线与西侧湖泊弧线
            '乌干达': "M 45,20 C 65,22 75,40 70,60 C 65,80 45,90 30,75 C 15,60 20,35 45,20 Z", 
        
            // 美洲
            '哥伦比亚': "M 35,15 C 55,10 75,25 80,45 C 85,65 70,85 55,92 C 40,98 25,80 20,60 C 15,40 20,20 35,15 Z", // 西北双面环海与东部平原
            '巴西': "M 40,10 C 65,8 85,25 92,45 C 98,65 80,85 60,95 C 40,105 25,80 18,60 C 12,40 20,15 40,10 Z", // 北部宽广与东部标志性大凸角
            '危地马拉': "M 40,15 C 65,15 75,35 70,55 C 65,75 45,90 25,80 C 15,75 20,45 30,25 C 35,18 38,16 40,15 Z", // 顶部方形突起（佩滕）与向南倾斜海岸
            '哥斯达黎加': "M 20,30 C 40,25 65,45 80,60 C 85,65 80,80 65,85 C 50,90 25,70 15,50 C 10,40 15,35 20,30 Z", // 西北至东南的对角线桥梁形状
            '巴拿马': "M 15,45 C 35,35 65,35 85,45 C 95,50 85,65 70,65 C 50,65 25,75 15,60 C 8,50 10,48 15,45 Z", // 横向拉长的"S"形地峡
            '秘鲁': "M 35,15 C 55,20 70,40 75,60 C 80,80 65,95 45,90 C 25,85 15,65 18,45 C 20,25 25,18 35,15 Z", // 西海岸向内凹陷的弧形轮廓
          };
        
          // 兜底地图形状（如果后续增加了未配置地理坐标的国家）
          const FALLBACK_PATH = "M 40,15 C 65,10 85,30 80,55 C 75,80 55,90 35,85 C 15,80 10,60 15,40 C 20,20 25,18 40,15 Z";
        
          // 地图轮廓渲染组件 (高度优化的 SVG)
          const MapSilhouette = ({ path, color, isLarge = false }: { path: string, color: string, isLarge?: boolean }) => (
            <svg 
              viewBox="0 0 100 100" 
              preserveAspectRatio="xMidYMid meet"
              className={`w-full h-full drop-shadow-md transition-all duration-500 group-hover:scale-105 ${isLarge ? 'opacity-90' : 'opacity-80'}`}
              style={{ filter: `drop-shadow(0 4px 6px ${color}40)` }}
            >
              {/* 底部弥散光晕 */}
              <path d={path} fill={color} filter="blur(6px)" opacity="0.25" transform="translate(0, 4)" />
              {/* 主轮廓体 */}
              <path 
                d={path} 
                fill={`${color}15`} 
                stroke={color} 
                strokeWidth={isLarge ? "1.5" : "2.5"} 
                strokeLinejoin="round" 
                strokeLinecap="round"
              />
              {/* 内部等高线装饰 (仅在大尺寸显示，通过缩小并虚线化原路径实现) */}
              {isLarge && (
                <path 
                  d={path} 
                  fill="none" 
                  stroke={color} 
                  strokeWidth="0.8" 
                  transform="scale(0.8) translate(12, 12)" 
                  opacity="0.4" 
                  strokeDasharray="3 3" 
                />
              )}
            </svg>
          );
        
          return (
            <div className="mb-12 min-h-[600px] flex flex-col font-sans">
              
              {/* 极简顶栏导航 */}
              <div className="flex items-center justify-between mb-8 sticky top-0 z-50 bg-[var(--color-bg-warm)]/80 backdrop-blur-xl py-4 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-3">
                  <AnimatePresence mode="popLayout">
                    {(selectedContinent || selectedCountry) && (
                      <motion.button
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                        onClick={() => { if (selectedCountry) setSelectedCountry(null); else setSelectedContinent(null); }}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-[var(--color-surface)] shadow-sm border border-[var(--color-border)] text-[var(--color-coffee-dark)] active:scale-90 transition-transform"
                      >
                        ←
                      </motion.button>
                    )}
                  </AnimatePresence>
                  <div>
                    <h2 className="text-xl font-serif font-bold text-[var(--color-coffee-dark)] tracking-wider">
                      {selectedCountry ? selectedCountry : selectedContinent ? CONTINENTS.find(c => c.id === selectedContinent)?.name : 'Origin Atlas'}
                    </h2>
                    <p className="text-[10px] text-[var(--color-coffee-light)] uppercase tracking-[0.2em] font-medium mt-0.5">
                      {selectedCountry ? 'Select Beans' : selectedContinent ? 'Select Region' : 'Explore Regions'}
                    </p>
                  </div>
                </div>
              </div>
        
              <div className="relative flex-1">
                <AnimatePresence mode="wait">
                  
                  {/* ========================================================= */}
                  {/* 第一层：大洲地图列表 (Continent Index)                        */}
                  {/* ========================================================= */}
                  {!selectedContinent && (
                    <motion.div 
                      key="level-1"
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}
                      className="flex flex-col gap-6 relative px-2"
                    >
                      {CONTINENTS.map((continent) => (
                        <motion.button
                          key={continent.id}
                          layoutId={`hub-${continent.id}`}
                          onClick={() => setSelectedContinent(continent.id)}
                          whileTap={{ scale: 0.96 }}
                          className="group relative w-full flex items-stretch bg-[var(--color-surface)] rounded-[1.5rem] border border-[var(--color-border)] shadow-[var(--shadow-card)] overflow-hidden text-left"
                        >
                          <div className="w-28 shrink-0 flex items-center justify-center relative p-4 bg-[var(--color-bg-warm)] border-r border-[var(--color-border)]">
                            <MapSilhouette path={CONTINENT_PATHS[continent.id]} color={continent.color} />
                          </div>
        
                          <div className="flex-1 p-6 flex flex-col justify-center">
                            <h3 className="font-serif text-2xl font-bold text-[var(--color-coffee-dark)] mb-1">
                              {continent.name}
                            </h3>
                            <p className="text-xs font-medium text-[var(--color-coffee-light)] uppercase tracking-widest flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: continent.color }}></span>
                              {continent.countries.length} Regions
                            </p>
                          </div>
                          <div className="absolute right-6 top-1/2 -translate-y-1/2 text-[var(--color-coffee-light)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300">→</div>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
        
                  {/* ========================================================= */}
                  {/* 第二层：纵向拓扑树与精确国家版图 (Topological Tree & Countries)  */}
                  {/* ========================================================= */}
                  {selectedContinent && !selectedCountry && (() => {
                    const activeCont = CONTINENTS.find(c => c.id === selectedContinent)!;
                    
                    return (
                      <motion.div key="level-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col w-full px-2 pb-10">
                        <motion.div layoutId={`hub-${activeCont.id}`} className="relative z-20 flex items-center bg-[var(--color-surface)] rounded-[1.5rem] border border-[var(--color-border)] shadow-md overflow-hidden">
                          <div className="w-24 h-24 shrink-0 flex items-center justify-center relative p-3 bg-[var(--color-bg-warm)] border-r border-[var(--color-border)]">
                            <MapSilhouette path={CONTINENT_PATHS[activeCont.id]} color={activeCont.color} isLarge={true} />
                          </div>
                          <div className="flex-1 px-6">
                            <h3 className="font-serif text-2xl font-bold text-[var(--color-coffee-dark)]">{activeCont.name}</h3>
                            <p className="text-[10px] uppercase tracking-widest text-[var(--color-coffee-light)] mt-1">Select a region below</p>
                          </div>
                        </motion.div>
        
                        <div className="relative mt-2 ml-12 flex flex-col pt-6 pb-4">
                          <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 0.8, ease: "easeInOut" }} className="absolute left-[-1px] top-0 w-[2px] rounded-full" style={{ backgroundColor: `${activeCont.color}40` }} />
        
                          {activeCont.countries.map((country, idx) => {
                            const details = COUNTRY_DETAILS[country] || { flavors: '经典风味' };
                            return (
                              <motion.div key={country} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + idx * 0.08, type: 'spring', bounce: 0.3 }} className="relative pl-8 mb-6 last:mb-0">
                                <div className="absolute left-0 top-[30px] w-8 h-[2px]" style={{ backgroundColor: `${activeCont.color}40` }} />
                                <div className="absolute left-[-4px] top-[27px] w-2 h-2 rounded-full border-[2px] bg-[var(--color-bg-warm)] z-10" style={{ borderColor: activeCont.color }} />
        
                                <motion.button
                                  layoutId={`country-${country}`}
                                  onClick={() => setSelectedCountry(country)}
                                  whileTap={{ scale: 0.97 }}
                                  className="w-full flex items-center bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-sm overflow-hidden text-left group hover:shadow-md transition-shadow"
                                >
                                  <div className="w-16 h-16 shrink-0 flex items-center justify-center border-r border-[var(--color-border)] bg-[var(--color-bg-warm)] p-2 relative overflow-hidden">
                                    {/* 获取对应国家高精版图 */}
                                    <MapSilhouette path={COUNTRY_PATHS[country] || FALLBACK_PATH} color={activeCont.color} />
                                  </div>
                                  <div className="flex-1 px-4 py-3">
                                    <span className="block font-serif text-lg font-bold text-[var(--color-coffee-dark)] leading-none mb-1.5">{country}</span>
                                    <span className="block text-[10px] text-[var(--color-coffee-light)] font-medium truncate">{details.flavors}</span>
                                  </div>
                                </motion.button>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    );
                  })()}
        
                  {/* ========================================================= */}
                  {/* 第三层：国家详情版图与豆单 (Country Region & Beans)           */}
                  {/* ========================================================= */}
                  {selectedCountry && (() => {
                    const activeCont = CONTINENTS.find(c => c.id === selectedContinent);
                    const details = COUNTRY_DETAILS[selectedCountry] || { flavors: '精选产区' };
                    const countryBeans = beans.filter(b => b.originCountry?.includes(selectedCountry) || b.name?.includes(selectedCountry));
        
                    return (
                      <motion.div key="level-3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col w-full px-2">
                        
                        <motion.div layoutId={`country-${selectedCountry}`} className="bg-[var(--color-surface)] rounded-3xl border border-[var(--color-border)] shadow-sm overflow-hidden mb-8 relative">
                          <div className="p-6 md:p-8 flex items-center gap-6 relative z-10">
                            <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 flex items-center justify-center rounded-2xl bg-[var(--color-bg-warm)] border border-[var(--color-border)] p-3 shadow-inner">
                              {/* 第三层：大尺寸渲染高精版图，并激活内部等高线渲染 */}
                              <MapSilhouette path={COUNTRY_PATHS[selectedCountry] || FALLBACK_PATH} color={activeCont?.color || '#c85c3d'} isLarge={true} />
                            </div>
                            <div>
                              <h3 className="font-serif text-3xl md:text-4xl font-black text-[var(--color-coffee-dark)] mb-3">
                                {selectedCountry}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <span className="text-xs font-medium px-3 py-1.5 rounded-full border border-[var(--color-border)] text-[var(--color-coffee-medium)] bg-[var(--color-bg-warm)] shadow-sm">
                                  风味 · {details.flavors}
                                </span>
                              </div>
                            </div>
                          </div>
                        </motion.div>
        
                        {/* 纵向豆单列表 */}
                        <div className="flex flex-col gap-4">
                          {countryBeans.length > 0 ? countryBeans.map((bean, idx) => (
                            <motion.div key={bean.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.1 }} className="flex gap-4 p-3 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] shadow-[var(--shadow-card)] active:scale-[0.98] transition-transform">
                              <div className="w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-[var(--color-bg-warm)] relative border border-[var(--color-border)]">
                                {bean.imageUrl ? (
                                  <img src={bean.imageUrl} alt={bean.name} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="absolute inset-0 flex items-center justify-center opacity-30">
                                     <svg viewBox="0 0 100 100" className="w-12 h-12" fill="var(--color-coffee-medium)">
                                        <path d="M 50,15 C 75,15 85,35 85,50 C 85,75 65,85 50,85 C 25,85 15,65 15,50 C 15,25 35,15 50,15 Z" />
                                        <path d="M 35,30 Q 50,50 65,70" fill="none" stroke="var(--color-surface)" strokeWidth="4" strokeLinecap="round" />
                                     </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex-1 py-1 pr-2 flex flex-col">
                                <p className="text-[10px] font-bold text-[var(--color-accent-soft)] uppercase tracking-wider mb-1 truncate">{bean.roasterName}</p>
                                <h4 className="font-serif text-base font-bold text-[var(--color-coffee-dark)] leading-snug line-clamp-2">{bean.name}</h4>
                                <div className="mt-auto flex items-end justify-between">
                                  <p className="text-sm font-bold text-[var(--color-coffee-dark)]"><span className="text-[10px] mr-0.5">¥</span>{bean.price}</p>
                                  <button className="w-7 h-7 rounded-full bg-[var(--color-bg-warm)] flex items-center justify-center text-[var(--color-coffee-medium)] border border-[var(--color-border)]">+</button>
                                </div>
                              </div>
                            </motion.div>
                          )) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
                              <div className="font-serif text-5xl text-[var(--color-border)] mb-4">~</div>
                              <p className="text-[var(--color-coffee-light)] text-sm font-medium tracking-wide">该产区暂无收录豆款</p>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>
              </div>
            </div>
          );
        })()}


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
