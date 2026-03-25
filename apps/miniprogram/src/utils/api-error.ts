function isTimeoutErrorMessage(message: string): boolean {
  return /timeout|超时/i.test(message);
}

function buildHealthCheckUrl(baseUrl: string): string | null {
  if (!baseUrl) return null;

  try {
    return new URL('/api/v1/health', baseUrl).toString();
  } catch {
    return null;
  }
}

export function formatApiRequestErrorMessage(
  error: unknown,
  { baseUrl }: { baseUrl: string }
): string {
  const message = error instanceof Error && error.message
    ? error.message
    : '请求失败，请稍后重试';

  if (!isTimeoutErrorMessage(message)) {
    return message;
  }

  const healthCheckUrl = buildHealthCheckUrl(baseUrl);
  if (!healthCheckUrl) {
    return '请求超时：小程序没能在 15 秒内连上 API。请先到“我的 > API 联调”确认地址是否填写正确，然后重试。';
  }

  return `请求超时：小程序没能在 15 秒内连上 API。请先到“我的 > API 联调”确认当前地址可访问，再在浏览器打开 ${healthCheckUrl} 检查服务是否正常。`;
}
