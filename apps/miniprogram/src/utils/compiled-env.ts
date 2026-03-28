type CompiledEnvName =
  | 'TARO_APP_API_URL'
  | 'TARO_APP_SUPABASE_URL'
  | 'TARO_APP_SUPABASE_ANON_KEY';

type GlobalCompiledEnv = {
  __TARO_APP_API_URL__?: unknown;
  __TARO_APP_SUPABASE_URL__?: unknown;
  __TARO_APP_SUPABASE_ANON_KEY__?: unknown;
};

declare const __TARO_APP_API_URL__: string | undefined;
declare const __TARO_APP_SUPABASE_URL__: string | undefined;
declare const __TARO_APP_SUPABASE_ANON_KEY__: string | undefined;

function normalizeEnvValue(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function readGlobalCompiledEnv(name: CompiledEnvName): unknown {
  const env = globalThis as typeof globalThis & GlobalCompiledEnv;

  switch (name) {
    case 'TARO_APP_API_URL':
      return env.__TARO_APP_API_URL__;
    case 'TARO_APP_SUPABASE_URL':
      return env.__TARO_APP_SUPABASE_URL__;
    case 'TARO_APP_SUPABASE_ANON_KEY':
      return env.__TARO_APP_SUPABASE_ANON_KEY__;
  }
}

function readDefinedCompiledEnv(name: CompiledEnvName): string | undefined {
  switch (name) {
    case 'TARO_APP_API_URL':
      return typeof __TARO_APP_API_URL__ !== 'undefined' ? __TARO_APP_API_URL__ : undefined;
    case 'TARO_APP_SUPABASE_URL':
      return typeof __TARO_APP_SUPABASE_URL__ !== 'undefined' ? __TARO_APP_SUPABASE_URL__ : undefined;
    case 'TARO_APP_SUPABASE_ANON_KEY':
      return typeof __TARO_APP_SUPABASE_ANON_KEY__ !== 'undefined'
        ? __TARO_APP_SUPABASE_ANON_KEY__
        : undefined;
  }
}

export function getCompiledEnv(name: CompiledEnvName): string {
  const globalValue = normalizeEnvValue(readGlobalCompiledEnv(name));
  if (globalValue) {
    return globalValue;
  }

  return normalizeEnvValue(readDefinedCompiledEnv(name));
}
