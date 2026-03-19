const DEFAULT_REQUEST_TIMEOUT_MS = 15000;

type ApiRequestInputOptions = Record<string, unknown> & {
  timeout?: number;
  enableHttp2?: boolean;
};

export function buildApiRequestOptions<TOptions extends ApiRequestInputOptions>({
  url,
  header,
  options,
}: {
  url: string;
  header: Record<string, string>;
  options?: TOptions;
}) {
  const { timeout, ...restOptions } = (options ?? {}) as ApiRequestInputOptions;

  return {
    url,
    header,
    ...restOptions,
    timeout: typeof timeout === 'number' ? timeout : DEFAULT_REQUEST_TIMEOUT_MS,
    // 微信开发者工具在当前联调环境下会偶发 HTTP/2 断连，统一回退到更稳定的传输模式。
    enableHttp2: false as const,
  };
}
