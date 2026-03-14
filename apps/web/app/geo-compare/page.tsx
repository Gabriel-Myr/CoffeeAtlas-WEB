'use client';

import { useMemo, useState } from 'react';
import { motion } from 'motion/react';

import {
  ORIGIN_ATLAS_CONTINENTS,
  ORIGIN_ATLAS_COUNTRIES,
  getContinentPath,
  getCountryPath,
} from '@/lib/geo-data';
import { getPreciseContinentPath, getPreciseCountryPath } from '@/lib/geo-data-precise';
import { getUltraPreciseContinentPath, getUltraPreciseCountryPath } from '@/lib/geo-data-ultra';

type PrecisionLevel = 'standard' | 'precise' | 'ultra';

const PRECISION_COPY: Record<PrecisionLevel, { name: string; description: string; points: string; performance: string }> = {
  standard: {
    name: '默认 atlas',
    description: '首页当前使用的轮廓版本，强调辨识度和编排稳定性。',
    points: '~20-30 个控制点',
    performance: '最优',
  },
  precise: {
    name: '高精度',
    description: '基于 Natural Earth 简化后的高精度路径，更适合做细节核对。',
    points: '~30-40 个控制点',
    performance: '优秀',
  },
  ultra: {
    name: '超精细',
    description: '用于路径验证的更细密版本，保留更多边界特征。',
    points: '~40-55 个控制点',
    performance: '良好',
  },
};

function MapPreview({ path, color, label, size = 'medium' }: { path: string; color: string; label: string; size?: 'small' | 'medium' | 'large' }) {
  const sizeClasses = {
    small: 'h-16 w-16',
    medium: 'h-24 w-24',
    large: 'h-32 w-32',
  };

  return (
    <motion.div
      className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
      whileHover={{ scale: 1.04 }}
      transition={{ type: 'spring', stiffness: 280 }}
    >
      <div className={sizeClasses[size]}>
        <svg viewBox="0 0 120 120" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
          <path d={path} fill={`${color}20`} stroke={color} strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
      <span className="text-center text-xs font-medium text-gray-600">{label}</span>
    </motion.div>
  );
}

export default function GeoPrecisionDemoPage() {
  const [precisionLevel, setPrecisionLevel] = useState<PrecisionLevel>('ultra');

  const countriesByContinent = useMemo(() => {
    return ORIGIN_ATLAS_CONTINENTS.map((continent) => ({
      ...continent,
      countries: ORIGIN_ATLAS_COUNTRIES.filter((country) => country.continentId === continent.id),
    }));
  }, []);

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

  const info = PRECISION_COPY[precisionLevel];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <motion.h1
            className="mb-4 text-4xl font-bold text-gray-900"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
          >
            地理轮廓精度对比
          </motion.h1>
          <p className="mb-8 text-lg text-gray-600">同一份 atlas 国家清单，切换不同精度版本查看轮廓差异。</p>

          <div className="flex flex-wrap justify-center gap-4">
            {(['standard', 'precise', 'ultra'] as PrecisionLevel[]).map((level) => (
              <motion.button
                key={level}
                onClick={() => setPrecisionLevel(level)}
                className={[
                  'rounded-full px-8 py-3 font-medium transition-all',
                  precisionLevel === level
                    ? 'scale-105 bg-gray-900 text-white shadow-lg'
                    : 'border-2 border-gray-300 bg-white text-gray-700 hover:border-gray-400',
                ].join(' ')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.96 }}
              >
                {level === 'standard' ? '默认 atlas' : level === 'precise' ? '高精度' : '超精细'}
              </motion.button>
            ))}
          </div>

          <motion.div
            key={precisionLevel}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto mt-8 max-w-2xl rounded-2xl border border-gray-200 bg-white p-6 shadow-md"
          >
            <h2 className="text-xl font-bold text-gray-900">{info.name}</h2>
            <p className="mt-2 text-gray-600">{info.description}</p>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-sm text-gray-500">控制点数量</div>
                <div className="font-bold text-gray-900">{info.points}</div>
              </div>
              <div className="rounded-xl bg-gray-50 p-3">
                <div className="text-sm text-gray-500">性能表现</div>
                <div className="font-bold text-gray-900">{info.performance}</div>
              </div>
            </div>
          </motion.div>
        </header>

        <section className="mb-16">
          <motion.h2
            className="mb-8 text-center text-2xl font-bold text-gray-900"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
          >
            大洲轮廓
          </motion.h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {ORIGIN_ATLAS_CONTINENTS.map((continent, index) => (
              <motion.div key={continent.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * index }}>
                <MapPreview path={getPath('continent', continent.id)} color={continent.color} label={continent.name} size="large" />
              </motion.div>
            ))}
          </div>
        </section>

        <section className="space-y-10">
          {countriesByContinent.map((continent) => (
            <div key={continent.id}>
              <h3 className="mb-5 flex items-center gap-3 text-lg font-semibold text-gray-700">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: continent.color }} />
                {continent.name}
              </h3>
              <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {continent.countries.map((country, index) => (
                  <motion.div
                    key={country.name}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.04 * index }}
                  >
                    <MapPreview path={getPath('country', country.name)} color={country.color} label={country.name} size="small" />
                  </motion.div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
