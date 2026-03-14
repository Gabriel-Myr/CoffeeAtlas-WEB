export interface JwtPayload {
  sub: string;
  openid: string;
  scope: 'user';
  iat: number;
  exp: number;
}

const ALGORITHM = { name: 'HMAC', hash: 'SHA-256' };
const EXPIRY_SECONDS = 30 * 24 * 60 * 60; // 30 days

function base64url(data: ArrayBuffer): string {
  return Buffer.from(data)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64urlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

function base64urlDecode(str: string): string {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  return Buffer.from(pad ? padded + '='.repeat(4 - pad) : padded, 'base64').toString('utf8');
}

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    ALGORITHM,
    false,
    ['sign', 'verify']
  );
}

function getSecret(): string {
  const secret = process.env.APP_JWT_SECRET;
  if (!secret) throw new Error('APP_JWT_SECRET is not set');
  return secret;
}

export async function signJwt(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JwtPayload = { ...payload, iat: now, exp: now + EXPIRY_SECONDS };

  const header = base64urlEncode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64urlEncode(JSON.stringify(fullPayload));
  const signingInput = `${header}.${body}`;

  const key = await importKey(getSecret());
  const signature = await crypto.subtle.sign(ALGORITHM, key, new TextEncoder().encode(signingInput));

  return `${signingInput}.${base64url(signature)}`;
}

export async function verifyJwt(token: string): Promise<JwtPayload> {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('invalid_token');

  const [header, body, sig] = parts;
  const signingInput = `${header}.${body}`;

  const key = await importKey(getSecret());
  const sigBytes = Buffer.from(sig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const valid = await crypto.subtle.verify(
    ALGORITHM,
    key,
    sigBytes,
    new TextEncoder().encode(signingInput)
  );
  if (!valid) throw new Error('invalid_signature');

  const payload = JSON.parse(base64urlDecode(body)) as JwtPayload;
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('token_expired');

  return payload;
}
