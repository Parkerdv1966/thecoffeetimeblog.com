import type { APIRoute } from 'astro';
import { verifyToken, parseSessionCookie } from '../../../lib/auth';

export const prerender = false;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 55)
    .replace(/^-|-$/g, '');
}

function buildMarkdown(fields: Record<string, string>, body: string): string {
  const { title, dek, publishDate, location, mode, heroPalette, heroImage, draft } = fields;
  const lines = ['---'];
  lines.push(`title: "${title.replace(/"/g, '\\"')}"`);
  if (dek.trim()) lines.push(`dek: "${dek.replace(/"/g, '\\"')}"`);
  lines.push(`publishDate: ${publishDate}`);
  lines.push(`location: "${location.replace(/"/g, '\\"')}"`);
  lines.push(`mode: ${mode}`);
  lines.push(`heroPalette: ${heroPalette}`);
  if (heroImage.trim()) lines.push(`heroImage: "${heroImage}"`);
  if (draft === 'true') lines.push('draft: true');
  lines.push('---', '', body.trim(), '');
  return lines.join('\n');
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = (locals as any).runtime?.env;
  const secret: string = env?.SESSION_SECRET ?? import.meta.env.SESSION_SECRET;
  const githubToken: string = env?.GITHUB_TOKEN ?? import.meta.env.GITHUB_TOKEN;
  const githubRepo: string =
    env?.GITHUB_REPO ?? import.meta.env.GITHUB_REPO ?? 'Parkerdv1966/thecoffeetimeblog.com';

  const sessionToken = parseSessionCookie(request.headers.get('cookie'));
  if (!sessionToken || !(await verifyToken(sessionToken, secret))) {
    return Response.redirect(new URL('/admin/login', request.url), 303);
  }

  const form = await request.formData();
  const get = (k: string) => form.get(k)?.toString() ?? '';

  const title = get('title').trim();
  const publishDate = get('publishDate') || new Date().toISOString().slice(0, 10);
  const location = get('location').trim();

  if (!title || !location) {
    return Response.redirect(new URL('/admin?error=missing', request.url), 303);
  }

  const slug = `${slugify(title)}-${publishDate}`;
  const markdown = buildMarkdown(
    {
      title,
      dek: get('dek'),
      publishDate,
      location,
      mode: get('mode') || 'essay',
      heroPalette: get('heroPalette') || 'terracotta',
      heroImage: get('heroImage'),
      draft: get('draft'),
    },
    get('content'),
  );

  // btoa doesn't handle multi-byte chars — encode via TextEncoder first
  const bytes = new TextEncoder().encode(markdown);
  const base64 = btoa(String.fromCharCode(...bytes));

  const repoPath = `src/content/entries/${slug}.md`;

  const res = await fetch(`https://api.github.com/repos/${githubRepo}/contents/${repoPath}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${githubToken}`,
      'Content-Type': 'application/json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'thecoffeetimeblog-admin',
    },
    body: JSON.stringify({
      message: `New entry: ${title}`,
      content: base64,
      branch: 'main',
    }),
  });

  if (!res.ok) {
    console.error('GitHub error:', await res.text());
    return Response.redirect(new URL('/admin?error=github', request.url), 303);
  }

  return Response.redirect(new URL('/admin?success=1', request.url), 303);
};
