import type {
  TaobaoBrowseHistoryResult,
  TaobaoInspectPageResult,
  TaobaoMcpCurrentTabResult,
  TaobaoMcpReadPageResult,
  TaobaoMcpSseEnvelope,
  TaobaoSearchProductsResult,
} from './types.ts';
import { createConnection } from 'node:net';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

const TAOBAO_SOURCE_APP = 'coffeeatlas-taobao-sync';
const DEFAULT_TAOBAO_CLI_RPC_SOCKET = join(homedir(), 'Library', 'Application Support', 'taobao', 'cli-rpc.sock');

type TaobaoCliRpcEnvelope<T> = {
  result?: T;
  error?: string | { message?: string };
};

type TaobaoMcpClientOptions = {
  cliRpcSocketPath?: string;
  cliRpcRequest?: <T>(
    request: { tool: string; arguments: Record<string, unknown> },
    socketPath: string
  ) => Promise<TaobaoCliRpcEnvelope<T>>;
};

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

  let parsed: unknown = JSON.parse(text);

  while (parsed && typeof parsed === 'object' && 'content' in parsed) {
    const content = (parsed as { content?: unknown }).content;
    if (!Array.isArray(content)) break;

    const nestedText = content.find((item) => item && typeof item === 'object' && item.type === 'text')?.text?.trim();

    if (!nestedText) break;
    parsed = JSON.parse(nestedText);
  }

  return parsed as T;
}

function extractCliRpcErrorMessage(error: TaobaoCliRpcEnvelope<unknown>['error']) {
  if (!error) return null;
  if (typeof error === 'string') return error;
  return error.message ?? 'Unknown Taobao CLI RPC error';
}

function normalizeReadPageResult(result: Partial<TaobaoMcpReadPageResult> | null | undefined): TaobaoMcpReadPageResult {
  return {
    url: typeof result?.url === 'string' ? result.url : '',
    title: typeof result?.title === 'string' ? result.title : '',
    content: typeof result?.content === 'string' ? result.content : '',
    totalLength: typeof result?.totalLength === 'number' ? result.totalLength : 0,
    truncated: Boolean(result?.truncated),
  };
}

function normalizeBrowseHistoryResult(result: Partial<TaobaoBrowseHistoryResult> | null | undefined): TaobaoBrowseHistoryResult {
  return {
    type: typeof result?.type === 'string' ? result.type : 'product',
    count: typeof result?.count === 'number' ? result.count : 0,
    items: Array.isArray(result?.items) ? result.items : [],
  };
}

function normalizeScanPageElementsResult(result: { dom?: string; totalElements?: number } | null | undefined) {
  return {
    dom: typeof result?.dom === 'string' ? result.dom : '',
    totalElements: typeof result?.totalElements === 'number' ? result.totalElements : 0,
  };
}

function normalizeSearchProductsResult(result: Partial<TaobaoSearchProductsResult> | null | undefined): TaobaoSearchProductsResult {
  return {
    keyword: typeof result?.keyword === 'string' ? result.keyword : '',
    count: typeof result?.count === 'number' ? result.count : 0,
    products: Array.isArray(result?.products) ? result.products : [],
  };
}

async function defaultCliRpcRequest<T>(
  request: { tool: string; arguments: Record<string, unknown> },
  socketPath: string
) {
  return new Promise<TaobaoCliRpcEnvelope<T>>((resolve, reject) => {
    const socket = createConnection(socketPath);
    let buffer = '';
    let settled = false;

    const finish = (fn: () => void) => {
      if (settled) return;
      settled = true;
      fn();
    };

    const consumeBuffer = () => {
      const newlineIndex = buffer.indexOf('\n');
      if (newlineIndex === -1) return false;

      const line = buffer.slice(0, newlineIndex).trim();
      buffer = buffer.slice(newlineIndex + 1);

      if (!line) return consumeBuffer();

      try {
        finish(() => resolve(JSON.parse(line) as TaobaoCliRpcEnvelope<T>));
      } catch (error) {
        finish(() => reject(error));
      }

      return true;
    };

    socket.setEncoding('utf8');
    socket.on('connect', () => {
      socket.write(`${JSON.stringify(request)}\n`);
    });
    socket.on('data', (chunk) => {
      buffer += chunk;
      if (consumeBuffer()) {
        socket.end();
      }
    });
    socket.on('end', () => {
      if (settled) return;
      const remaining = buffer.trim();
      if (!remaining) {
        finish(() => reject(new Error('Taobao CLI RPC returned an empty response')));
        return;
      }

      try {
        finish(() => resolve(JSON.parse(remaining) as TaobaoCliRpcEnvelope<T>));
      } catch (error) {
        finish(() => reject(error));
      }
    });
    socket.on('error', (error) => {
      finish(() => reject(error));
    });
  });
}

export class TaobaoMcpClient {
  private readonly baseUrl: string;
  private readonly cliRpcSocketPath: string;
  private readonly cliRpcRequest: TaobaoMcpClientOptions['cliRpcRequest'];
  private sessionId: string | null;
  private requestId: number;
  private transport: 'http' | 'cli-rpc' | null;

