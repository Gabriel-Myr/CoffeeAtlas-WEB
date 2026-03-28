import { runSmokeChecks } from './smoke-v1-core.mjs';

const baseUrl = (process.env.API_BASE_URL || '').trim().replace(/\/+$/, '');
const authToken = (process.env.AUTH_TOKEN || '').trim();

if (!baseUrl) {
  console.error('Missing API_BASE_URL. Example: API_BASE_URL=https://your-domain.com pnpm smoke:api');
  process.exit(1);
}

await runSmokeChecks(baseUrl, authToken);
