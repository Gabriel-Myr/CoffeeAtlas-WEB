'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Search, RefreshCw, Plus, X, ArrowLeft, Package, Building2 } from 'lucide-react';
import type {
  CatalogListResponse,
  CatalogRow,
  CatalogStatusFilter,
  ImportApiResponse,
  ImportInputRow,
} from '@/lib/types';
import AddBeanForm from '@/components/AddBeanForm';

const SAMPLE_IMPORT_JSON = `[
  {
    "roasterName": "Captain George",
    "city": "Guiyang",
    "countryCode": "CN",
    "beanName": "Ethiopia Yirgacheffe G1",
    "originCountry": "Ethiopia",
    "originRegion": "Yirgacheffe",
    "processMethod": "Washed",
    "variety": "Heirloom",
    "displayName": "Black Cat Blend - Ethiopia Lot",
    "roastLevel": "Light",
    "priceAmount": 128,
    "priceCurrency": "CNY",
    "isInStock": true,
    "status": "ACTIVE",
    "productUrl": "https://example.com/beans/ethiopia-lot",
    "flavorTags": ["jasmine", "lemon"]
  }
]`;

const INITIAL_ROASTERS = [
  { roasterName: "有容乃大", city: "上海", countryCode: "CN" },
  { roasterName: "白鲸咖啡豆子店", city: "上海", countryCode: "CN" },
  { roasterName: "合豆", city: "株洲", countryCode: "CN" },
  { roasterName: "启程拓殖", city: "上海", countryCode: "CN" },
  { roasterName: "治光师", city: "合肥", countryCode: "CN" },
  { roasterName: "Rightpaw Coffee", city: "上海", countryCode: "CN" },
  { roasterName: "自在心", city: "深圳", countryCode: "CN" },
];

