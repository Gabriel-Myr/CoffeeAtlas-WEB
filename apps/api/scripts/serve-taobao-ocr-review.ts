import { createServer } from 'node:http';
import { URLSearchParams } from 'node:url';

import { createClient } from '@supabase/supabase-js';

import {
  buildDecisionPatch,
  DEFAULT_DECISIONS_FILE,
  filterPendingReviewItems,
  loadReviewDecisions,
  loadReviewPayload,
  saveReviewDecisions,
  type ReviewDecision,
  type ReviewItem,
  type ReviewPayload,
  upsertDecision,
} from '../lib/taobao-sync/review.ts';

function parseArgs(argv: string[]) {
  const args = {
    port: 4319,
    reviewFile: '',
    decisionsFile: DEFAULT_DECISIONS_FILE,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];
    if (current === '--port' && next) {
      const parsed = Number.parseInt(next, 10);
      if (Number.isFinite(parsed) && parsed > 0) {
        args.port = parsed;
      }
      index += 1;
      continue;
    }
    if (current === '--input' && next) {
      args.reviewFile = next;
      index += 1;
      continue;
    }
    if (current === '--decisions' && next) {
      args.decisionsFile = next;
      index += 1;
    }
  }

  return args;
}

function escapeHtml(value: string | number | null | undefined) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function metric(label: string, value: number) {
  return `<div class="metric"><div class="metric-label">${escapeHtml(label)}</div><div class="metric-value">${value}</div></div>`;
}

function inputField(label: string, name: string, value: string | number | null | undefined) {
  return `
    <label class="field">
      <span>${escapeHtml(label)}</span>
      <input name="${escapeHtml(name)}" value="${escapeHtml(value ?? '')}" />
    </label>
  `;
}

