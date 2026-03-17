import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const latestJobId = '6413d1b9-d7c4-427a-8d0b-d30a4ee1962a';
const { data, error } = await db
  .from('ingestion_events')
  .select('entity_id, action, payload')
  .eq('import_job_id', latestJobId)
  .eq('entity_type', 'ROASTER_BEAN')
  .in('action', ['INSERT', 'UPSERT'])
  .order('created_at', { ascending: false });
if (error) throw error;
console.log(JSON.stringify(data, null, 2));
