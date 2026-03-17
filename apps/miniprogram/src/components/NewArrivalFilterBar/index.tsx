import { Text, View } from '@tarojs/components';

import type {
  NewArrivalFilterOption,
  NewArrivalFiltersMode,
} from '../../types';
import './index.scss';

interface NewArrivalFilterBarProps {
  mode: NewArrivalFiltersMode;
  loading: boolean;
  roasterOptions: NewArrivalFilterOption[];
  processOptions: NewArrivalFilterOption[];
  originOptions: NewArrivalFilterOption[];
  selectedRoasterId: string;
  selectedProcess: string;
  selectedOriginCountry: string;
  onRoasterChange: (value: string) => void;
  onProcessChange: (value: string) => void;
  onOriginChange: (value: string) => void;
  onReset: () => void;
}

function getModeCopy(mode: NewArrivalFiltersMode): { title: string; description: string } {
  if (mode === 'personalized') {
    return {
      title: '猜你喜欢',
      description: '根据你的收藏，先把更可能感兴趣的新品维度放在前面。',
    };
  }

  if (mode === 'mixed') {
    return {
      title: '猜你喜欢',
      description: '优先用了你的收藏偏好，不够的部分自动补了当前热门新品。',
    };
  }

  return {
    title: '热门新品筛选',
    description: '你最近的收藏还不够多，先用当前热门维度帮你快速收窄新品。',
  };
}

interface FilterGroupProps {
  title: string;
  options: NewArrivalFilterOption[];
  selectedValue: string;
  onChange: (value: string) => void;
}

function FilterGroup({ title, options, selectedValue, onChange }: FilterGroupProps) {
  if (options.length === 0) return null;

  return (
    <View className="new-arrival-filter-bar__section">
      <Text className="new-arrival-filter-bar__label">{title}</Text>
      <View className="new-arrival-filter-bar__chips">
        {options.map((option) => {
          const active = selectedValue === option.id;

          return (
            <View
              key={option.id}
              className={`new-arrival-filter-chip ${active ? 'new-arrival-filter-chip--active' : ''}`}
              onClick={() => onChange(active ? '' : option.id)}
            >
              <Text className="new-arrival-filter-chip__text">{option.label}</Text>
              <Text className="new-arrival-filter-chip__count">{option.count}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

export default function NewArrivalFilterBar({
  mode,
  loading,
  roasterOptions,
  processOptions,
  originOptions,
  selectedRoasterId,
  selectedProcess,
  selectedOriginCountry,
  onRoasterChange,
  onProcessChange,
  onOriginChange,
  onReset,
}: NewArrivalFilterBarProps) {
  const modeCopy = getModeCopy(mode);
  const hasSelection = Boolean(selectedRoasterId || selectedProcess || selectedOriginCountry);
  const hasOptions = roasterOptions.length > 0 || processOptions.length > 0 || originOptions.length > 0;

  if (!loading && !hasOptions) return null;

  return (
    <View className="new-arrival-filter-bar">
      <View className="new-arrival-filter-bar__panel">
        <View className="new-arrival-filter-bar__header">
          <View className="new-arrival-filter-bar__copy">
            <Text className="new-arrival-filter-bar__title">{modeCopy.title}</Text>
            <Text className="new-arrival-filter-bar__description">
              {loading ? '正在读取你的收藏偏好...' : modeCopy.description}
            </Text>
          </View>
          {hasSelection ? (
            <Text className="new-arrival-filter-bar__reset" onClick={onReset}>
              清空
            </Text>
          ) : null}
        </View>

        {loading && !hasOptions ? (
          <Text className="new-arrival-filter-bar__loading">正在整理推荐筛选...</Text>
        ) : (
          <View className="new-arrival-filter-bar__body">
            <FilterGroup
              title="烘焙商"
              options={roasterOptions}
              selectedValue={selectedRoasterId}
              onChange={onRoasterChange}
            />
            <FilterGroup
              title="处理法"
              options={processOptions}
              selectedValue={selectedProcess}
              onChange={onProcessChange}
            />
            <FilterGroup
              title="产地"
              options={originOptions}
              selectedValue={selectedOriginCountry}
              onChange={onOriginChange}
            />
          </View>
        )}
      </View>
    </View>
  );
}