function renderItem(item: ReviewItem) {
  const defaultFields = {
    beanName: '',
    originCountry: '',
    originRegion: '',
    processMethod: '',
    variety: '',
    roastLevel: '',
    weightGrams: '',
  };

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
              ? `<section><h3>硬冲突</h3><div class="issue-grid">
                ${item.highConfidenceIssues
                  .map(
                    (issue) => `
                      <div class="issue-card danger">
                        <div class="issue-field">${escapeHtml(issue.field)}</div>
                        <div class="issue-line">当前值：${escapeHtml(issue.existingValue ?? '-')}</div>
                        <div class="issue-line accent">OCR 值：${escapeHtml(issue.ocrValue ?? '-')}</div>
                      </div>
                    `
                  )
                  .join('')}
              </div></section>`
              : ''
          }
          ${
            item.fillCandidates?.length
              ? `<section><h3>建议补充</h3><div class="issue-grid">
                ${item.fillCandidates
                  .map(
                    (issue) => `
                      <div class="issue-card safe">
                        <div class="issue-field">${escapeHtml(issue.field)}</div>
                        <div class="issue-line">当前值：${escapeHtml(issue.existingValue ?? '-')}</div>
                        <div class="issue-line accent">${escapeHtml(issue.ocrValue ?? '-')}</div>
                      </div>
                    `
                  )
                  .join('')}
              </div></section>`
              : ''
          }
          <section>
            <h3>提交修改意见</h3>
            <form method="post" action="/submit" class="decision-form">
              <input type="hidden" name="reviewItemId" value="${escapeHtml(item.id)}" />
              <input type="hidden" name="entityId" value="${escapeHtml(item.id)}" />
              <div class="field-grid">
                ${inputField('beanName', 'beanName', defaultFields.beanName)}
                ${inputField('originCountry', 'originCountry', defaultFields.originCountry)}
                ${inputField('originRegion', 'originRegion', defaultFields.originRegion)}
                ${inputField('processMethod', 'processMethod', defaultFields.processMethod)}
                ${inputField('variety', 'variety', defaultFields.variety)}
                ${inputField('roastLevel', 'roastLevel', defaultFields.roastLevel)}
                ${inputField('weightGrams', 'weightGrams', defaultFields.weightGrams)}
              </div>
              <label class="field">
                <span>建议状态</span>
                <select name="nextStatus">
                  <option value="UNCHANGED">保持不变</option>
                  <option value="DRAFT">改为 DRAFT</option>
                  <option value="ACTIVE">改为 ACTIVE</option>
                  <option value="ARCHIVED">改为 ARCHIVED</option>
                </select>
              </label>
              <label class="field">
                <span>备注</span>
                <textarea name="note" rows="3" placeholder="说明你为什么这样改"></textarea>
              </label>
              <button type="submit">提交修改意见</button>
            </form>
          </section>
          <section>
            <h3>OCR 文本</h3>
            <pre>${escapeHtml(item.ocr.text || 'OCR 没识别出有效文本')}</pre>
          </section>
        </div>
      </div>
    </article>
  `;
}

function renderPage(args: {
  payload: ReviewPayload;
  pendingItems: ReviewItem[];
  filePath: string;
  decisionsFile: string;
  saved?: string | null;
  error?: string | null;
}) {
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
      body { margin:0; font-family:"SF Pro Text","Helvetica Neue",Helvetica,Arial,sans-serif; color:var(--text); background:linear-gradient(180deg,var(--bg-top) 0%,var(--bg-bottom) 100%); }
      .page { max-width:1180px; margin:0 auto; padding:32px 20px 56px; }
      h1 { margin:0; font-size:38px; line-height:1.08; letter-spacing:-0.04em; }
      .subtitle { margin:12px 0 0; color:var(--muted); line-height:1.7; }
      .summary { display:grid; grid-template-columns:repeat(auto-fit,minmax(150px,1fr)); gap:12px; margin:24px 0; }
      .metric,.info,.card,.flash { border:1px solid var(--line); border-radius:20px; background:var(--card); }
      .metric { padding:18px; }
      .metric-label { color:var(--muted); font-size:13px; }
      .metric-value { margin-top:8px; font-size:30px; font-weight:700; }
      .info,.flash { padding:18px; color:var(--muted); line-height:1.8; margin-bottom:24px; }
      .flash.success { background:#edf6e9; color:#2d5b2f; }
      .flash.error { background:#fbefec; color:#8a2d1d; }
      .list { display:grid; gap:16px; }
      .card-head { padding:20px; border-bottom:1px solid var(--line); }
      .card-head h2 { margin:10px 0 0; font-size:22px; line-height:1.38; }
      .badges { display:flex; flex-wrap:wrap; gap:10px; }
      .badge { display:inline-flex; align-items:center; padding:4px 10px; border-radius:999px; font-size:12px; font-weight:700; color:white; }
      .badge-danger { background:var(--danger); }
      .badge-safe { background:var(--safe); }
      .badge-neutral { background:#dccbb0; color:var(--neutral); }
      .meta { margin-top:10px; color:var(--muted); font-size:13px; line-height:1.8; }
      .meta a { color:var(--danger); }
      .card-body { display:grid; }
      .card-body.with-image { grid-template-columns:240px minmax(0,1fr); }
      .image-wrap { padding:20px; border-right:1px solid var(--line); }
      .image-wrap img { width:100%; display:block; border-radius:16px; background:#f1e7dc; }
      .details { padding:20px; display:grid; gap:18px; }
      h3 { margin:0 0 10px; font-size:14px; }
      .issue-grid,.field-grid { display:grid; gap:10px; }
      .field-grid { grid-template-columns:repeat(auto-fit,minmax(160px,1fr)); }
      .issue-card { border-radius:16px; padding:14px; }
      .issue-card.danger { background:#fbefec; }
      .issue-card.safe { background:#edf6e9; }
      .issue-field { font-weight:700; }
      .issue-line { margin-top:6px; color:var(--muted); }
      .issue-line.accent { color:inherit; }
      .decision-form { display:grid; gap:12px; }
      .field { display:grid; gap:6px; }
      .field span { font-size:13px; color:var(--muted); }
      input,select,textarea,button { font:inherit; }
      input,select,textarea { width:100%; border:1px solid rgba(72,51,31,0.16); background:#fffdf9; border-radius:12px; padding:10px 12px; color:var(--text); }
      button { border:0; border-radius:999px; background:#2f2419; color:#fff; padding:12px 18px; cursor:pointer; font-weight:700; width:max-content; }
      pre { margin:0; white-space:pre-wrap; word-break:break-word; background:#20170f; color:#f7efe6; border-radius:16px; padding:16px; font-size:13px; line-height:1.6; }
      @media (max-width:860px) { .card-body.with-image { grid-template-columns:1fr; } .image-wrap { border-right:0; border-bottom:1px solid var(--line); } }
    </style>
  </head>
  <body>
    <main class="page">
      <header>
        <h1>淘宝 OCR 审查页</h1>
        <p class="subtitle">这是本地审查服务。提交修改意见后，这条记录会自动从待审列表里消失。修改意见会先写本地文件，并尝试同步写入数据库的 <code>change_requests</code>。</p>
      </header>
      ${
        args.saved
          ? `<section class="flash success">已提交：${escapeHtml(args.saved)}</section>`
          : args.error
            ? `<section class="flash error">提交失败：${escapeHtml(args.error)}</section>`
            : ''
      }
      <section class="summary">
        ${metric('待审条数', args.pendingItems.length)}
        ${metric('总条数', args.payload.summary.total)}
        ${metric('硬冲突', args.payload.summary.hardMismatch)}
        ${metric('处理法冲突', args.payload.summary.processMethodMismatch)}
        ${metric('产地冲突', args.payload.summary.originMismatch)}
        ${metric('可补克重', args.payload.summary.weightFill)}
      </section>
      <section class="info">
        <div>来源文件：${escapeHtml(args.filePath)}</div>
        <div>决策文件：${escapeHtml(args.decisionsFile)}</div>
      </section>
      <section class="list">
        ${args.pendingItems.map(renderItem).join('') || '<section class="info">当前没有待审记录。</section>'}
      </section>
    </main>
  </body>
</html>`;
}

