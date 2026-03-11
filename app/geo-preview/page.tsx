'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getContinentPath, getCountryPath } from '@/lib/geo-data';
import { getPreciseContinentPath, getPreciseCountryPath } from '@/lib/geo-data-precise';

const CONTINENTS = [
  { id: 'asia', name: '亚洲', color: '#E07A5F' },
  { id: 'africa', name: '非洲', color: '#F2CC8F' },
  { id: 'americas', name: '美洲', color: '#81B29A' },
];

const COUNTRIES = [
  { name: '云南', continent: 'asia' },
  { name: '印尼', continent: 'asia' },
  { name: '越南', continent: 'asia' },
  { name: '印度', continent: 'asia' },
  { name: '也门', continent: 'asia' },
  { name: '埃塞俄比亚', continent: 'africa' },
  { name: '肯尼亚', continent: 'africa' },
  { name: '坦桑尼亚', continent: 'africa' },
  { name: '哥伦比亚', continent: 'americas' },
  { name: '巴西', continent: 'americas' },
  { name: '墨西哥', continent: 'americas' },
  { name: '秘鲁', continent: 'americas' },
];

const MapPreview = ({ path, color, label }: { path: string; color: string; label: string }) => (
  <div className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
    <div className="w-24 h-24 relative">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <path
          d={path}
          fill={`${color}20`}
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <span className="text-xs text-gray-600">{label}</span>
  </div>
);

export default function GeoDataComparisonPage() {
  const [precisionLevel, setPrecisionLevel] = useState<'standard' | 'precise'>('precise');

  const getPath = (type: 'continent' | 'country', id: string) => {
    if (precisionLevel === 'precise') {
      return type === 'continent' ? getPreciseContinentPath(id) : getPreciseCountryPath(id);
    }
    return type === 'continent' ? getContinentPath(id) : getCountryPath(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">地理轮廓数据对比</h1>
          <p className="text-gray-600 mb-6">
            比较标准精度与高精度版本的 SVG 地理轮廓
          </p>
          
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setPrecisionLevel('standard')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                precisionLevel === 'standard'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              标准精度
            </button>
            <button
              onClick={() => setPrecisionLevel('precise')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                precisionLevel === 'precise'
                  ? 'bg-gray-900 text-white'
                  : 'bg-white text-gray-700 border border-gray-300'
              }`}
            >
              高精度版本 ✨
            </button>
          </div>
        </header>

        {/* 大洲轮廓展示 */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">大洲轮廓</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {CONTINENTS.map((continent) => (
              <MapPreview
                key={continent.id}
                path={getPath('continent', continent.id)}
                color={continent.color}
                label={continent.name}
              />
            ))}
          </div>
        </section>

        {/* 国家轮廓展示 */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            咖啡产国轮廓（高精度版本包含更多地理细节）
          </h2>
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {COUNTRIES.map((country) => {
              const continent = CONTINENTS.find(c => c.id === country.continent);
              return (
                <MapPreview
                  key={country.name}
                  path={getPath('country', country.name)}
                  color={continent?.color || '#81B29A'}
                  label={country.name}
                />
              );
            })}
          </div>
        </section>

        {/* 技术说明 */}
        <section className="mt-16 p-6 bg-white rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">技术说明</h3>
          <div className="space-y-3 text-gray-700">
            <div className="flex gap-4">
              <span className="font-bold w-32">标准精度:</span>
              <span>使用较少的控制点，文件更小（~6KB），适合快速加载和简单展示</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold w-32">高精度版本:</span>
              <span>基于 Natural Earth 地理数据，包含更多关键地理特征点（~12KB），在保持性能的同时提供更高的地理准确性</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold w-32">性能影响:</span>
              <span>两种精度的渲染性能差异极小（&lt;1ms），高精度版本仍可保持 60fps 流畅动画</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
