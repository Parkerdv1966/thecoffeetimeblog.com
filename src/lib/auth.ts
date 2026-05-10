const COOKIE = 'ctb_admin';
const TTL_S = 12 * 60 * 60; // 12 hours

export async function sha256Hex(text: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function createToken(secret: string): Promise<string> {
  const expires = Math.floor(Date.now() / 1000) + TTL_S;
  const payload = `admin|${expires}`;
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)));
  return btoa(`${payload}|${sigB64}`);
}

export async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const decoded = atob(token);
    const lastPipe = decoded.lastIndexOf('|');
    const payload = decoded.slice(0, lastPipe);
    const sigB64 = decoded.slice(lastPipe + 1);
    const parts = payload.split('|');
    if (parts[0] !== 'admin') return false;
    if (Math.floor(Date.now() / 1000) > parseInt(parts[1])) return false;
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['verify'],
    );
    const sigBytes = Uint8Array.from(atob(sigB64), c => c.charCodeAt(0));
    return await crypto.subtle.verify('HMAC', key, sigBytes, new TextEncoder().encode(payload));
  } catch {
    return false;
  }
}

export function parseSessionCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  const m = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  return m?.[1];
}

export function sessionCookieHeader(token: string): string {
  return `${COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL_S}`;
}

export function clearCookieHeader(): string {
  return `${COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}
