import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const ids = [
  'ec5d65e2-7cfe-4c8f-9075-be5f27d9a6be',
  '93e7569f-4c15-4a82-9b77-3733de82bd9b',
  '8ca95052-8149-47f7-99c3-7afd1419c407',
  'e5b5ee39-79d5-43ee-b280-2e77a1b7abca',
  '66efae71-99ab-4be9-b392-d28a3e7f9841',
  'd639c7d2-b302-4ad7-b99f-aa3d31506dcf',
  '5f6fc3a6-93d0-4acf-af5f-98da38fad2c9',
  'a9a8de6f-e28a-41dc-8e96-3deac4ae75cd'
];

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await db
  .from('v_catalog_active')
  .select('roaster_bean_id, display_name, roaster_name, updated_at')
  .in('roaster_bean_id', ids)
  .order('updated_at', { ascending: false });
if (error) throw error;
console.log(JSON.stringify({ count: data?.length ?? 0, items: data }, null, 2));
