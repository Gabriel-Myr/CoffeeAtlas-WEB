import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export type ReviewComparedField = {
  field: string;
  existingValue: string | number | null;
  ocrValue: string | number | null;
  kind: 'mismatch' | 'missing_in_db' | 'missing_in_ocr';
};

export type ReviewItem = {
  id: string;
  title: string;
  status: string;
  sourceItemId: string | null;
  sourceSkuId: string | null;
  productUrl: string | null;
  imageUrl: string | null;
  highConfidenceIssues?: ReviewComparedField[];
  fillCandidates?: ReviewComparedField[];
  ocr: {
    text: string;
    confidence: string;
    warnings: string[];
  };
};

export type ReviewSummary = {
  total: number;
  hardMismatch: number;
  processMethodMismatch: number;
  originMismatch: number;
  weightFill: number;
  roastLevelFill: number;
};

export type ReviewPayload = {
  summary: ReviewSummary;
  items: ReviewItem[];
};

export type ReviewDecisionPatch = {
  changes: Record<string, string | number>;
  nextStatus: 'ACTIVE' | 'DRAFT' | 'ARCHIVED' | 'UNCHANGED';
  note: string;
};

export type ReviewDecision = {
  reviewItemId: string;
  entityId: string;
  entityType: 'ROASTER_BEAN';
  patch: ReviewDecisionPatch;
  createdAt: string;
  persistedToDb: boolean;
  dbRequestId?: string | null;
};

const TMP_DIR = '/tmp';
const REVIEW_FILE_PREFIX = 'taobao-ocr-high-confidence-';
export const DEFAULT_DECISIONS_FILE = path.join(TMP_DIR, 'taobao-ocr-review-decisions.json');

export async function findLatestReviewFile() {
  const entries = await readdir(TMP_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.startsWith(REVIEW_FILE_PREFIX) && entry.name.endsWith('.json'))
    .map((entry) => path.join(TMP_DIR, entry.name))
    .sort()
    .reverse()[0] ?? null;
}

export async function loadReviewPayload(filePath?: string | null): Promise<{ filePath: string; payload: ReviewPayload } | null> {
  const target = filePath?.trim() || (await findLatestReviewFile());
  if (!target) return null;
  const raw = await readFile(target, 'utf8');
  return {
    filePath: target,
    payload: JSON.parse(raw) as ReviewPayload,
  };
}

export async function loadReviewDecisions(filePath = DEFAULT_DECISIONS_FILE): Promise<ReviewDecision[]> {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw) as { decisions?: ReviewDecision[] } | ReviewDecision[];
    if (Array.isArray(parsed)) return parsed;
    return parsed.decisions ?? [];
  } catch {
    return [];
  }
}

export async function saveReviewDecisions(decisions: ReviewDecision[], filePath = DEFAULT_DECISIONS_FILE) {
  await writeFile(filePath, JSON.stringify({ decisions }, null, 2));
}

export function filterPendingReviewItems(items: ReviewItem[], decisions: ReviewDecision[]) {
  const handled = new Set(decisions.map((decision) => decision.reviewItemId));
  return items.filter((item) => !handled.has(item.id));
}

function parseEditableValue(key: string, value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (key === 'weightGrams') {
    const parsed = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  }
  return trimmed;
}

export function buildDecisionPatch(input: {
  nextStatus?: string | null;
  note?: string | null;
  fields: Record<string, string | undefined>;
}): ReviewDecisionPatch {
  const changes = Object.fromEntries(
    Object.entries(input.fields)
      .map(([key, value]) => [key, parseEditableValue(key, value ?? '')] as const)
      .filter((entry): entry is [string, string | number] => entry[1] !== null)
  );

  const nextStatus =
    input.nextStatus === 'ACTIVE' || input.nextStatus === 'DRAFT' || input.nextStatus === 'ARCHIVED'
      ? input.nextStatus
      : 'UNCHANGED';

  return {
    changes,
    nextStatus,
    note: input.note?.trim() ?? '',
  };
}

export function upsertDecision(decisions: ReviewDecision[], nextDecision: ReviewDecision) {
  const index = decisions.findIndex((decision) => decision.reviewItemId === nextDecision.reviewItemId);
  if (index === -1) {
    return [...decisions, nextDecision];
  }

  const cloned = [...decisions];
  cloned[index] = nextDecision;
  return cloned;
}
