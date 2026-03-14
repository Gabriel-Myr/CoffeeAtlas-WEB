import type { UserConfigExport } from '@tarojs/cli'

const prodApiUrl = process.env.TARO_APP_API_URL || ''

export default {
  defineConstants: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    'process.env.TARO_APP_API_URL': JSON.stringify(prodApiUrl)
  },
  mini: {
    optimizeMainPackage: {
      enable: true
    }
  },
  h5: {},
  env: {
    NODE_ENV: '"production"',
    TARO_APP_API_URL: `"${prodApiUrl}"`
  }
} as UserConfigExport
