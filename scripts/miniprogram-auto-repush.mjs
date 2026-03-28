import { promises as fs } from 'node:fs';
import { spawn } from 'node:child_process';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const REPO_ROOT = path.resolve(__dirname, '..');
const MINIPROGRAM_FILTER = '@coffeeatlas/miniprogram';

export const WATCHED_PATHS = [
  'apps/miniprogram',
  'packages/shared-types',
  'packages/api-client',
  'packages/domain',
];

const IGNORED_SEGMENTS = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}dist${path.sep}`,
  `${path.sep}.git${path.sep}`,
  `${path.sep}.next${path.sep}`,
  `${path.sep}coverage${path.sep}`,
  `${path.sep}.turbo${path.sep}`,
];

const IGNORED_SUFFIXES = ['.swp', '.tmp', '.log'];
const POLL_INTERVAL_MS = 700;
let taroRunCount = 0;

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function isIgnoredPath(filePath) {
  if (IGNORED_SEGMENTS.some((segment) => filePath.includes(segment))) {
    return true;
  }

  if (IGNORED_SUFFIXES.some((suffix) => filePath.endsWith(suffix))) {
    return true;
  }

  return false;
}

export function shouldRestartForPath(filePath) {
  const normalizedPath = normalizePath(filePath);

  if (!WATCHED_PATHS.some((prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`))) {
    return false;
  }

  if (isIgnoredPath(filePath)) {
    return false;
  }

  return true;
}

export function createRestartCoordinator({ delayMs = 400, onRestart }) {
  let timer = null;
  let lastReason = null;

  return {
    schedule(filePath) {
      if (!shouldRestartForPath(filePath)) {
        return false;
      }

      lastReason = normalizePath(filePath);

      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        timer = null;
        onRestart(lastReason);
      }, delayMs);

      return true;
    },
    dispose() {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    },
  };
}

export function buildImportantLogBlock(message) {
  return [
    '',
    '==============================',
    `[miniprogram-auto] ${message}`,
    '==============================',
  ].join('\n');
}

function log(message) {
  const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
  console.log(`\n[miniprogram-auto ${time}] ${message}`);
}

function logImportant(message) {
  console.log(buildImportantLogBlock(message));
}

function spawnTaroWatcher() {
  taroRunCount += 1;
  logImportant(`启动第 ${taroRunCount} 次 Taro watch`);
  log('执行命令: `pnpm --filter @coffeeatlas/miniprogram dev:weapp`');

  return spawn('pnpm', ['--filter', MINIPROGRAM_FILTER, 'dev:weapp'], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    detached: process.platform !== 'win32',
  });
}

async function stopTaroWatcher(child) {
  if (!child || child.exitCode !== null || child.killed) {
    return;
  }

  const waitForExit = new Promise((resolve) => {
    child.once('exit', resolve);
  });

  if (process.platform === 'win32') {
    child.kill('SIGTERM');
  } else {
    try {
      process.kill(-child.pid, 'SIGTERM');
    } catch {
      child.kill('SIGTERM');
    }
  }

  const exited = await Promise.race([
    waitForExit.then(() => true),
    new Promise((resolve) => setTimeout(() => resolve(false), 2500)),
  ]);

  if (exited) {
    return;
  }

  if (process.platform === 'win32') {
    child.kill('SIGKILL');
  } else {
    try {
      process.kill(-child.pid, 'SIGKILL');
    } catch {
      child.kill('SIGKILL');
    }
  }

  await waitForExit;
}

async function collectFileSnapshot(relativeDir, snapshot = new Map()) {
  const absoluteDir = path.join(REPO_ROOT, relativeDir);
  const entries = await fs.readdir(absoluteDir, { withFileTypes: true });

  for (const entry of entries) {
    const nextRelativePath = path.join(relativeDir, entry.name);

    if (isIgnoredPath(nextRelativePath)) {
      continue;
    }

    if (entry.isDirectory()) {
      await collectFileSnapshot(nextRelativePath, snapshot);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    if (!shouldRestartForPath(nextRelativePath)) {
      continue;
    }

    const stat = await fs.stat(path.join(REPO_ROOT, nextRelativePath));
    snapshot.set(normalizePath(nextRelativePath), stat.mtimeMs);
  }

  return snapshot;
}

async function buildWatchedSnapshot() {
  const snapshot = new Map();

  for (const relativeRoot of WATCHED_PATHS) {
    await collectFileSnapshot(relativeRoot, snapshot);
  }

  return snapshot;
}

function diffSnapshots(previous, next) {
  for (const [filePath, mtime] of next.entries()) {
    if (!previous.has(filePath) || previous.get(filePath) !== mtime) {
      return filePath;
    }
  }

  for (const filePath of previous.keys()) {
    if (!next.has(filePath)) {
      return filePath;
    }
  }

  return null;
}

async function startPolling(onChange) {
  let active = true;
  let isTickRunning = false;
  let previousSnapshot = await buildWatchedSnapshot();

  const timer = setInterval(() => {
    if (!active || isTickRunning) {
      return;
    }

    isTickRunning = true;

    void (async () => {
      try {
        const nextSnapshot = await buildWatchedSnapshot();
        const changedPath = diffSnapshots(previousSnapshot, nextSnapshot);
        previousSnapshot = nextSnapshot;

        if (changedPath) {
          onChange(changedPath);
        }
      } catch (error) {
        log(`轮询扫描失败: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        isTickRunning = false;
      }
    })();
  }, POLL_INTERVAL_MS);

  return () => {
    active = false;
    clearInterval(timer);
  };
}

async function main() {
  log(`监听目录: ${WATCHED_PATHS.join(', ')}`);

  let currentChild = spawnTaroWatcher();
  let restarting = false;
  let queuedReason = null;
  let shuttingDown = false;

  const restart = async (reason) => {
    if (restarting) {
      queuedReason = reason;
      return;
    }

    restarting = true;
    logImportant(`检测到改动，准备重推 Taro`);
    log(`触发文件: ${reason}`);

    await stopTaroWatcher(currentChild);
    currentChild = spawnTaroWatcher();
    restarting = false;

    if (queuedReason) {
      const nextReason = queuedReason;
      queuedReason = null;
      await restart(nextReason);
    }
  };

  const coordinator = createRestartCoordinator({
    delayMs: 500,
    onRestart: (reason) => {
      void restart(reason);
    },
  });

  let stopWatching;
  try {
    stopWatching = await startPolling((changedPath) => {
      const triggered = coordinator.schedule(changedPath);
      if (triggered) {
        logImportant(`已捕获改动`);
        log(`改动文件: ${normalizePath(changedPath)}`);
      }
    });
  } catch (error) {
    log(`启动轮询监听失败: ${error instanceof Error ? error.message : String(error)}`);
    await stopTaroWatcher(currentChild);
    process.exitCode = 1;
    return;
  }

  const shutdown = async (signal) => {
    if (shuttingDown) {
      return;
    }

    shuttingDown = true;
    log(`收到 ${signal}，停止监听和 Taro 进程`);
    coordinator.dispose();
    stopWatching?.();
    await stopTaroWatcher(currentChild);
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });

  currentChild.on('exit', (code, signal) => {
    if (restarting || shuttingDown) {
      return;
    }

    log(`Taro 进程已退出，code=${code ?? 'null'} signal=${signal ?? 'null'}`);
  });
}

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]) === __filename;

if (isEntrypoint) {
  void main();
}
