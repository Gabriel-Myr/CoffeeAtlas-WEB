const baseUrl = (process.env.API_BASE_URL || '').trim().replace(/\/+$/, '');
const authToken = (process.env.AUTH_TOKEN || '').trim();

if (!baseUrl) {
  console.error('Missing API_BASE_URL. Example: API_BASE_URL=https://your-domain.com pnpm smoke:api');
  process.exit(1);
}

const checks = [
  { name: 'v1 health', path: '/api/v1/health' },
  { name: 'beans list', path: '/api/v1/beans?page=1&pageSize=2' },
  { name: 'roasters list', path: '/api/v1/roasters?page=1&pageSize=2' },
];

if (authToken) {
  checks.push(
    { name: 'current user', path: '/api/v1/me' },
    { name: 'favorites', path: '/api/v1/me/favorites' },
  );
}

function truncate(value) {
  return value.length > 400 ? `${value.slice(0, 400)}...` : value;
}

for (const check of checks) {
  const startedAt = Date.now();
  const response = await fetch(`${baseUrl}${check.path}`, {
    headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
  });
  const text = await response.text();
  const elapsed = Date.now() - startedAt;

  console.log(`\n[${check.name}] ${response.status} ${response.statusText} (${elapsed}ms)`);
  console.log(truncate(text));
}
