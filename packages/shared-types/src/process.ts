export type ProcessBaseId = 'washed' | 'natural' | 'honey' | 'other';
export type ProcessStyleId = 'traditional' | 'anaerobic' | 'yeast' | 'carbonic_maceration' | 'thermal_shock' | 'other';

export interface ProcessOptionDefinition<T extends string> {
  id: T;
  label: string;
}

export interface NormalizedProcess {
  raw: string;
  base: ProcessBaseId;
  style: ProcessStyleId;
  baseLabel: string;
  styleLabel: string;
  label: string;
}

export const PROCESS_BASE_DEFINITIONS: ProcessOptionDefinition<ProcessBaseId>[] = [
  { id: 'washed', label: '水洗' },
  { id: 'natural', label: '日晒' },
  { id: 'honey', label: '蜜处理' },
  { id: 'other', label: '其他' },
];

export const PROCESS_STYLE_DEFINITIONS: ProcessOptionDefinition<ProcessStyleId>[] = [
  { id: 'traditional', label: '传统' },
  { id: 'anaerobic', label: '厌氧' },
  { id: 'yeast', label: '酵母' },
  { id: 'carbonic_maceration', label: '二氧化碳浸渍' },
  { id: 'thermal_shock', label: '热冲击' },
  { id: 'other', label: '其他' },
];

const PROCESS_BASE_LABELS = new Map(PROCESS_BASE_DEFINITIONS.map((item) => [item.id, item.label]));
const PROCESS_STYLE_LABELS = new Map(PROCESS_STYLE_DEFINITIONS.map((item) => [item.id, item.label]));

const PROCESS_BASE_PATTERNS: Array<{ id: ProcessBaseId; patterns: RegExp[] }> = [
  { id: 'honey', patterns: [/\bhoney\b/i, /蜜处理/, /密处理/, /黄蜜/, /红蜜/, /黑蜜/] },
  { id: 'washed', patterns: [/\bwashed\b/i, /\bwash\b/i, /水洗/] },
  { id: 'natural', patterns: [/\bnatural\b/i, /日晒/, /日曬/, /晒处理/, /曬處理/] },
];

const PROCESS_STYLE_PATTERNS: Array<{ id: ProcessStyleId; patterns: RegExp[] }> = [
  { id: 'thermal_shock', patterns: [/\bthermal\s*shock\b/i, /热冲击/, /熱衝擊/] },
  { id: 'carbonic_maceration', patterns: [/\bcarbonic\b/i, /二氧化碳/, /二氧化碳浸渍/, /二氧化碳浸漬/] },
  { id: 'yeast', patterns: [/\byeast\b/i, /酵母/] },
  { id: 'anaerobic', patterns: [/\banaerobic\b/i, /厌氧/, /厭氧/] },
];

function normalizeRawText(value: string | null | undefined): string {
  if (typeof value !== 'string') return '';
  return value.trim().replace(/\s+/g, ' ');
}

export function getProcessBaseLabel(base: ProcessBaseId): string {
  return PROCESS_BASE_LABELS.get(base) ?? '其他';
}

export function getProcessStyleLabel(style: ProcessStyleId): string {
  return PROCESS_STYLE_LABELS.get(style) ?? '其他';
}

export function isProcessBaseId(value: string | null | undefined): value is ProcessBaseId {
  return value === 'washed' || value === 'natural' || value === 'honey' || value === 'other';
}

export function isProcessStyleId(value: string | null | undefined): value is ProcessStyleId {
  return (
    value === 'traditional' ||
    value === 'anaerobic' ||
    value === 'yeast' ||
    value === 'carbonic_maceration' ||
    value === 'thermal_shock' ||
    value === 'other'
  );
}

export function formatProcessLabel(base: ProcessBaseId, style: ProcessStyleId): string {
  const baseLabel = getProcessBaseLabel(base);
  const styleLabel = getProcessStyleLabel(style);

  if (base === 'other') {
    if (style === 'other' || style === 'traditional') return baseLabel;
    return `${styleLabel}处理`;
  }

  if (style === 'traditional') return baseLabel;
  if (style === 'other') return `${baseLabel}·其他工艺`;
  return `${styleLabel}${baseLabel}`;
}

export function normalizeProcess(
  raw: string | null | undefined,
  overrides?: {
    base?: ProcessBaseId | null;
    style?: ProcessStyleId | null;
  }
): NormalizedProcess {
  const normalizedRaw = normalizeRawText(raw);
  const base =
    overrides?.base && isProcessBaseId(overrides.base)
      ? overrides.base
      : PROCESS_BASE_PATTERNS.find((entry) => entry.patterns.some((pattern) => pattern.test(normalizedRaw)))?.id ?? 'other';

  const style =
    overrides?.style && isProcessStyleId(overrides.style)
      ? overrides.style
      : PROCESS_STYLE_PATTERNS.find((entry) => entry.patterns.some((pattern) => pattern.test(normalizedRaw)))?.id ??
        (base === 'other' ? 'other' : 'traditional');

  const baseLabel = getProcessBaseLabel(base);
  const styleLabel = getProcessStyleLabel(style);

  return {
    raw: normalizedRaw,
    base,
    style,
    baseLabel,
    styleLabel,
    label: formatProcessLabel(base, style),
  };
}

export function getAvailableProcessStyleDefinitions(base?: ProcessBaseId | null): ProcessOptionDefinition<ProcessStyleId>[] {
  if (base === 'other') {
    return PROCESS_STYLE_DEFINITIONS.filter((definition) => definition.id === 'other');
  }

  return PROCESS_STYLE_DEFINITIONS;
}
