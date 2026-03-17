import { extractLatestNewArrivalBeanIds, type IngestionEventEntityRow } from './new-arrivals-helpers';
import { requireSupabaseServer } from '@/lib/supabase';

interface ImportJobIdRow {
  id: string;
}

export async function getLatestSyncedNewArrivalBeanIds(): Promise<string[]> {
  const supabaseServer = requireSupabaseServer();

  const { data: latestJob, error: latestJobError } = await supabaseServer
    .from('import_jobs')
    .select('id')
    .eq('job_type', 'SCRAPE_SYNC')
    .eq('file_name', 'sync-taobao-new-arrivals')
    .in('status', ['SUCCEEDED', 'PARTIAL'])
    .order('completed_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestJobError) throw latestJobError;

  const jobId = (latestJob as ImportJobIdRow | null)?.id;
  if (!jobId) return [];

  const { data: ingestionEvents, error: ingestionEventsError } = await supabaseServer
    .from('ingestion_events')
    .select('entity_id, action')
    .eq('import_job_id', jobId)
    .eq('entity_type', 'ROASTER_BEAN');

  if (ingestionEventsError) throw ingestionEventsError;

  return extractLatestNewArrivalBeanIds((ingestionEvents ?? []) as IngestionEventEntityRow[]);
}

export async function getLatestSyncedNewArrivalBeanIdSet(): Promise<Set<string>> {
  return new Set(await getLatestSyncedNewArrivalBeanIds());
}
