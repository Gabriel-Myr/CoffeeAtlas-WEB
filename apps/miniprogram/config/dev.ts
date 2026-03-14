import os from 'node:os'
import type { UserConfigExport } from '@tarojs/cli'

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

const devApiUrl = process.env.TARO_APP_API_URL || `http://${getLanIp()}:3000`

export default {
  logger: {
    quiet: false,
    stats: true
  },
  defineConstants: {
    'process.env.NODE_ENV': JSON.stringify('development'),
    'process.env.TARO_APP_API_URL': JSON.stringify(devApiUrl)
  },
  mini: {},
  h5: {},
  env: {
    NODE_ENV: '"development"',
    TARO_APP_API_URL: `"${devApiUrl}"`
  }
} as UserConfigExport
