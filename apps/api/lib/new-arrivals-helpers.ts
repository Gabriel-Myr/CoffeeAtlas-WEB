export interface IngestionEventEntityRow {
  entity_id: string | null;
  action: 'INSERT' | 'UPDATE' | 'UPSERT' | 'SKIP' | 'ERROR' | null;
}

export function extractLatestNewArrivalBeanIds(rows: IngestionEventEntityRow[]): string[] {
  return Array.from(
    new Set(
      rows
        .filter((row) => row.action === 'INSERT' || row.action === 'UPSERT')
        .map((row) => row.entity_id)
        .filter((id): id is string => typeof id === 'string' && id.length > 0)
    )
  );
}
