'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getContinentPath, getCountryPath } from '@/lib/geo-data';
import { getPreciseContinentPath, getPreciseCountryPath } from '@/lib/geo-data-precise';
import { getUltraPreciseContinentPath, getUltraPreciseCountryPath } from '@/lib/geo-data-ultra';

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

type PrecisionLevel = 'standard' | 'precise' | 'ultra';

const MapPreview = ({ 
  path, 
  color, 
  label,
  size = 'medium'
}: { 
  path: string; 
  color: string; 
  label: string;
  size?: 'small' | 'medium' | 'large';
}) => {
  const sizeClasses = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24',
    large: 'w-32 h-32'
  };

  return (
    <motion.div 
      className="flex flex-col items-center gap-2 p-4 bg-white rounded-lg shadow-sm border border-gray-200"
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className={`${sizeClasses[size]} relative`}>
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
      <span className="text-xs text-gray-600 font-medium">{label}</span>
    </motion.div>
  );
};

export default function GeoPrecisionDemoPage() {
  const [precisionLevel, setPrecisionLevel] = useState<PrecisionLevel>('ultra');
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);

  const getPath = (type: 'continent' | 'country', id: string) => {
    switch (precisionLevel) {
      case 'precise':
        return type === 'continent' ? getPreciseContinentPath(id) : getPreciseCountryPath(id);
      case 'ultra':
        return type === 'continent' ? getUltraPreciseContinentPath(id) : getUltraPreciseCountryPath(id);
      default:
        return type === 'continent' ? getContinentPath(id) : getCountryPath(id);
    }
  };

  const getPrecisionInfo = () => {
    switch (precisionLevel) {
      case 'standard':
        return {
          name: '标准精度',
          description: '使用较少的控制点，文件最小（~6KB）',
          points: '~15-20 个控制点',
          performance: '最优'
        };
      case 'precise':
        return {
          name: '高精度',
          description: '基于 Natural Earth 数据，平衡性能与准确性',
          points: '~25-35 个控制点',
          performance: '优秀'
        };
      case 'ultra':
        return {
          name: '超精细 ✨',
          description: '1:10m 比例尺数据，保留关键地理特征',
          points: '~35-50 个控制点',
          performance: '良好'
        };
    }
  };

  const info = getPrecisionInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.h1 
            className="text-4xl font-bold text-gray-900 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            地理轮廓精度对比
          </motion.h1>
          <p className="text-gray-600 mb-8 text-lg">
            比较三种不同精度级别的 SVG 地理轮廓渲染效果
          </p>
          
          {/* Precision Level Selector */}
          <div className="flex flex-wrap justify-center gap-4">
            {(['standard', 'precise', 'ultra'] as PrecisionLevel[]).map((level) => (
              <motion.button
                key={level}
                onClick={() => setPrecisionLevel(level)}
                className={`px-8 py-3 rounded-full font-medium transition-all ${
                  precisionLevel === level
                    ? 'bg-gray-900 text-white shadow-lg scale-105'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {level === 'standard' && '📍 '}
                {level === 'precise' && '🎯 '}
                {level === 'ultra' && '💎 '}
                {level === 'standard' && '标准精度'}
                {level === 'precise' && '高精度'}
                {level === 'ultra' && '超精细'}
              </motion.button>
            ))}
          </div>

          {/* Info Card */}
          <motion.div 
            className="mt-8 p-6 bg-white rounded-xl shadow-md border border-gray-200 max-w-2xl mx-auto"
            key={precisionLevel}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-3">{info.name}</h3>
            <p className="text-gray-600 mb-4">{info.description}</p>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">控制点数量</div>
                <div className="font-bold text-gray-900">{info.points}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500">性能表现</div>
                <div className="font-bold text-gray-900">{info.performance}</div>
              </div>
            </div>
          </motion.div>
        </header>

        {/* Continent Section */}
        <section className="mb-16">
          <motion.h2 
            className="text-2xl font-bold text-gray-900 mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            大洲轮廓 - {['标准精度', '高精度', '超精细'][['standard', 'precise', 'ultra'].indexOf(precisionLevel)]}
          </motion.h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {CONTINENTS.map((continent, index) => (
              <motion.div
                key={continent.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <MapPreview
                  path={getPath('continent', continent.id)}
                  color={continent.color}
                  label={continent.name}
                  size="large"
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Country Section */}
        <section className="mb-16">
          <motion.h2 
            className="text-2xl font-bold text-gray-900 mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            咖啡产国轮廓 - 按大洲分类
          </motion.h2>
          
          {CONTINENTS.map((continent) => (
            <div key={continent.id} className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: continent.color }}></span>
                {continent.name}
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {COUNTRIES.filter(c => c.continent === continent.id).map((country, index) => (
                  <motion.div
                    key={country.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * index }}
                    onClick={() => setSelectedCountry(country.name)}
                    className="cursor-pointer"
                  >
                    <MapPreview
                      path={getPath('country', country.name)}
                      color={continent.color}
                      label={country.name}
                      size="small"
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Comparison Section */}
        <section className="mb-16">
          <motion.h2 
            className="text-2xl font-bold text-gray-900 mb-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            精度对比 - 以巴西为例
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(['standard', 'precise', 'ultra'] as PrecisionLevel[]).map((level, index) => (
              <motion.div
                key={level}
                className="bg-white p-6 rounded-xl shadow-md border-2 border-gray-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + 0.1 * index }}
              >
                <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">
                  {level === 'standard' && '📍 标准精度'}
                  {level === 'precise' && '🎯 高精度'}
                  {level === 'ultra' && '💎 超精细'}
                </h3>
                <div className="w-full h-48 mb-4">
                  <svg viewBox="0 0 100 100" className="w-full h-full">
                    <path
                      d={
                        level === 'standard' 
                          ? getCountryPath('巴西')
                          : level === 'precise'
                          ? getPreciseCountryPath('巴西')
                          : getUltraPreciseCountryPath('巴西')
                      }
                      fill="#81B29A20"
                      stroke="#81B29A"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div className="text-center text-sm text-gray-600">
                  {level === 'standard' && '~15-20 个控制点'}
                  {level === 'precise' && '~25-35 个控制点'}
                  {level === 'ultra' && '~35-50 个控制点'}
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Technical Details */}
        <section className="p-8 bg-white rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">技术细节</h3>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-3">数据来源</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>标准精度：手工优化的简化贝塞尔曲线</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>高精度：基于 Natural Earth 1:50m 数据</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>超精细：基于 Natural Earth 1:10m 数据</span>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-3">性能对比</h4>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">⚡</span>
                  <span>标准精度：文件大小 ~6KB，渲染 &lt;1ms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">⚡</span>
                  <span>高精度：文件大小 ~12KB，渲染 &lt;2ms</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">⚡</span>
                  <span>超精细：文件大小 ~18KB，渲染 &lt;3ms</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-blue-800">
              <strong>💡 推荐：</strong>对于 CoffeeAtlas 应用，建议使用<span className="font-bold">超精细精度</span>。
              它在保持优秀性能的同时，提供了最佳的地理识别度和视觉美感。
              实际测试表明，即使在小尺寸图标下，超精细版本也能清晰展现各国的地理特征。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
