#!/usr/bin/env node
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const targetUrl = process.argv[2] || process.env.TEST_TARGET_URL || 'https://lkadpxktijdtibftuuwi.supabase.co/rest/v1/';
const groupName = process.argv[3] || process.env.SURGE_GROUP_NAME || 'Proxy';
const apiBase = (process.env.SURGE_API_BASE || 'http://127.0.0.1:6171').replace(/\/$/, '');
const apiKey = process.env.SURGE_API_KEY || '';
const proxyUrl = process.env.SURGE_LOCAL_HTTP_PROXY || 'http://127.0.0.1:6152';
const timeoutSeconds = Number(process.env.TEST_TIMEOUT_SECONDS || '12');
const settleMs = Number(process.env.SURGE_SETTLE_MS || '1500');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function surgeGet(path) {
  const res = await fetch(`${apiBase}${path}`, {
    headers: {
      'X-Key': apiKey,
      Accept: 'application/json',
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET ${path} failed (${res.status}): ${text.slice(0, 300)}`);
  }

  return res.json();
}

async function surgePost(path, body) {
  const res = await fetch(`${apiBase}${path}`, {
    method: 'POST',
    headers: {
      'X-Key': apiKey,
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`POST ${path} failed (${res.status}): ${text.slice(0, 300)}`);
  }

  return res.json();
}

async function probeThroughProxy(policyName) {
  const env = {
    ...process.env,
    HTTPS_PROXY: proxyUrl,
    HTTP_PROXY: proxyUrl,
    ALL_PROXY: proxyUrl,
    https_proxy: proxyUrl,
    http_proxy: proxyUrl,
    all_proxy: proxyUrl,
  };

  const args = [
    '-sS',
    '-o',
    '/dev/null',
    '-w',
    '%{http_code} %{time_connect} %{time_appconnect} %{time_total}',
    '--max-time',
    String(timeoutSeconds),
    '-I',
    targetUrl,
  ];

  try {
    const { stdout, stderr } = await execFileAsync('/usr/bin/curl', args, { env });
    return {
      policy: policyName,
      ok: true,
      metrics: stdout.trim(),
      stderr: stderr.trim(),
    };
  } catch (error) {
    return {
      policy: policyName,
      ok: false,
      metrics: '',
      stderr: [error.stderr, error.message].filter(Boolean).join('\n').trim(),
    };
  }
}

function extractCandidates(policyGroups, name) {
  const group = policyGroups?.[name];
  if (!group) {
    throw new Error(`Policy group \"${name}\" not found. Available groups: ${Object.keys(policyGroups || {}).join(', ')}`);
  }

  const candidates = group.policies || group.available || group.candidates || [];
  if (!Array.isArray(candidates) || candidates.length === 0) {
    throw new Error(`Policy group \"${name}\" has no candidates in API response: ${JSON.stringify(group).slice(0, 400)}`);
  }

  return candidates.filter((item) => typeof item === 'string' && item !== 'DIRECT' && item !== 'REJECT');
}

async function main() {
  console.log(`Target URL: ${targetUrl}`);
  console.log(`Policy group: ${groupName}`);
  console.log(`Surge API: ${apiBase}`);
  console.log(`Local proxy: ${proxyUrl}`);

  if (!apiKey) {
    console.error('\nMissing SURGE_API_KEY.');
    console.error('Enable Surge HTTP API in the active profile, for example:');
    console.error('[General]');
    console.error('http-api = yourkey@127.0.0.1:6171');
    console.error('http-api-tls = false');
    process.exit(1);
  }

  let policyGroups;
  try {
    policyGroups = await surgeGet('/v1/policy_groups');
  } catch (error) {
    console.error('\nUnable to reach Surge HTTP API.');
    console.error(String(error));
    console.error('\nMake sure the active Surge profile enables `http-api`, then retry.');
    process.exit(1);
  }

  const candidates = extractCandidates(policyGroups, groupName);
  console.log(`\nTesting ${candidates.length} candidates...\n`);

  const results = [];
  for (const policy of candidates) {
    process.stdout.write(`Switching ${groupName} -> ${policy} ... `);
    try {
      await surgePost('/v1/policy_groups/select', {
        group_name: groupName,
        policy,
      });
      await sleep(settleMs);
      const result = await probeThroughProxy(policy);
      results.push(result);
      console.log(result.ok ? `OK ${result.metrics}` : 'FAIL');
      if (!result.ok && result.stderr) {
        console.log(result.stderr.split('\n').slice(-2).join('\n'));
      }
    } catch (error) {
      results.push({ policy, ok: false, metrics: '', stderr: String(error) });
      console.log('FAIL');
      console.log(String(error));
    }
  }

  console.log('\nResults:\n');
  for (const result of results) {
    const status = result.ok ? 'PASS' : 'FAIL';
    const details = result.ok ? result.metrics : result.stderr.split('\n').slice(-1)[0];
    console.log(`${status.padEnd(4)} ${result.policy} ${details ? `- ${details}` : ''}`);
  }

  const winners = results.filter((item) => item.ok);
  if (winners.length > 0) {
    console.log('\nReachable policies:');
    for (const winner of winners) {
      console.log(`- ${winner.policy}: ${winner.metrics}`);
    }
  } else {
    console.log('\nNo tested policy reached the target URL through the local Surge proxy.');
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
