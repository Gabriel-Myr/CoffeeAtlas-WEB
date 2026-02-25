'use client';

import { useEffect, useState, useRef } from 'react';
import { Search, ChevronDown, X, Plus } from 'lucide-react';
import type { PublishStatus } from '@/lib/types';

interface Roaster {
  id: string;
  name: string;
  city: string | null;
  countryCode: string | null;
}

interface AddBeanFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  roasterId: string;
  roasterName: string;
  city: string;
  countryCode: string;
  beanName: string;
  originCountry: string;
  originRegion: string;
  processMethod: string;
  variety: string;
  displayName: string;
  roastLevel: string;
  priceAmount: string;
  priceCurrency: string;
  productUrl: string;
  flavorTags: string;
  isInStock: boolean;
  status: PublishStatus;
}

interface FormErrors {
  [key: string]: string;
}

const initialFormData: FormData = {
  roasterId: '',
  roasterName: '',
  city: '',
  countryCode: '',
  beanName: '',
  originCountry: '',
  originRegion: '',
  processMethod: '',
  variety: '',
  displayName: '',
  roastLevel: '',
  priceAmount: '',
  priceCurrency: 'CNY',
  productUrl: '',
  flavorTags: '',
  isInStock: true,
  status: 'DRAFT',
};

const roastLevels = ['', 'Light', 'Medium', 'Medium-Dark', 'Dark'];
const processMethods = ['', 'Washed', 'Natural', 'Honey', 'Wet-Hulled', 'Anaerobic', 'Other'];
const currencies = ['CNY', 'USD', 'EUR', 'JPY', 'GBP'];

function SearchableSelect({
  value,
  onChange,
  options,
  onSearch,
  placeholder,
  error,
  onCreateNew,
}: {
  value: string;
  onChange: (value: string, option?: Roaster) => void;
  options: Roaster[];
  onSearch: (query: string) => void;
  placeholder: string;
  error?: string;
  onCreateNew?: (name: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((o) => o.id === value || o.name === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, onSearch]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option: Roaster) => {
    onChange(option.id, option);
    setSearch('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const showCreateOption = search.trim() && !options.some(
    (o) => o.name.toLowerCase() === search.trim().toLowerCase()
  );

  return (
    <div ref={wrapperRef} className="relative">
      <div
        className={`w-full px-4 py-3 bg-[var(--color-bg-warm)] border rounded-2xl text-[var(--color-coffee-dark)] focus-within:outline-none focus-within:ring-2 focus-within:ring-[var(--color-coffee-light)]/30 focus-within:border-transparent transition-all cursor-pointer flex items-center justify-between ${
          error ? 'border-[var(--color-accent-rust)]' : 'border-[var(--color-coffee-light)]/20'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedOption ? 'text-[var(--color-coffee-dark)]' : 'text-[var(--color-coffee-light)]/50'}>
          {selectedOption ? (
            <span>
              {selectedOption.name}
              {selectedOption.city && (
                <span className="text-[var(--color-coffee-light)] ml-1">- {selectedOption.city}</span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown className={`h-5 w-5 text-[var(--color-coffee-light)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-[var(--color-coffee-light)]/20 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-2 border-b border-[var(--color-coffee-light)]/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-coffee-light)]" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={handleInputChange}
                placeholder="搜索烘焙商..."
                className="w-full pl-9 pr-3 py-2 bg-[var(--color-bg-warm)] border border-[var(--color-coffee-light)]/20 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-light)]/30"
              />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto">
            {isLoading && (
              <div className="p-3 text-center text-sm text-[var(--color-coffee-light)]">加载中...</div>
            )}
            {!isLoading && options.length === 0 && (
              <div className="p-3 text-center text-sm text-[var(--color-coffee-light)]">未找到匹配的烘焙商</div>
            )}
            {options.map((option) => (
              <div
                key={option.id}
                className="px-4 py-3 hover:bg-[var(--color-bg-warm)] cursor-pointer flex items-center justify-between"
                onClick={() => handleSelect(option)}
              >
                <span className="text-[var(--color-coffee-dark)] font-medium">{option.name}</span>
                {option.city && (
                  <span className="text-sm text-[var(--color-coffee-light)]">{option.city}</span>
                )}
              </div>
            ))}
            {showCreateOption && (
              <div
                className="px-4 py-3 hover:bg-[var(--color-bg-warm)] cursor-pointer flex items-center gap-2 text-[var(--color-accent-rust)]"
                onClick={(e) => {
                  e.stopPropagation();
                  if (onCreateNew) {
                    onCreateNew(search.trim());
                    setIsOpen(false);
                    setSearch('');
                  }
                }}
              >
                <Plus className="h-4 w-4" />
                <span>创建&quot;{search.trim()}&quot;</span>
              </div>
            )}
          </div>
        </div>
      )}

      {error && <span className="text-xs text-[var(--color-accent-rust)] mt-1 block">{error}</span>}
    </div>
  );
}

