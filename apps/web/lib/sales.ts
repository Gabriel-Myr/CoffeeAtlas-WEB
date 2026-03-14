export function normalizeSalesCount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }

  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) {
      return null;
    }

    const normalized = raw.replace(/,/g, '').replace(/\+/g, '');
    const wanMatch = normalized.match(/^(\d+(?:\.\d+)?)\s*万$/);
    if (wanMatch) {
      return Math.max(0, Math.round(Number(wanMatch[1]) * 10000));
    }

    const numeric = Number(normalized);
    if (Number.isFinite(numeric)) {
      return Math.max(0, Math.round(numeric));
    }
  }

  return null;
}

export function formatSalesCount(value: number | null): string | null {
  if (value === null) {
    return null;
  }

  if (value >= 10000) {
    return `${(value / 10000).toFixed(value >= 100000 ? 0 : 1)}万`;
  }

  if (value >= 1000) {
    return `${(value / 1000).toFixed(value >= 10000 ? 0 : 1)}K`;
  }

  return String(value);
}
