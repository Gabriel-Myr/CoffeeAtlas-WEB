'use client';

import { useState, useMemo } from 'react';
import { Search, Filter, Coffee, Palette, Settings, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import Link from 'next/link';

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

export default function AllBeansClient({ beans: initialBeans }: { beans: CoffeeBean[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTheme, setActiveTheme] = useState<ThemeOption>('warm');
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [beans] = useState<CoffeeBean[]>(initialBeans);

  const filteredBeans = useMemo(() => {
    if (!searchQuery.trim()) return beans;
    
    const query = searchQuery.toLowerCase();
    return beans.filter(
      (bean) =>
        bean.name.toLowerCase().includes(query) ||
        bean.originCountry.toLowerCase().includes(query) ||
        bean.roasterName.toLowerCase().includes(query) ||
        bean.tastingNotes.some((note) => note.toLowerCase().includes(query))
    );
  }, [searchQuery, beans]);

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
          {/* 返回按钮 */}
          <Link
            href="/"
            className="absolute left-6 top-6 md:left-12 flex items-center gap-2 text-[var(--color-coffee-light)] hover:text-[var(--color-coffee-dark)] transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">返回</span>
          </Link>
          
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
          全部咖啡豆 · 按销量排序
        </p>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 md:px-12">
        {/* 统计信息 */}
        <div className="text-center mb-8">
          <p className="text-[var(--color-coffee-light)]">
            共 <span className="font-semibold text-[var(--color-coffee-dark)]">{beans.length}</span> 款咖啡豆
          </p>
        </div>

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

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredBeans.map((bean, index) => (
            <BeanCard key={bean.id} bean={bean} index={index} />
          ))}
        </div>

        {filteredBeans.length === 0 && (
          <div className="text-center py-20">
            <Coffee className="h-12 w-12 mx-auto text-[var(--color-coffee-light)]/30 mb-4" />
            <h3 className="text-xl font-serif text-[var(--color-coffee-dark)] mb-2">未找到咖啡豆</h3>
            <p className="text-[var(--color-coffee-light)]">试试调整搜索条件</p>
          </div>
        )}
      </main>
    </div>
  );
}

function BeanCard({ bean, index }: { bean: CoffeeBean; index: number }) {
  const titleLine1Fields = [bean.roasterName, bean.originCountry].filter(Boolean);
  const titleLine2Fields = [bean.originRegion, bean.farm, bean.variety].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="group bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 border border-[var(--color-coffee-light)]/10 flex flex-col h-full"
    >
      {/* Image Section */}
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
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
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