  constructor(baseUrl: string, options: TaobaoMcpClientOptions = {}) {
    this.baseUrl = baseUrl;
    this.cliRpcSocketPath = options.cliRpcSocketPath ?? process.env.TAOBAO_CLI_RPC_SOCKET?.trim() ?? DEFAULT_TAOBAO_CLI_RPC_SOCKET;
    this.cliRpcRequest = options.cliRpcRequest ?? defaultCliRpcRequest;
    this.sessionId = null;
    this.requestId = 1;
    this.transport = null;
  }

  private nextId() {
    this.requestId += 1;
    return this.requestId;
  }

  async initialize() {
    if (this.transport === 'cli-rpc') return;

    try {
      await this.initializeHttp();
      this.transport = 'http';
    } catch (error) {
      if (!this.canUseCliRpcFallback()) {
        throw error;
      }

      await this.enableCliRpcFallback(error);
    }
  }

  private async initializeHttp() {
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
            name: TAOBAO_SOURCE_APP,
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

  private canUseCliRpcFallback() {
    return this.cliRpcSocketPath !== DEFAULT_TAOBAO_CLI_RPC_SOCKET || existsSync(this.cliRpcSocketPath);
  }

  private async enableCliRpcFallback(previousError?: unknown) {
    if (!this.canUseCliRpcFallback()) {
      if (previousError instanceof Error) throw previousError;
      throw new Error(`Taobao CLI RPC socket is unavailable at ${this.cliRpcSocketPath}`);
    }

    try {
      const probe = await this.cliRpcRequest?.<{ tools?: Array<{ name: string }> }>(
        { tool: '_help', arguments: {} },
        this.cliRpcSocketPath
      );
      const message = extractCliRpcErrorMessage(probe?.error);
      if (message) {
        throw new Error(message);
      }
    } catch (error) {
      const previousMessage = previousError instanceof Error ? previousError.message : String(previousError ?? 'unknown error');
      const fallbackMessage = error instanceof Error ? error.message : String(error ?? 'unknown error');
      throw new Error(`Taobao MCP HTTP transport failed (${previousMessage}) and CLI RPC fallback failed (${fallbackMessage})`);
    }

    this.transport = 'cli-rpc';
    this.sessionId = null;
  }

  private async callHttpTool<T>(name: string, args: Record<string, unknown>) {
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
          arguments: {
            sourceApp: TAOBAO_SOURCE_APP,
            ...args,
          },
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

  private async callCliRpcTool<T>(name: string, args: Record<string, unknown>) {
    const payload = await this.cliRpcRequest?.<T>(
      {
        tool: name,
        arguments: {
          sourceApp: TAOBAO_SOURCE_APP,
          ...args,
        },
      },
      this.cliRpcSocketPath
    );

    const message = extractCliRpcErrorMessage(payload?.error);
    if (message) {
      throw new Error(`Taobao CLI RPC tool ${name} failed: ${message}`);
    }

    if (!payload || !('result' in payload)) {
      throw new Error(`Taobao CLI RPC tool ${name} returned an empty response`);
    }

    return payload.result as T;
  }

  private async callTool<T>(name: string, args: Record<string, unknown>) {
    if (this.transport !== 'cli-rpc' && !this.sessionId) {
      await this.initialize();
    }

    if (this.transport === 'cli-rpc') {
      return this.callCliRpcTool<T>(name, args);
    }

    try {
      return await this.callHttpTool<T>(name, args);
    } catch (error) {
      if (!this.canUseCliRpcFallback()) {
        throw error;
      }

      await this.enableCliRpcFallback(error);
      return this.callCliRpcTool<T>(name, args);
    }
  }

  async navigateToUrl(url: string) {
    await this.callTool<{ success: boolean; url: string }>('navigate_to_url', { url });
  }

  async readPageContent(args: { scope?: string; maxLength?: number } = {}) {
    const result = await this.callTool<Partial<TaobaoMcpReadPageResult>>('read_page_content', args);
    return normalizeReadPageResult(result);
  }

  async scanPageElements(args: { filter?: string; scope?: string } = {}) {
    const result = await this.callTool<{ dom?: string; totalElements?: number }>('scan_page_elements', args);
    return normalizeScanPageElementsResult(result);
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
    const result = await this.callTool<Partial<TaobaoBrowseHistoryResult>>('get_browse_history', { type });
    return normalizeBrowseHistoryResult(result);
  }

  async inspectPage() {
    return this.callTool<TaobaoInspectPageResult>('inspect_page', {});
  }

  async searchProducts(keyword: string) {
    const result = await this.callTool<Partial<TaobaoSearchProductsResult>>('search_products', { keyword });
    return normalizeSearchProductsResult(result);
  }

  async closePage() {
    return this.callTool<{ success: boolean; message?: string }>('close_page', {});
  }
}
