export function requireSupabaseCatalogRead<T>(
  hasSupabaseEnv: boolean,
  requireClient: () => T
): T {
  if (!hasSupabaseEnv) {
    throw new Error(
      '未配置 Supabase 目录数据环境变量。请先设置 TARO_APP_SUPABASE_URL 和 TARO_APP_SUPABASE_ANON_KEY，并重新编译小程序。当前目录页不再回退到 API 联调地址。'
    );
  }

  return requireClient();
}