export default function AddBeanForm({ onSuccess, onCancel }: AddBeanFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);
  const [roasters, setRoasters] = useState<Roaster[]>([]);
  const [roasterSearch, setRoasterSearch] = useState('');

  const handleRoasterSearch = async (query: string) => {
    setRoasterSearch(query);
    try {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      params.set('limit', '50');

      const response = await fetch(`/api/admin/roasters?${params.toString()}`);
      const result = await response.json();

      if (result.ok) {
        setRoasters(result.data);
      }
    } catch (err) {
      console.error('Failed to fetch roasters:', err);
    }
  };

  const handleRoasterChange = (value: string, option?: Roaster) => {
    setFormData((prev) => ({
      ...prev,
      roasterId: value,
      roasterName: option?.name || value,
      city: option?.city || '',
      countryCode: option?.countryCode || '',
    }));
    if (errors.roasterName) {
      setErrors((prev) => ({ ...prev, roasterName: '' }));
    }
    setSubmitResult(null);
  };

  const handleCreateNewRoaster = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      roasterId: '',
      roasterName: name,
    }));
  };

  useEffect(() => {
    handleRoasterSearch('');
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormData((prev) => ({ ...prev, [name]: newValue }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }

    setSubmitResult(null);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.roasterName.trim() && !formData.roasterId) {
      newErrors.roasterName = '请选择或创建烘焙商';
    }

    if (!formData.beanName.trim()) {
      newErrors.beanName = '豆子名称不能为空';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = '商品名不能为空';
    }

    if (formData.priceAmount && isNaN(Number(formData.priceAmount))) {
      newErrors.priceAmount = '请输入有效的价格';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitResult(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const flavorTagsArray = formData.flavorTags
        ? formData.flavorTags.split(',').map((tag) => tag.trim()).filter(Boolean)
        : [];

      const response = await fetch('/api/admin/beans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roasterName: formData.roasterName,
          city: formData.city || undefined,
          countryCode: formData.countryCode || undefined,
          beanName: formData.beanName,
          originCountry: formData.originCountry || undefined,
          originRegion: formData.originRegion || undefined,
          processMethod: formData.processMethod || undefined,
          variety: formData.variety || undefined,
          displayName: formData.displayName,
          roastLevel: formData.roastLevel || undefined,
          priceAmount: formData.priceAmount ? Number(formData.priceAmount) : undefined,
          priceCurrency: formData.priceCurrency || 'CNY',
          productUrl: formData.productUrl || undefined,
          flavorTags: flavorTagsArray.length > 0 ? flavorTagsArray : undefined,
          isInStock: formData.isInStock,
          status: formData.status,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || '提交失败');
      }

      setSubmitResult({
        success: true,
        message: `成功添加豆子：${formData.displayName}`,
      });

      setFormData(initialFormData);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      setSubmitResult({
        success: false,
        message: error instanceof Error ? error.message : '提交失败，请重试',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName = (fieldName: string) =>
    `w-full px-4 py-3 bg-[var(--color-bg-warm)] border rounded-2xl text-[var(--color-coffee-dark)] placeholder-[var(--color-coffee-light)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-light)]/30 focus:border-transparent transition-all ${
      errors[fieldName]
        ? 'border-[var(--color-accent-rust)]'
        : 'border-[var(--color-coffee-light)]/20'
    }`;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* 烘焙商信息 */}
      <div className="bg-[var(--color-bg-warm)] rounded-2xl p-5">
        <h3 className="text-base font-semibold text-[var(--color-coffee-dark)] mb-4 pb-3 border-b border-[var(--color-coffee-light)]/10">
          烘焙商信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-coffee-light)]">
              烘焙商 <span className="text-[var(--color-accent-rust)]">*</span>
            </label>
            <SearchableSelect
              value={formData.roasterId || formData.roasterName}
              onChange={handleRoasterChange}
              options={roasters}
              onSearch={handleRoasterSearch}
              placeholder="搜索或创建烘焙商..."
              error={errors.roasterName}
              onCreateNew={handleCreateNewRoaster}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="city" className="text-sm font-medium text-[var(--color-coffee-light)]">城市</label>
            <input
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={inputClassName('city')}
              placeholder="例如：上海"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="countryCode" className="text-sm font-medium text-[var(--color-coffee-light)]">国家代码</label>
            <input
              type="text"
              id="countryCode"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              className={inputClassName('countryCode')}
              placeholder="例如：CN"
              maxLength={2}
            />
          </div>
        </div>
      </div>

      {/* 豆子信息 */}
      <div className="bg-[var(--color-bg-warm)] rounded-2xl p-5">
        <h3 className="text-base font-semibold text-[var(--color-coffee-dark)] mb-4 pb-3 border-b border-[var(--color-coffee-light)]/10">
          豆子信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="beanName" className="text-sm font-medium text-[var(--color-coffee-light)]">
              豆子名称 <span className="text-[var(--color-accent-rust)]">*</span>
            </label>
            <input
              type="text"
              id="beanName"
              name="beanName"
              value={formData.beanName}
              onChange={handleChange}
              className={inputClassName('beanName')}
              placeholder="例如：Ethiopia Yirgacheffe"
            />
            {errors.beanName && <span className="text-xs text-[var(--color-accent-rust)]">{errors.beanName}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="originCountry" className="text-sm font-medium text-[var(--color-coffee-light)]">原产国</label>
            <input
              type="text"
              id="originCountry"
              name="originCountry"
              value={formData.originCountry}
              onChange={handleChange}
              className={inputClassName('originCountry')}
              placeholder="例如：Ethiopia"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="originRegion" className="text-sm font-medium text-[var(--color-coffee-light)]">产区</label>
            <input
              type="text"
              id="originRegion"
              name="originRegion"
              value={formData.originRegion}
              onChange={handleChange}
              className={inputClassName('originRegion')}
              placeholder="例如：Yirgacheffe"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="processMethod" className="text-sm font-medium text-[var(--color-coffee-light)]">处理法</label>
            <select
              id="processMethod"
              name="processMethod"
              value={formData.processMethod}
              onChange={handleChange}
              className={inputClassName('processMethod')}
            >
              {processMethods.map((method) => (
                <option key={method} value={method}>
                  {method || '请选择'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="variety" className="text-sm font-medium text-[var(--color-coffee-light)]">品种</label>
            <input
              type="text"
              id="variety"
              name="variety"
              value={formData.variety}
              onChange={handleChange}
              className={inputClassName('variety')}
              placeholder="例如：Heirloom"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="flavorTags" className="text-sm font-medium text-[var(--color-coffee-light)]">风味标签</label>
            <input
              type="text"
              id="flavorTags"
              name="flavorTags"
              value={formData.flavorTags}
              onChange={handleChange}
              className={inputClassName('flavorTags')}
              placeholder="用逗号分隔：jasmine, lemon"
            />
          </div>
        </div>
      </div>

      {/* 商品信息 */}
      <div className="bg-[var(--color-bg-warm)] rounded-2xl p-5">
        <h3 className="text-base font-semibold text-[var(--color-coffee-dark)] mb-4 pb-3 border-b border-[var(--color-coffee-light)]/10">
          商品信息
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="displayName" className="text-sm font-medium text-[var(--color-coffee-light)]">
              商品名称 <span className="text-[var(--color-accent-rust)]">*</span>
            </label>
            <input
              type="text"
              id="displayName"
              name="displayName"
              value={formData.displayName}
              onChange={handleChange}
              className={inputClassName('displayName')}
              placeholder="例如：耶加雪菲 G1 水洗"
            />
            {errors.displayName && <span className="text-xs text-[var(--color-accent-rust)]">{errors.displayName}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="roastLevel" className="text-sm font-medium text-[var(--color-coffee-light)]">烘焙度</label>
            <select
              id="roastLevel"
              name="roastLevel"
              value={formData.roastLevel}
              onChange={handleChange}
              className={inputClassName('roastLevel')}
            >
              {roastLevels.map((level) => (
                <option key={level} value={level}>
                  {level || '请选择'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="priceAmount" className="text-sm font-medium text-[var(--color-coffee-light)]">价格</label>
            <input
              type="number"
              id="priceAmount"
              name="priceAmount"
              value={formData.priceAmount}
              onChange={handleChange}
              className={inputClassName('priceAmount')}
              placeholder="128"
              min="0"
              step="0.01"
            />
            {errors.priceAmount && <span className="text-xs text-[var(--color-accent-rust)]">{errors.priceAmount}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="priceCurrency" className="text-sm font-medium text-[var(--color-coffee-light)]">货币</label>
            <select
              id="priceCurrency"
              name="priceCurrency"
              value={formData.priceCurrency}
              onChange={handleChange}
              className={inputClassName('priceCurrency')}
            >
              {currencies.map((cur) => (
                <option key={cur} value={cur}>
                  {cur}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2 flex flex-col gap-1.5">
            <label htmlFor="productUrl" className="text-sm font-medium text-[var(--color-coffee-light)]">商品链接</label>
            <input
              type="url"
              id="productUrl"
              name="productUrl"
              value={formData.productUrl}
              onChange={handleChange}
              className={inputClassName('productUrl')}
              placeholder="https://..."
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[var(--color-coffee-light)]">状态</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClassName('status')}
            >
              <option value="DRAFT">草稿</option>
              <option value="ACTIVE">上线</option>
              <option value="ARCHIVED">归档</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isInStock"
                checked={formData.isInStock}
                onChange={handleChange}
                className="w-5 h-5 rounded border-[var(--color-coffee-light)]/30 text-[var(--color-accent-olive)] focus:ring-[var(--color-accent-olive)]/30"
              />
              <span className="text-sm font-medium text-[var(--color-coffee-dark)]">有货</span>
            </label>
          </div>
        </div>
      </div>

      {submitResult && (
        <div className={`p-4 rounded-2xl text-sm font-medium ${
          submitResult.success
            ? 'bg-[var(--color-accent-olive)]/10 text-[var(--color-accent-olive)] border border-[var(--color-accent-olive)]/20'
            : 'bg-[var(--color-accent-rust)]/10 text-[var(--color-accent-rust)] border border-[var(--color-accent-rust)]/20'
        }`}>
          {submitResult.message}
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-[var(--color-bg-warm)] border border-[var(--color-coffee-light)]/20 rounded-full text-[var(--color-coffee-light)] font-medium hover:bg-[var(--color-coffee-light)]/10 transition-all"
          >
            取消
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-3 bg-[var(--color-coffee-dark)] text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all hover:bg-[var(--color-coffee-medium)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : '添加豆子'}
        </button>
      </div>
    </form>
  );
}
