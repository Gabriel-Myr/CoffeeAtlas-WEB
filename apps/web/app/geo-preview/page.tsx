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

const MapPreview = ({ path, color, label }: { path: string; color: string; label: string }) => (
  <div className="flex flex-col items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="h-24 w-24">
      <svg viewBox="0 0 120 120" className="h-full w-full" preserveAspectRatio="xMidYMid meet">
        <path d={path} fill={`${color}20`} stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    </div>
    <span className="text-center text-xs font-medium text-gray-600">{label}</span>
  </div>
);

export default function GeoDataComparisonPage() {
  const [precisionLevel, setPrecisionLevel] = useState<'standard' | 'precise'>('precise');

  const countriesByContinent = useMemo(() => {
    return ORIGIN_ATLAS_CONTINENTS.map((continent) => ({
      ...continent,
      countries: ORIGIN_ATLAS_COUNTRIES.filter((country) => country.continentId === continent.id),
    }));
  }, []);

  const getPath = (type: 'continent' | 'country', id: string) => {
    if (precisionLevel === 'precise') {
      return type === 'continent' ? getPreciseContinentPath(id) : getPreciseCountryPath(id);
    }

    return type === 'continent' ? getContinentPath(id) : getCountryPath(id);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-12">
      <div className="mx-auto max-w-7xl">
        <header className="mb-12 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">地理轮廓数据对照</h1>
          <p className="mb-6 text-gray-600">首页 atlas 当前使用同一套国家清单，这里用来核对默认轮廓与精细轮廓。</p>

          <div className="flex justify-center gap-4">
            <button
              onClick={() => setPrecisionLevel('standard')}
              className={[
                'rounded-full px-6 py-2 font-medium transition-all',
                precisionLevel === 'standard' ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700',
              ].join(' ')}
            >
              默认 atlas
            </button>
            <button
              onClick={() => setPrecisionLevel('precise')}
              className={[
                'rounded-full px-6 py-2 font-medium transition-all',
                precisionLevel === 'precise' ? 'bg-gray-900 text-white' : 'border border-gray-300 bg-white text-gray-700',
              ].join(' ')}
            >
              高精度版本
            </button>
          </div>
        </header>

        <section className="mb-16">
          <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">大洲轮廓</h2>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            {ORIGIN_ATLAS_CONTINENTS.map((continent) => (
              <MapPreview key={continent.id} path={getPath('continent', continent.id)} color={continent.color} label={continent.name} />
            ))}
          </div>
        </section>

        <section className="space-y-10">
          {countriesByContinent.map((continent, continentIndex) => (
            <motion.div
              key={continent.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: continentIndex * 0.06 }}
            >
              <h2 className="mb-5 flex items-center gap-3 text-xl font-bold text-gray-900">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: continent.color }} />
                {continent.name}
              </h2>
              <div className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6">
                {continent.countries.map((country) => (
                  <MapPreview key={country.name} path={getPath('country', country.name)} color={country.color} label={country.name} />
                ))}
              </div>
            </motion.div>
          ))}
        </section>
      </div>
    </div>
  );
}
