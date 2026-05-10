import type { APIRoute } from 'astro';
import { clearCookieHeader } from '../../../lib/auth';

export const prerender = false;

export const GET: APIRoute = async () => {
  return new Response(null, {
    status: 303,
    headers: {
      'Set-Cookie': clearCookieHeader(),
      Location: '/admin/login',
    },
  });
};
