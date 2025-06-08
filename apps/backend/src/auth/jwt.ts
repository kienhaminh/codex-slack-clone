import { createHmac } from 'crypto';

function base64url(input: string): string {
  return Buffer.from(input).toString('base64url');
}

function signData(data: string, secret: string): string {
  return createHmac('sha256', secret).update(data).digest('base64url');
}

export function signJwt(
  payload: Record<string, unknown>,
  secret: string,
  expiresInSec: number,
): string {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const exp = Math.floor(Date.now() / 1000) + expiresInSec;
  const body = base64url(JSON.stringify({ ...payload, exp }));
  const content = `${header}.${body}`;
  const signature = signData(content, secret);
  return `${content}.${signature}`;
}

export function verifyJwt<T>(token: string, secret: string): T {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token');
  const [header, body, signature] = parts;
  if (signData(`${header}.${body}`, secret) !== signature) {
    throw new Error('Invalid token');
  }
  const payload = JSON.parse(
    Buffer.from(body, 'base64url').toString('utf8'),
  ) as T & { exp: number };
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new Error('Token expired');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { exp, ...rest } = payload;
  return rest as T;
}
