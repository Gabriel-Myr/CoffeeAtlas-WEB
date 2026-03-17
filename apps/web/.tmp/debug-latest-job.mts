import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: job, error: jobError } = await db
  .from('import_jobs')
  .select('id, file_name, job_type, status, created_at, completed_at, summary')
  .eq('job_type', 'SCRAPE_SYNC')
  .eq('file_name', 'sync-taobao-new-arrivals')
  .in('status', ['SUCCEEDED', 'PARTIAL'])
  .order('completed_at', { ascending: false, nullsFirst: false })
  .order('created_at', { ascending: false })
  .limit(3);
if (jobError) throw jobError;
console.log(JSON.stringify(job, null, 2));
