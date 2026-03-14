const requiredWebEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'APP_JWT_SECRET',
  'WECHAT_APP_ID',
  'WECHAT_APP_SECRET',
];

const optionalHints = [
  {
    name: 'TARO_APP_API_URL',
    description: '小程序编译期默认 API 地址；也可在“我的 -> API 联调”里运行时覆盖',
  },
];

function isPresent(name) {
  return Boolean((process.env[name] || '').trim());
}

function maskValue(name) {
  const value = (process.env[name] || '').trim();
  if (!value) return '(missing)';
  if (value.length <= 8) return `${value.slice(0, 2)}***`;
  return `${value.slice(0, 4)}***${value.slice(-2)}`;
}

const missing = requiredWebEnv.filter((name) => !isPresent(name));

console.log('Cloud env readiness');
console.log('===================');

for (const name of requiredWebEnv) {
  const status = isPresent(name) ? 'OK ' : 'MISS';
  console.log(`[${status}] ${name} ${maskValue(name)}`);
}

console.log('\nOptional');
console.log('--------');
for (const item of optionalHints) {
  const status = isPresent(item.name) ? 'SET ' : 'SKIP';
  console.log(`[${status}] ${item.name} - ${item.description}`);
}

console.log('\nAPI smoke reminders');
console.log('-------------------');
console.log('1. /api/v1/health should return supabaseConfigured/wechatConfigured/jwtConfigured = true');
console.log('2. 小程序在“我的 -> API 联调”里填 HTTPS 域名');
console.log('3. 终端可运行: API_BASE_URL=https://your-domain.com pnpm smoke:api');

if (missing.length > 0) {
  console.error(`\nMissing ${missing.length} required env var(s): ${missing.join(', ')}`);
  process.exit(1);
}

console.log('\nAll required web env vars are present.');
