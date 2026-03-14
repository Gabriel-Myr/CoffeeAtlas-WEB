import { apiSuccess } from '@/lib/server/api-helpers';
import { hasSupabaseServerEnv } from '@/lib/supabase';

function hasWechatConfig() {
  return Boolean(process.env.WECHAT_APP_ID && process.env.WECHAT_APP_SECRET);
}

function hasJwtConfig() {
  return Boolean(process.env.APP_JWT_SECRET);
}

export async function GET() {
  return apiSuccess({
    service: 'coffeestories-webdb',
    ts: new Date().toISOString(),
    supabaseConfigured: hasSupabaseServerEnv,
    wechatConfigured: hasWechatConfig(),
    jwtConfigured: hasJwtConfig(),
  });
}
