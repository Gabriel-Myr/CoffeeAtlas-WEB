import os from 'node:os'
import type { UserConfigExport } from '@tarojs/cli'
import { loadWorkspaceEnv } from './load-env.ts'

loadWorkspaceEnv('development')

function getLanIp(): string {
  const interfaces = os.networkInterfaces()

  for (const addresses of Object.values(interfaces)) {
    if (!addresses) continue

    const match = addresses.find(
      (address) => address.family === 'IPv4' && !address.internal
    )

    if (match?.address) {
      return match.address
    }
  }

  return '127.0.0.1'
}

// Default to the local apps/api dev server when TARO_APP_API_URL is not set.
const devApiUrl = process.env.TARO_APP_API_URL || `http://${getLanIp()}:3000`
const devSupabaseUrl =
  process.env.TARO_APP_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const devSupabaseAnonKey =
  process.env.TARO_APP_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  ''

export default {
  logger: {
    quiet: false,
    stats: true
  },
  defineConstants: {
    __TARO_APP_API_URL__: JSON.stringify(devApiUrl),
    __TARO_APP_SUPABASE_URL__: JSON.stringify(devSupabaseUrl),
    __TARO_APP_SUPABASE_ANON_KEY__: JSON.stringify(devSupabaseAnonKey),
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.env.TARO_APP_API_URL': JSON.stringify(devApiUrl),
    'process.env.TARO_APP_SUPABASE_URL': JSON.stringify(devSupabaseUrl),
    'process.env.TARO_APP_SUPABASE_ANON_KEY': JSON.stringify(devSupabaseAnonKey)
  },
  mini: {},
  h5: {},
  env: {
    NODE_ENV: '"development"',
    TARO_APP_API_URL: `"${devApiUrl}"`,
    TARO_APP_SUPABASE_URL: `"${devSupabaseUrl}"`,
    TARO_APP_SUPABASE_ANON_KEY: `"${devSupabaseAnonKey}"`
  }
} as UserConfigExport
