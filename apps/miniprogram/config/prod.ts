import type { UserConfigExport } from '@tarojs/cli'
import { loadWorkspaceEnv } from './load-env.ts'

loadWorkspaceEnv('production')

const prodApiUrl = process.env.TARO_APP_API_URL || ''
const prodSupabaseUrl =
  process.env.TARO_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const prodSupabaseAnonKey =
  process.env.TARO_APP_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

export default {
  defineConstants: {
    __TARO_APP_API_URL__: JSON.stringify(prodApiUrl),
    __TARO_APP_SUPABASE_URL__: JSON.stringify(prodSupabaseUrl),
    __TARO_APP_SUPABASE_ANON_KEY__: JSON.stringify(prodSupabaseAnonKey),
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.TARO_APP_API_URL': JSON.stringify(prodApiUrl),
    'process.env.TARO_APP_SUPABASE_URL': JSON.stringify(prodSupabaseUrl),
    'process.env.TARO_APP_SUPABASE_ANON_KEY': JSON.stringify(prodSupabaseAnonKey)
  },
  mini: {
    optimizeMainPackage: {
      enable: true
    }
  },
  h5: {},
  env: {
    NODE_ENV: '"production"',
    TARO_APP_API_URL: `"${prodApiUrl}"`,
    TARO_APP_SUPABASE_URL: `"${prodSupabaseUrl}"`,
    TARO_APP_SUPABASE_ANON_KEY: `"${prodSupabaseAnonKey}"`
  }
} as UserConfigExport
