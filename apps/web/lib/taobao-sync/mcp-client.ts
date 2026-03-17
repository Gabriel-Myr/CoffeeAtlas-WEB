import type {
  TaobaoBrowseHistoryResult,
  TaobaoInspectPageResult,
  TaobaoMcpCurrentTabResult,
  TaobaoMcpReadPageResult,
  TaobaoMcpSseEnvelope,
  TaobaoSearchProductsResult,
} from './types.ts';

function extractPayload(body: string) {
  const trimmed = body.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('{')) {
    return JSON.parse(trimmed) as TaobaoMcpSseEnvelope;
  }

  const dataLines = trimmed
    .split(/\r?\n/)
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

  if (dataLines.length === 0) {
    throw new Error(`Unexpected MCP response: ${trimmed.slice(0, 200)}`);
  }

  return JSON.parse(dataLines[dataLines.length - 1]) as TaobaoMcpSseEnvelope;
}

function parseTextResult<T>(payload: TaobaoMcpSseEnvelope): T {
  if (payload.error) {
    throw new Error(`Taobao MCP error ${payload.error.code}: ${payload.error.message}`);
  }

  const text = payload.result?.content?.find((item) => item.type === 'text')?.text;
  if (!text) {
    throw new Error('Taobao MCP response did not include text content');
  }

  return JSON.parse(text) as T;
}

export class TaobaoMcpClient {
  private readonly baseUrl: string;
  private sessionId: string | null;
  private requestId: number;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this.sessionId = null;
    this.requestId = 1;
  }

  private nextId() {
    this.requestId += 1;
    return this.requestId;
  }

  async initialize() {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: this.requestId,
        method: 'initialize',
        params: {
          protocolVersion: '2025-03-26',
          capabilities: {},
          clientInfo: {
            name: 'coffeeatlas-taobao-sync',
            version: '0.1.0',
          },
        },
      }),
    });

    const body = await response.text();
    if (!response.ok) {
      throw new Error(`Failed to initialize Taobao MCP: ${response.status} ${body}`);
    }

    const sessionId = response.headers.get('mcp-session-id');
    if (!sessionId) {
      throw new Error('Taobao MCP did not return a session id');
    }

    this.sessionId = sessionId;
    const payload = extractPayload(body);
    if (payload?.error) {
      throw new Error(`Taobao MCP initialize error: ${payload.error.message}`);
    }
  }

  private async callTool<T>(name: string, args: Record<string, unknown>) {
    if (!this.sessionId) {
      await this.initialize();
    }

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'mcp-session-id': this.sessionId!,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: this.nextId(),
        method: 'tools/call',
        params: {
          name,
          arguments: args,
        },
      }),
    });

    const body = await response.text();
    if (!response.ok) {
      throw new Error(`Taobao MCP tool ${name} failed: ${response.status} ${body}`);
    }

    const payload = extractPayload(body);
    if (!payload) {
      throw new Error(`Taobao MCP tool ${name} returned an empty response`);
    }

    return parseTextResult<T>(payload);
  }

  async navigateToUrl(url: string) {
    await this.callTool<{ success: boolean; url: string }>('navigate_to_url', { url });
  }

  async readPageContent(args: { scope?: string; maxLength?: number } = {}) {
    return this.callTool<TaobaoMcpReadPageResult>('read_page_content', args);
  }

  async scanPageElements(args: { filter?: string; scope?: string } = {}) {
    return this.callTool<{ dom: string; totalElements: number }>('scan_page_elements', args);
  }

  async clickElement(args: { index?: number; text?: string }) {
    return this.callTool<{ success?: boolean }>('click_element', args);
  }

  async scrollPage(args: { direction?: 'up' | 'down' | 'top' | 'bottom'; amount?: number; selector?: string } = {}) {
    return this.callTool<{ success?: boolean }>('scroll_page', args);
  }

  async getCurrentTab() {
    return this.callTool<TaobaoMcpCurrentTabResult>('get_current_tab', {});
  }

  async getBrowseHistory(type: 'product' | 'search' | 'shop') {
    return this.callTool<TaobaoBrowseHistoryResult>('get_browse_history', { type });
  }

  async inspectPage() {
    return this.callTool<TaobaoInspectPageResult>('inspect_page', {});
  }

  async searchProducts(keyword: string) {
    return this.callTool<TaobaoSearchProductsResult>('search_products', { keyword });
  }

  async closePage() {
    return this.callTool<{ success: boolean; message?: string }>('close_page', {});
  }
}