async function readRequestBody(request: import('node:http').IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

function createSupabaseIfConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

async function persistDecisionToDb(decision: ReviewDecision) {
  const db = createSupabaseIfConfigured();
  if (!db) return { persistedToDb: false, dbRequestId: null as string | null };

  const { data, error } = await db
    .from('change_requests')
    .insert({
      entity_type: decision.entityType,
      entity_id: decision.entityId,
      proposed_patch: {
        ...decision.patch,
        reviewItemId: decision.reviewItemId,
        createdAt: decision.createdAt,
      },
      reason: decision.patch.note || 'taobao_ocr_review',
      status: 'PENDING',
    })
    .select('id')
    .single();

  if (error) {
    return { persistedToDb: false, dbRequestId: null as string | null, error: error.message };
  }

  return { persistedToDb: true, dbRequestId: String(data.id) };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const loaded = await loadReviewPayload(args.reviewFile);
  if (!loaded) {
    throw new Error('No review payload found. Run audit-taobao-ocr.ts first.');
  }

  const server = createServer(async (request, response) => {
    const url = new URL(request.url ?? '/', `http://${request.headers.host ?? `127.0.0.1:${args.port}`}`);

    if (request.method === 'GET' && url.pathname === '/') {
      const decisions = await loadReviewDecisions(args.decisionsFile);
      const pendingItems = filterPendingReviewItems(loaded.payload.items, decisions);
      const html = renderPage({
        payload: loaded.payload,
        pendingItems,
        filePath: loaded.filePath,
        decisionsFile: args.decisionsFile,
        saved: url.searchParams.get('saved'),
        error: url.searchParams.get('error'),
      });
      response.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      response.end(html);
      return;
    }

    if (request.method === 'POST' && url.pathname === '/submit') {
      const rawBody = await readRequestBody(request);
      const form = new URLSearchParams(rawBody);
      const reviewItemId = form.get('reviewItemId')?.trim();
      const entityId = form.get('entityId')?.trim();

      if (!reviewItemId || !entityId) {
        response.writeHead(303, { Location: '/?error=missing-review-item' });
        response.end();
        return;
      }

      const patch = buildDecisionPatch({
        nextStatus: form.get('nextStatus'),
        note: form.get('note'),
        fields: {
          beanName: form.get('beanName') ?? undefined,
          originCountry: form.get('originCountry') ?? undefined,
          originRegion: form.get('originRegion') ?? undefined,
          processMethod: form.get('processMethod') ?? undefined,
          variety: form.get('variety') ?? undefined,
          roastLevel: form.get('roastLevel') ?? undefined,
          weightGrams: form.get('weightGrams') ?? undefined,
        },
      });

      if (Object.keys(patch.changes).length === 0 && patch.nextStatus === 'UNCHANGED' && !patch.note) {
        response.writeHead(303, { Location: '/?error=empty-decision' });
        response.end();
        return;
      }

      const baseDecision: ReviewDecision = {
        reviewItemId,
        entityId,
        entityType: 'ROASTER_BEAN',
        patch,
        createdAt: new Date().toISOString(),
        persistedToDb: false,
      };

      const dbPersisted = await persistDecisionToDb(baseDecision);
      const finalDecision: ReviewDecision = {
        ...baseDecision,
        persistedToDb: dbPersisted.persistedToDb,
        dbRequestId: dbPersisted.dbRequestId,
      };

      const decisions = await loadReviewDecisions(args.decisionsFile);
      const next = upsertDecision(decisions, finalDecision);
      await saveReviewDecisions(next, args.decisionsFile);

      const query = dbPersisted.error ? `/?saved=${encodeURIComponent(reviewItemId)}&error=${encodeURIComponent(dbPersisted.error)}` : `/?saved=${encodeURIComponent(reviewItemId)}`;
      response.writeHead(303, { Location: query });
      response.end();
      return;
    }

    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  });

  server.listen(args.port, '127.0.0.1', () => {
    console.log(
      JSON.stringify(
        {
          url: `http://127.0.0.1:${args.port}`,
          reviewFile: loaded.filePath,
          decisionsFile: args.decisionsFile,
        },
        null,
        2
      )
    );
  });
}

await main();