function StatusBadge({ status }: { status: CatalogStatusFilter }) {
  if (status === 'ALL') return null;

  const styles: Record<CatalogStatusFilter, string> = {
    ACTIVE: 'bg-[var(--color-accent-olive)]/10 text-[var(--color-accent-olive)] border-[var(--color-accent-olive)]/20',
    DRAFT: 'bg-[var(--color-coffee-light)]/10 text-[var(--color-coffee-light)] border-[var(--color-coffee-light)]/20',
    ARCHIVED: 'bg-gray-100 text-gray-500 border-gray-200',
    ALL: '',
  };
  const className = styles[status] || styles.DRAFT;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${className}`}>
      {status}
    </span>
  );
}

export default function AdminPage() {
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<CatalogStatusFilter>('ALL');
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadToken, setReloadToken] = useState(0);

  const [importPayload, setImportPayload] = useState(SAMPLE_IMPORT_JSON);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [roasterImporting, setRoasterImporting] = useState(false);
  const [roasterImportMessage, setRoasterImportMessage] = useState<string | null>(null);

  async function handleImportRoasters() {
    setRoasterImporting(true);
    setRoasterImportMessage(null);

    try {
      const response = await fetch('/api/admin/roasters/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roasters: INITIAL_ROASTERS }),
      });

      const result = await response.json();

      if (!response.ok || !result.ok) {
        throw new Error(result.error || '导入失败');
      }

      setRoasterImportMessage(
        `导入完成：新增 ${result.summary.inserted} 个烘焙商，已有 ${result.summary.existed} 个`
      );
      setReloadToken((prev) => prev + 1);
    } catch (err) {
      setRoasterImportMessage(err instanceof Error ? err.message : '导入失败');
    } finally {
      setRoasterImporting(false);
    }
  }

  const queryText = useMemo(() => keyword.trim(), [keyword]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          q: queryText,
          status,
          limit: '120',
          offset: '0',
        });

        const response = await fetch(`/api/admin/catalog?${params.toString()}`, {
          method: 'GET',
          signal: controller.signal,
        });

        const payload = (await response.json()) as CatalogListResponse;
        if (!response.ok || !payload.ok) {
          throw new Error(payload.error ?? 'Catalog fetch failed');
        }

        setRows(payload.data ?? []);
        setTotal(payload.total ?? 0);
      } catch (fetchError) {
        if ((fetchError as Error).name === 'AbortError') {
          return;
        }
        setError(fetchError instanceof Error ? fetchError.message : 'Unknown error');
        setRows([]);
        setTotal(0);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [queryText, status, reloadToken]);

  async function handleImportSubmit() {
    setImportMessage(null);

    let parsedRows: ImportInputRow[];
    try {
      const parsed = JSON.parse(importPayload);
      if (!Array.isArray(parsed)) {
        throw new Error('导入 JSON 必须是数组');
      }
      parsedRows = parsed as ImportInputRow[];
      if (parsedRows.length === 0) {
        throw new Error('导入数组不能为空');
      }
    } catch (parseError) {
      setImportMessage(parseError instanceof Error ? parseError.message : 'JSON 解析失败');
      return;
    }

    try {
      setImporting(true);
      const response = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceName: 'admin-json-import',
          rows: parsedRows,
        }),
      });

      const payload = (await response.json()) as ImportApiResponse;
      if (!response.ok || !payload.ok || !payload.summary) {
        throw new Error(payload.error ?? 'Import failed');
      }

      setImportMessage(
        `导入完成：新增烘焙商 ${payload.summary.insertedRoasters}，新增豆子 ${payload.summary.insertedBeans}，新增商品 ${payload.summary.insertedRoasterBeans}，更新商品 ${payload.summary.updatedRoasterBeans}，错误行 ${payload.summary.errorRows}`
      );
      setReloadToken((prev) => prev + 1);
    } catch (importError) {
      setImportMessage(importError instanceof Error ? importError.message : '导入失败');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-warm)] pb-20">
      {/* Header */}
      <header className="pt-8 pb-6 px-6 md:px-12 max-w-7xl mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a
              href="/"
              className="p-2.5 rounded-full bg-white border border-[var(--color-coffee-light)]/20 shadow-sm hover:shadow-md transition-all text-[var(--color-coffee-light)]"
            >
              <ArrowLeft className="h-5 w-5" />
            </a>
            <div>
              <p className="text-sm text-[var(--color-coffee-light)] uppercase tracking-wider font-medium">
                Admin
              </p>
              <h1 className="text-2xl md:text-3xl font-serif font-medium text-[var(--color-coffee-dark)]">
                Catalog Operations
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-3 bg-[var(--color-coffee-dark)] text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all hover:bg-[var(--color-coffee-medium)]"
          >
            <Plus className="h-5 w-5" />
            添加豆子
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Search Section */}
        <section className="bg-white rounded-3xl shadow-[var(--shadow-card)] p-6 mb-8 border border-[var(--color-coffee-light)]/10">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[var(--color-coffee-light)]/50" />
              <input
                type="text"
                placeholder="搜索烘焙商 / 豆子 / 商品名"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[var(--color-bg-warm)] border border-[var(--color-coffee-light)]/20 rounded-2xl text-[var(--color-coffee-dark)] placeholder-[var(--color-coffee-light)]/50 focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-light)]/30 focus:border-transparent transition-all"
              />
            </div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as CatalogStatusFilter)}
              className="px-4 py-3 bg-[var(--color-bg-warm)] border border-[var(--color-coffee-light)]/20 rounded-2xl text-[var(--color-coffee-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-light)]/30 transition-all min-w-[160px]"
            >
              <option value="ALL">全部状态</option>
              <option value="ACTIVE">ACTIVE</option>
              <option value="DRAFT">DRAFT</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
            <button
              type="button"
              onClick={() => setReloadToken((prev) => prev + 1)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-[var(--color-bg-warm)] border border-[var(--color-coffee-light)]/20 rounded-2xl text-[var(--color-coffee-light)] font-medium hover:bg-[var(--color-coffee-light)]/10 transition-all"
            >
              <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              刷新
            </button>
          </div>
          <p className="mt-4 text-sm text-[var(--color-coffee-light)]">
            当前返回 <strong className="text-[var(--color-coffee-dark)]">{rows.length}</strong> 条，共 <strong className="text-[var(--color-coffee-dark)]">{total}</strong> 条。
          </p>
        </section>

        {/* Table Section */}
        <section className="bg-white rounded-3xl shadow-[var(--shadow-card)] overflow-hidden mb-8 border border-[var(--color-coffee-light)]/10">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <RefreshCw className="h-8 w-8 text-[var(--color-coffee-light)] animate-spin" />
            </div>
          )}
          {!loading && error && (
            <div className="flex flex-col items-center justify-center py-20">
              <p className="text-[var(--color-accent-rust)] font-medium mb-2">查询失败</p>
              <p className="text-[var(--color-coffee-light)] text-sm">{error}</p>
            </div>
          )}
          {!loading && !error && rows.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20">
              <Package className="h-12 w-12 text-[var(--color-coffee-light)]/30 mb-4" />
              <p className="text-[var(--color-coffee-light)]">暂无匹配数据</p>
            </div>
          )}
          {!loading && !error && rows.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[var(--color-coffee-light)]/10">
                    <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-coffee-light)] uppercase tracking-wider">烘焙商</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-coffee-light)] uppercase tracking-wider">豆子</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-coffee-light)] uppercase tracking-wider">商品名</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-coffee-light)] uppercase tracking-wider">处理法</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-coffee-light)] uppercase tracking-wider">烘焙度</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-coffee-light)] uppercase tracking-wider">价格</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-coffee-light)] uppercase tracking-wider">在售</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-[var(--color-coffee-light)] uppercase tracking-wider">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <motion.tr
                      key={row.roasterBeanId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-[var(--color-coffee-light)]/10 hover:bg-[var(--color-bg-warm)]/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <strong className="text-[var(--color-coffee-dark)]">{row.roasterName}</strong>
                      </td>
                      <td className="px-6 py-4 text-[var(--color-coffee-dark)]">{row.beanName}</td>
                      <td className="px-6 py-4 text-[var(--color-coffee-dark)]">{row.displayName}</td>
                      <td className="px-6 py-4 text-[var(--color-coffee-light)]">{row.processMethod ?? '-'}</td>
                      <td className="px-6 py-4 text-[var(--color-coffee-light)]">{row.roastLevel ?? '-'}</td>
                      <td className="px-6 py-4 text-[var(--color-coffee-dark)] font-medium">
                        {row.priceAmount ? `${row.priceAmount} ${row.priceCurrency}` : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 font-medium ${row.isInStock ? 'text-[var(--color-accent-olive)]' : 'text-[var(--color-coffee-light)]'}`}>
                          {row.isInStock ? '✓' : '✗'}
                          {row.isInStock ? '是' : '否'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={row.status} />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Import Section */}
        <section className="bg-white rounded-3xl shadow-[var(--shadow-card)] p-6 border border-[var(--color-coffee-light)]/10">
          <h2 className="text-xl font-serif font-medium text-[var(--color-coffee-dark)] mb-2">
            批量导入（JSON）
          </h2>
          <p className="text-sm text-[var(--color-coffee-light)] mb-4">
            第一步会写入 staging 表，再调用数据库函数做 upsert。
          </p>
          <textarea
            value={importPayload}
            onChange={(e) => setImportPayload(e.target.value)}
            className="w-full h-48 px-4 py-3 bg-[var(--color-bg-warm)] border border-[var(--color-coffee-light)]/20 rounded-2xl text-[var(--color-coffee-dark)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-coffee-light)]/30 focus:border-transparent transition-all resize-none"
            spellCheck={false}
          />
          <div className="flex flex-col md:flex-row justify-between gap-4 mt-4 items-start md:items-center">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleImportSubmit}
                disabled={importing}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-[var(--color-coffee-dark)] text-white rounded-full font-medium shadow-md hover:shadow-lg transition-all hover:bg-[var(--color-coffee-medium)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <RefreshCw className="h-5 w-5 animate-spin" />
                    导入中...
                  </>
                ) : (
                  '执行导入'
                )}
              </button>
              <button
                type="button"
                onClick={handleImportRoasters}
                disabled={roasterImporting}
                className="flex items-center gap-2 px-4 py-3 bg-[var(--color-bg-warm)] border border-[var(--color-coffee-light)]/20 rounded-full font-medium text-[var(--color-coffee-light)] hover:bg-[var(--color-coffee-light)]/10 transition-all disabled:opacity-50"
              >
                <Building2 className="h-5 w-5" />
                {roasterImporting ? '导入中...' : '导入烘焙商'}
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {importMessage && (
                <p className={`text-sm font-medium ${importMessage.includes('完成') ? 'text-[var(--color-accent-olive)]' : 'text-[var(--color-accent-rust)]'}`}>
                  {importMessage}
                </p>
              )}
              {roasterImportMessage && (
                <p className={`text-sm font-medium ${roasterImportMessage.includes('完成') ? 'text-[var(--color-accent-olive)]' : 'text-[var(--color-accent-rust)]'}`}>
                  {roasterImportMessage}
                </p>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Modal */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowAddModal(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-coffee-light)]/10">
              <h2 className="text-xl font-serif font-medium text-[var(--color-coffee-dark)]">添加豆子</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-full hover:bg-[var(--color-bg-warm)] transition-colors"
              >
                <X className="h-6 w-6 text-[var(--color-coffee-light)]" />
              </button>
            </div>
            <div className="p-6">
              <AddBeanForm
                onSuccess={() => {
                  setShowAddModal(false);
                  setReloadToken((prev) => prev + 1);
                }}
                onCancel={() => setShowAddModal(false)}
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
