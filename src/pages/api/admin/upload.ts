import type { APIRoute } from 'astro';
import { verifyToken, parseSessionCookie } from '../../../lib/auth';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  const secret: string = env?.SESSION_SECRET ?? import.meta.env.SESSION_SECRET;
  const githubToken: string = env?.GITHUB_TOKEN ?? import.meta.env.GITHUB_TOKEN;
  const githubRepo: string =
    env?.GITHUB_REPO ?? import.meta.env.GITHUB_REPO ?? 'Parkerdv1966/thecoffeetimeblog.com';

  const sessionToken = parseSessionCookie(request.headers.get('cookie'));
  if (!sessionToken || !(await verifyToken(sessionToken, secret))) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  const form = await request.formData();
  const file = form.get('image') as File | null;
  if (!file?.name) {
    return new Response(JSON.stringify({ error: 'No file provided' }), { status: 400 });
  }

  const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase().replace(/[^a-z]/g, '');
  const safeName = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
  const repoPath = `public/uploads/${safeName}`;

  const bytes = await file.arrayBuffer();
  const base64 = btoa(String.fromCharCode(...new Uint8Array(bytes)));

  const res = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${repoPath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'thecoffeetimeblog-admin',
    },
    body: JSON.stringify({
      message: `Upload image: ${safeName}`,
      content: base64,
      branch: 'main',
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    return new Response(JSON.stringify({ error: `GitHub: ${body}` }), { status: 500 });
  }

  return new Response(JSON.stringify({ url: `/uploads/${safeName}` }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
