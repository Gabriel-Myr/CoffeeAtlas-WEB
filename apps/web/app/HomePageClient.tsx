'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Coffee, Filter, Palette, Search } from 'lucide-react';
import { motion } from 'motion/react';

import type { CoffeeBean } from '@/lib/catalog';
import { formatSalesCount } from '@/lib/sales';

import OriginAtlasExplorer from '@/components/atlas/OriginAtlasExplorer';

type ThemeOption = 'warm' | 'dark' | 'green' | 'minimal' | 'japanese';

const THEMES: Array<{ id: ThemeOption; name: string; color: string }> = [
  { id: 'warm', name: '温暖奶咖', color: '#f5f0e8' },
  { id: 'dark', name: '深色咖啡馆', color: '#1a1614' },
  { id: 'green', name: '清新绿茶', color: '#f0f5f2' },
  { id: 'minimal', name: '极简白咖啡', color: '#fafafa' },
  { id: 'japanese', name: '日式和风', color: '#f4f1ee' },
];

interface HomePageClientProps {
  initialBeans: CoffeeBean[];
}

export default function HomePageClient({ initialBeans }: HomePageClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'discover' | 'sales' | 'new'>('discover');
  const [selectedContinent, setSelectedContinent] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [activeTheme, setActiveTheme] = useState<ThemeOption>('warm');
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('coffee-atlas-theme') as ThemeOption | null;
    if (savedTheme) {
      setActiveTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const filteredBeans = useMemo(() => {
    const base = [...initialBeans];

    const scoped =
      activeTab === 'new'
        ? base.filter((bean) => bean.isNewArrival)
        : activeTab === 'sales'
          ? base.sort((left, right) => right.salesCount - left.salesCount)
          : base;

    if (!searchQuery.trim()) {
      return scoped;
    }

    const normalizedQuery = searchQuery.trim().toLowerCase();
    return scoped.filter((bean) => {
      return [bean.name, bean.originCountry, bean.originRegion, bean.roasterName, bean.process, bean.variety]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [activeTab, initialBeans, searchQuery]);

  const applyTheme = (theme: ThemeOption) => {
    setActiveTheme(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('coffee-atlas-theme', theme);
    setShowThemePicker(false);
  };

  const resetAtlasSelection = () => {
    setSelectedContinent(null);
    setSelectedCountry(null);
  };

  return (
    <div className="min-h-screen pb-20" data-theme={activeTheme}>
      <header className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-8 pt-12 md:px-12">
        <div className="absolute right-6 top-6 flex items-center gap-3 md:right-12">
          <button
            onClick={() => setShowThemePicker((value) => !value)}
            className="rounded-full border border-[var(--color-coffee-light)]/20 bg-white p-2.5 text-[var(--color-coffee-light)] shadow-sm transition-all hover:shadow-md"
            aria-label="切换主题"
          >
            <Palette className="h-5 w-5" />
          </button>
        </div>

        {showThemePicker ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-6 top-16 z-50 min-w-[172px] rounded-2xl border border-[var(--color-coffee-light)]/20 bg-white p-3 shadow-lg md:right-12"
          >
            <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-[var(--color-coffee-light)]">选择主题</p>
            <div className="flex flex-col gap-1">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => applyTheme(theme.id)}
                  className={[
                    'flex items-center gap-3 rounded-xl px-3 py-2 text-left transition-all',
                    activeTheme === theme.id ? 'bg-[var(--color-bg-warm)]' : 'hover:bg-[var(--color-bg-warm)]',
                  ].join(' ')}
                >
                  <span
                    className="h-5 w-5 rounded-full border-2"
                    style={{
                      backgroundColor: theme.color,
                      borderColor:
                        activeTheme === theme.id ? 'var(--color-accent-rust)' : 'var(--color-coffee-light)',
                    }}
                  />
                  <span
                    className={[
                      'text-sm font-medium',
                      activeTheme === theme.id ? 'text-[var(--color-coffee-dark)]' : 'text-[var(--color-coffee-light)]',
                    ].join(' ')}
                  >
                    {theme.name}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : null}

        <div className="flex flex-col items-center text-center">
          <h1
            className="text-[28px] font-bold tracking-[0.05em] text-[var(--color-coffee-dark)] md:text-[36px]"
            style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
          >
            COFFEE
          </h1>
          <h2
            className="-mt-1 text-[32px] italic font-medium tracking-[0.02em] text-[var(--color-coffee-light)] md:-mt-2 md:text-[42px]"
            style={{ fontFamily: '"Cormorant Garamond", "Playfair Display", serif' }}
          >
            Atlas
          </h2>
        </div>
        <p className="mt-4 text-sm font-medium uppercase tracking-[0.28em] text-[var(--color-coffee-light)]/80">
          Discover origin, terrain, and cup character
        </p>
      </header>

      <main className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="relative mx-auto mb-12 max-w-2xl">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
            <Search className="h-5 w-5 text-[var(--color-coffee-light)]/60" />
          </div>
          <input
            type="text"
            className="block w-full rounded-full border border-[var(--color-coffee-light)]/20 bg-white py-4 pl-11 pr-4 text-[var(--color-coffee-dark)] shadow-sm transition-all placeholder:text-[var(--color-coffee-light)]/50 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-light)]/30"
            placeholder="按烘焙商、产地、处理法或豆种搜索..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <button className="rounded-full p-2 text-[var(--color-coffee-light)]/60 transition-colors hover:bg-[var(--color-bg-warm)] hover:text-[var(--color-coffee-dark)]">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="mb-12 flex justify-center border-b border-[var(--color-coffee-light)]/20">
          {[
            { id: 'discover', label: '发现' },
            { id: 'sales', label: '销量' },
            { id: 'new', label: '新品' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as 'discover' | 'sales' | 'new');
                resetAtlasSelection();
              }}
              className={[
                'relative px-5 pb-4 text-sm font-medium uppercase tracking-[0.24em] transition-colors md:px-8',
                activeTab === tab.id
                  ? 'text-[var(--color-coffee-dark)]'
                  : 'text-[var(--color-coffee-light)]/60 hover:text-[var(--color-coffee-dark)]/80',
              ].join(' ')}
            >
              {tab.label}
              {activeTab === tab.id ? (
                <motion.div layoutId="active-home-tab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-coffee-dark)]" />
              ) : null}
            </button>
          ))}
        </div>

        {activeTab === 'discover' ? (
          <OriginAtlasExplorer
            beans={initialBeans}
            selectedContinent={selectedContinent}
            selectedCountry={selectedCountry}
            onSelectContinent={setSelectedContinent}
            onSelectCountry={setSelectedCountry}
            onBack={() => {
              if (selectedCountry) {
                setSelectedCountry(null);
              } else {
                setSelectedContinent(null);
              }
            }}
          />
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {(activeTab === 'sales' ? filteredBeans.slice(0, 10) : filteredBeans).map((bean, index) => (
              <BeanCard key={bean.id} bean={bean} index={index} />
            ))}
          </div>
        )}

        {activeTab === 'sales' && filteredBeans.length > 10 ? (
          <div className="mt-12 text-center">
            <Link
              href="/all-beans"
              className="inline-flex items-center gap-2 rounded-full border-2 border-[var(--color-coffee-light)]/30 bg-white px-8 py-3 font-medium text-[var(--color-coffee-dark)] shadow-sm transition-all duration-300 hover:border-[var(--color-coffee-light)]/50 hover:bg-[var(--color-coffee-light)]/10 hover:shadow-md"
            >
              查看全部
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : null}

        {activeTab !== 'discover' && filteredBeans.length === 0 ? (
          <div className="py-20 text-center">
            <Coffee className="mx-auto mb-4 h-12 w-12 text-[var(--color-coffee-light)]/30" />
            <h3 className="mb-2 text-xl font-serif text-[var(--color-coffee-dark)]">未找到咖啡豆</h3>
            <p className="text-[var(--color-coffee-light)]">试试调整搜索条件或切换标签页</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function BeanCard({ bean, index }: { bean: CoffeeBean; index: number }) {
  const titleLine1Fields = [bean.roasterName, bean.originCountry].filter(Boolean);
  const titleLine2Fields = [bean.originRegion, bean.farm, bean.variety].filter(Boolean);
  const salesLabel = formatSalesCount(bean.salesCount);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-[var(--color-coffee-light)]/10 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]"
    >
      <div className="relative aspect-square overflow-hidden bg-[var(--color-bg-warm)]">
        {bean.imageUrl ? (
          <img
            src={bean.imageUrl}
            alt={bean.name}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Coffee className="h-16 w-16 text-[var(--color-coffee-light)]/30" />
          </div>
        )}
        {bean.isNewArrival ? (
          <div className="absolute left-4 top-4">
            <span className="rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[var(--color-coffee-dark)] shadow-sm backdrop-blur-sm">
              新品
            </span>
          </div>
        ) : null}
      </div>

      <div className="flex flex-grow flex-col p-4 md:p-6">
        <div className="mb-4 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-serif font-medium leading-[1.3] text-[var(--color-coffee-dark)]">
              <span className="inline-flex items-center">
                {titleLine1Fields.map((field, fieldIndex) => (
                  <span key={`${field}-${fieldIndex}`} className="inline-flex items-center">
                    {field}
                    {fieldIndex < titleLine1Fields.length - 1 ? (
                      <span className="mx-1 text-sm align-middle text-[var(--color-coffee)] opacity-50">·</span>
                    ) : null}
                  </span>
                ))}
              </span>
            </h3>
            {titleLine2Fields.length > 0 ? (
              <h3 className="text-base font-serif font-medium leading-[1.3] text-[var(--color-coffee)] opacity-70">
                <span className="inline-flex items-center">
                  {titleLine2Fields.map((field, fieldIndex) => (
                    <span key={`${field}-${fieldIndex}`} className="inline-flex items-center">
                      {field}
                      {fieldIndex < titleLine2Fields.length - 1 ? (
                        <span className="mx-1 text-sm align-middle text-[var(--color-coffee)] opacity-50">·</span>
                      ) : null}
                    </span>
                  ))}
                </span>
              </h3>
            ) : null}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-0.5">
            {salesLabel ? (
              <span className="rounded-full bg-[var(--color-accent-olive)] px-1.5 py-0.5 text-[10px] font-bold text-white">{salesLabel}</span>
            ) : null}
            {bean.discountedPrice > 0 ? (
              <span className="rounded-full bg-[var(--color-accent-rust)] px-1.5 py-0.5 text-[10px] font-bold text-white">
                ¥{bean.discountedPrice}
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-auto flex items-start border-t border-[var(--color-coffee-light)]/10 pt-4">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-wider text-[var(--color-coffee-light)]">处理法</span>
            <span className="text-sm font-medium text-[var(--color-coffee-dark)]">{bean.process || '-'}</span>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
