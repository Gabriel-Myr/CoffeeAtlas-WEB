import Taro from '@tarojs/taro';

const API_BASE_URL_OVERRIDE_KEY = 'api_base_url_override';

export interface ApiBaseUrlState {
  baseUrl: string;
  source: 'runtime' | 'build';
  mode: 'unset' | 'local' | 'cloud';
  warning: string | null;
}

function normalizeBaseUrl(url: string | null | undefined): string {
  return (url ?? '')
    .trim()
    .replace(/\/+$/, '')
    .replace(/\/api$/, '');
}

function getHostname(url: string): string {
  return url
    .replace(/^https?:\/\//i, '')
    .split('/')[0]
    .split(':')[0]
    .toLowerCase();
}

function isPrivateIpv4(hostname: string): boolean {
  return (
    /^127\./.test(hostname) ||
    /^10\./.test(hostname) ||
    /^192\.168\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function getMode(baseUrl: string): ApiBaseUrlState['mode'] {
  if (!baseUrl) return 'unset';

  const hostname = getHostname(baseUrl);
  if (
    /^http:\/\//i.test(baseUrl) ||
    hostname === 'localhost' ||
    hostname.endsWith('.local') ||
    isPrivateIpv4(hostname)
  ) {
    return 'local';
  }

  return 'cloud';
}

function getWarning(baseUrl: string): string | null {
  if (!baseUrl) {
    return '未配置 API 地址，可在这里填入云端 HTTPS 域名。';
  }

  const hostname = getHostname(baseUrl);
  if (hostname === 'localhost' || hostname.endsWith('.local') || isPrivateIpv4(hostname)) {
    return '当前仍是本地或局域网地址，切到云端联调时请改成 HTTPS 域名。';
  }

  if (/^http:\/\//i.test(baseUrl)) {
    return '微信云端联调建议使用 HTTPS 域名。';
  }

  return null;
}

export function getApiBaseUrlState(): ApiBaseUrlState {
  const runtimeBaseUrl = normalizeBaseUrl(Taro.getStorageSync(API_BASE_URL_OVERRIDE_KEY));
  const buildBaseUrl = normalizeBaseUrl(process.env.TARO_APP_API_URL);
  const baseUrl = runtimeBaseUrl || buildBaseUrl;

  return {
    baseUrl,
    source: runtimeBaseUrl ? 'runtime' : 'build',
    mode: getMode(baseUrl),
    warning: getWarning(baseUrl),
  };
}

export function setApiBaseUrlOverride(url: string): ApiBaseUrlState {
  const normalized = normalizeBaseUrl(url);
  if (!normalized) {
    Taro.removeStorageSync(API_BASE_URL_OVERRIDE_KEY);
  } else {
    Taro.setStorageSync(API_BASE_URL_OVERRIDE_KEY, normalized);
  }

  return getApiBaseUrlState();
}

export function clearApiBaseUrlOverride(): ApiBaseUrlState {
  Taro.removeStorageSync(API_BASE_URL_OVERRIDE_KEY);
  return getApiBaseUrlState();
}
