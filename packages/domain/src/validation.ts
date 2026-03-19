export function validateSnapshotId(id: string): boolean {
  return id.trim().length > 0;
}

export function toSnapshotText(value: string | null | undefined): string | null {
  if (value == null) {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

export function toSnapshotPrice(value: number): number {
  return Number.isFinite(value) ? value : 0;
}
