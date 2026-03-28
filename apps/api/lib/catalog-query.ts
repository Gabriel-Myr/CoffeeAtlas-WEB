export function normalizeCatalogSearchTerm(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const normalized = value.replace(/\s+/g, ' ').trim();
  return normalized.length > 0 ? normalized : undefined;
}

export function sanitizeCatalogSearchTerm(value: string | undefined): string | undefined {
  const normalized = normalizeCatalogSearchTerm(value);
  if (!normalized) return undefined;

  const syntaxSafe = normalized
    .replace(/[,%()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return syntaxSafe.length > 0 ? syntaxSafe : undefined;
}

export function buildCatalogIlikePattern(value: string | undefined): string | undefined {
  const sanitized = sanitizeCatalogSearchTerm(value);
  if (!sanitized) return undefined;
  return `%${sanitized}%`;
}
