import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { sortReviewItems, type ReviewComparedField as ComparedField, type ReviewItem, type ReviewPayload } from '../lib/taobao-sync/review.ts';

const TMP_DIR = '/tmp';
const REVIEW_FILE_PREFIX = 'taobao-ocr-high-confidence-';

function parseArgs(argv: string[]) {
  const args = {
    input: '',
    output: path.join(TMP_DIR, `taobao-ocr-review-${Date.now()}.html`),
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];
    if (current === '--input' && next) {
      args.input = path.resolve(next);
      index += 1;
      continue;
    }
    if (current === '--output' && next) {
      args.output = path.resolve(next);
      index += 1;
    }
  }

  return args;
}

async function resolveInputFile(input: string) {
  if (input) return input;

  const entries = await readdir(TMP_DIR, { withFileTypes: true });
  const matched = entries
    .filter((entry) => entry.isFile() && entry.name.startsWith(REVIEW_FILE_PREFIX) && entry.name.endsWith('.json'))
    .map((entry) => path.join(TMP_DIR, entry.name))
    .sort()
    .reverse();

  if (matched.length === 0) {
    throw new Error('No taobao OCR review json found in /tmp');
  }

  return matched[0]!;
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderIssue(issue: ComparedField, tone: 'danger' | 'safe') {
  const background = tone === 'danger' ? '#fbefec' : '#edf6e9';
  const accent = tone === 'danger' ? '#8a2d1d' : '#2d5b2f';
  return `
    <div class="issue-card" style="background:${background}">
      <div class="issue-field">${escapeHtml(issue.field)}</div>
      <div class="issue-line">当前值：${escapeHtml(issue.existingValue ?? '-')}</div>
      <div class="issue-line" style="color:${accent}">OCR 值：${escapeHtml(issue.ocrValue ?? '-')}</div>
    </div>
  `;
}

function renderItem(item: ReviewItem) {
  return `
    <article class="card">
      <div class="card-head">
        <div class="badges">
          <span class="badge ${item.highConfidenceIssues?.length ? 'badge-danger' : 'badge-safe'}">
            ${item.highConfidenceIssues?.length ? '硬冲突' : '可补字段'}
          </span>
          <span class="badge badge-neutral">${escapeHtml(item.status)}</span>
        </div>
        <h2>${escapeHtml(item.title)}</h2>
        <div class="meta">
          <div>ID: ${escapeHtml(item.id)}</div>
          <div>sourceItemId: ${escapeHtml(item.sourceItemId ?? '-')}</div>
          ${
            item.productUrl
              ? `<div>商品链接：<a href="${escapeHtml(item.productUrl)}" target="_blank" rel="noreferrer">${escapeHtml(item.productUrl)}</a></div>`
              : ''
          }
        </div>
      </div>
      <div class="card-body ${item.imageUrl ? 'with-image' : ''}">
        ${
          item.imageUrl
            ? `<div class="image-wrap"><img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" /></div>`
            : ''
        }
        <div class="details">
          ${
            item.highConfidenceIssues?.length
              ? `<section>
                  <h3>硬冲突</h3>
                  <div class="issue-grid">
                    ${item.highConfidenceIssues.map((issue) => renderIssue(issue, 'danger')).join('')}
                  </div>
                </section>`
              : ''
          }
          ${
            item.fillCandidates?.length
              ? `<section>
                  <h3>建议补充</h3>
                  <div class="issue-grid">
                    ${item.fillCandidates.map((issue) => renderIssue(issue, 'safe')).join('')}
                  </div>
                </section>`
              : ''
          }
          <section>
            <h3>OCR 文本</h3>
            <pre>${escapeHtml(item.ocr.text || 'OCR 没识别出有效文本')}</pre>
          </section>
        </div>
      </div>
    </article>
  `;
}

function renderHtml(inputFile: string, payload: ReviewPayload) {
  const sortedItems = sortReviewItems(payload.items);

  return `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>淘宝 OCR 审查页</title>
    <style>
      :root {
        color-scheme: light;
        --bg-top: #f5eee3;
        --bg-bottom: #e7dccd;
        --card: rgba(255, 252, 247, 0.84);
        --line: rgba(72, 51, 31, 0.12);
        --text: #2f2419;
        --muted: #6c5b4d;
        --danger: #8a2d1d;
        --safe: #2d5b2f;
        --neutral: #5b4936;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif;
        color: var(--text);
        background: linear-gradient(180deg, var(--bg-top) 0%, var(--bg-bottom) 100%);
      }
      .page {
        max-width: 1180px;
        margin: 0 auto;
        padding: 32px 20px 56px;
      }
      h1 {
        margin: 0;
        font-size: 38px;
        line-height: 1.08;
        letter-spacing: -0.04em;
      }
      .subtitle {
        margin: 12px 0 0;
        color: var(--muted);
        line-height: 1.7;
      }
      .summary {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
        margin: 24px 0;
      }
      .metric, .info, .card {
        border: 1px solid var(--line);
        border-radius: 20px;
        background: var(--card);
      }
      .metric {
        padding: 18px;
      }
      .metric-label {
        color: var(--muted);
        font-size: 13px;
      }
      .metric-value {
        margin-top: 8px;
        font-size: 30px;
        font-weight: 700;
      }
      .info {
        padding: 18px;
        color: var(--muted);
        line-height: 1.8;
        margin-bottom: 24px;
      }
      .list {
        display: grid;
        gap: 16px;
      }
      .card-head {
        padding: 20px;
        border-bottom: 1px solid var(--line);
      }
      .card-head h2 {
        margin: 10px 0 0;
        font-size: 22px;
        line-height: 1.38;
      }
      .badges {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .badge {
        display: inline-flex;
        align-items: center;
        padding: 4px 10px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 700;
        color: white;
      }
      .badge-danger { background: var(--danger); }
      .badge-safe { background: var(--safe); }
      .badge-neutral { background: #dccbb0; color: var(--neutral); }
      .meta {
        margin-top: 10px;
        color: var(--muted);
        font-size: 13px;
        line-height: 1.8;
      }
      .meta a { color: var(--danger); }
      .card-body {
        display: grid;
      }
      .card-body.with-image {
        grid-template-columns: 240px minmax(0, 1fr);
      }
      .image-wrap {
        padding: 20px;
        border-right: 1px solid var(--line);
      }
      .image-wrap img {
        width: 100%;
        display: block;
        border-radius: 16px;
        background: #f1e7dc;
      }
      .details {
        padding: 20px;
        display: grid;
        gap: 18px;
      }
      h3 {
        margin: 0 0 10px;
        font-size: 14px;
      }
      .issue-grid {
        display: grid;
        gap: 10px;
      }
      .issue-card {
        border-radius: 16px;
        padding: 14px;
      }
      .issue-field {
        font-weight: 700;
      }
      .issue-line {
        margin-top: 6px;
        color: var(--muted);
      }
      pre {
        margin: 0;
        white-space: pre-wrap;
        word-break: break-word;
        background: #20170f;
        color: #f7efe6;
        border-radius: 16px;
        padding: 16px;
        font-size: 13px;
        line-height: 1.6;
      }
      @media (max-width: 860px) {
        .card-body.with-image {
          grid-template-columns: 1fr;
        }
        .image-wrap {
          border-right: 0;
          border-bottom: 1px solid var(--line);
        }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <header>
        <h1>淘宝 OCR 审查页</h1>
        <p class="subtitle">这是离线 HTML 审查页，不依赖 API 服务。你直接在浏览器里打开这个文件，就能逐条看高置信问题和 OCR 文本。</p>
      </header>

      <section class="summary">
        <div class="metric"><div class="metric-label">总条数</div><div class="metric-value">${payload.summary.total}</div></div>
        <div class="metric"><div class="metric-label">硬冲突</div><div class="metric-value">${payload.summary.hardMismatch}</div></div>
        <div class="metric"><div class="metric-label">处理法冲突</div><div class="metric-value">${payload.summary.processMethodMismatch}</div></div>
        <div class="metric"><div class="metric-label">产地冲突</div><div class="metric-value">${payload.summary.originMismatch}</div></div>
        <div class="metric"><div class="metric-label">可补克重</div><div class="metric-value">${payload.summary.weightFill}</div></div>
        <div class="metric"><div class="metric-label">可补烘焙度</div><div class="metric-value">${payload.summary.roastLevelFill}</div></div>
      </section>

      <section class="info">
        <div>来源文件：${escapeHtml(inputFile)}</div>
        <div>说明：红色是更值得先处理的硬冲突；绿色是 OCR 识别出但库里缺的字段。</div>
      </section>

      <section class="list">
        ${sortedItems.map(renderItem).join('')}
      </section>
    </main>
  </body>
</html>`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const inputFile = await resolveInputFile(args.input);
  const payload = JSON.parse(await readFile(inputFile, 'utf8')) as ReviewPayload;
  const html = renderHtml(inputFile, payload);
  await writeFile(args.output, html);
  console.log(JSON.stringify({ input: inputFile, output: args.output, total: payload.items.length }, null, 2));
}

await main();
