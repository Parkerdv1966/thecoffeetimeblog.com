import type { APIRoute } from 'astro';
import { sha256Hex, createToken, sessionCookieHeader } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  const storedHash: string = env?.ADMIN_PASSWORD_HASH ?? import.meta.env.ADMIN_PASSWORD_HASH;
  const secret: string = env?.SESSION_SECRET ?? import.meta.env.SESSION_SECRET;

  if (!storedHash || !secret) {
    return new Response('Server misconfigured — set ADMIN_PASSWORD_HASH and SESSION_SECRET', { status: 500 });
  }

  const form = await request.formData();
  const password = form.get('password')?.toString() ?? '';
  const hash = await sha256Hex(password);

  if (hash !== storedHash.toLowerCase()) {
    const url = new URL(request.url);
    url.pathname = '/admin/login';
    url.searchParams.set('error', '1');
    return Response.redirect(url, 303);
  }

  const token = await createToken(secret);
  return new Response(null, {
    status: 303,
    headers: {
      'Set-Cookie': sessionCookieHeader(token),
      Location: '/admin',
    },
  });
};
