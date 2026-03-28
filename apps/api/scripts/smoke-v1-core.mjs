/**
 * @typedef {Object} SmokeCheck
 * @property {string} name
 * @property {string} path
 * @property {'GET' | 'POST'} [method]
 * @property {Record<string, unknown>} [body]
 * @property {number[]} [expectedStatuses]
 */

/**
 * @param {string} authToken
 * @returns {SmokeCheck[]}
 */
export function buildChecks(authToken) {
  /** @type {SmokeCheck[]} */
  const checks = [
    { name: 'v1 health', path: '/api/v1/health' },
    { name: 'beans list', path: '/api/v1/beans?page=1&pageSize=2' },
    { name: 'roasters list', path: '/api/v1/roasters?page=1&pageSize=2' },
    {
      name: 'wechat login route',
      path: '/api/v1/auth/wechat/login',
      method: 'POST',
      body: {},
      expectedStatuses: [400, 401, 500, 502],
    },
  ];

  if (authToken) {
    checks.push(
      { name: 'current user', path: '/api/v1/me' },
      { name: 'favorites', path: '/api/v1/me/favorites' },
    );
  }

  return checks;
}

/**
 * @param {string} value
 * @returns {string}
 */
export function truncate(value) {
  return value.length > 400 ? `${value.slice(0, 400)}...` : value;
}

/**
 * @param {string} baseUrl
 * @param {string} authToken
 */
export async function runSmokeChecks(baseUrl, authToken) {
  const checks = buildChecks(authToken);

  for (const check of checks) {
    const startedAt = Date.now();
    const response = await fetch(`${baseUrl}${check.path}`, {
      method: check.method ?? 'GET',
      headers: {
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        ...(check.body ? { 'Content-Type': 'application/json' } : {}),
      },
      body: check.body ? JSON.stringify(check.body) : undefined,
    });
    const text = await response.text();
    const elapsed = Date.now() - startedAt;
    const expectedHint = check.expectedStatuses?.length
      ? ` expected ${check.expectedStatuses.join('/')}`
      : '';
    const statusFlag = check.expectedStatuses?.includes(response.status) === false
      ? ' !'
      : '';

    console.log(`\n[${check.name}] ${response.status} ${response.statusText}${expectedHint}${statusFlag} (${elapsed}ms)`);
    console.log(truncate(text));
  }
}
