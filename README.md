# the coffee time blog

A personal journal of travels, writing, and coffee. Built with [Astro](https://astro.build/), styled in the **Coffee Notebook** direction (cream, espresso, ink navy, sunset terracotta, sage), and editable through a built-in admin at `/admin`.

---

## Quick start (local development)

You need **Node.js 18 or newer**.

```bash
npm install
npm run dev
```

The site runs at `http://localhost:4321`. Hot-reloads as you edit.

To build for deployment:

```bash
npm run build
```

Output goes to `dist/`.

---

## What's in the blog

Three content collections, all editable through the `/admin` interface or directly as markdown files:

- **Journal entries** (`src/content/entries/`) — the daily/essay feed on the homepage
- **Trips** (`src/content/trips/`) — destinations on the travel page, plotted on the world map
- **Works** (`src/content/works/`) — books, stories, essays in progress and finished, on the books page

Plus three "hard-coded" pages: homepage feed, About, and the site header/footer text. To change About copy, edit `src/pages/about.astro`. The header and footer text live in `src/components/SiteHeader.astro` and `src/components/SiteFooter.astro`.

---

## Setting up the admin (one-time)

The admin lives at `https://thecoffeetimeblog.com/admin`. It uses [Sveltia CMS](https://github.com/sveltia/sveltia-cms) — a free Git-based CMS that commits your edits as markdown files to your GitHub repo. Cloudflare Pages then auto-rebuilds the site.

This requires three things, in order:

### 1. Push the project to GitHub

Create a new GitHub repo (private is fine — Sveltia works with both private and public). Push this project to it.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

### 2. Set up Cloudflare Pages

In the Cloudflare dashboard:

1. **Workers & Pages → Create → Pages → Connect to Git**
2. Pick your repo. Build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: add `NODE_VERSION` = `20`
3. Deploy.
4. Add `thecoffeetimeblog.com` under **Custom domains** in the Pages project.

After this, the public site is live. Sveltia's `/admin` page will load — but logging in won't work yet. That's the next step.

### 3. Wire up GitHub login for the admin

Sveltia CMS uses GitHub OAuth so only you (and any collaborators you add to the repo) can log in.

**Step A — Create a GitHub OAuth App.**

1. Go to https://github.com/settings/developers → **OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name**: `the coffee time blog admin`
   - **Homepage URL**: `https://thecoffeetimeblog.com`
   - **Authorization callback URL**: `https://auth.sveltia.app/callback`
3. Click **Register application**.
4. Note the **Client ID**. Click **Generate a new client secret** and copy that too.

**Step B — Use Sveltia's hosted auth proxy.**

Sveltia maintains a free, public auth proxy at `auth.sveltia.app` that handles the GitHub OAuth handshake for you. To register your OAuth App with it:

1. Open `https://auth.sveltia.app/`
2. Paste your GitHub Client ID and Client Secret.
3. The page will give you back a config snippet — but you don't actually need to add it; the default `public/admin/config.yml` is already configured to use Sveltia's hosted endpoint.

(*Alternative — self-hosted:* if you'd rather run your own OAuth proxy on Cloudflare Workers, follow [Sveltia's self-hosting guide](https://github.com/sveltia/sveltia-cms-auth). Then uncomment and fill in the `base_url` in `public/admin/config.yml`.)

**Step C — Tell Sveltia which repo to commit to.**

Edit `public/admin/config.yml` and replace this line:

```yaml
repo: YOUR-GITHUB-USERNAME/YOUR-REPO-NAME
```

With your actual GitHub username and repo name. Commit and push:

```bash
git add public/admin/config.yml
git commit -m "Configure Sveltia CMS"
git push
```

Cloudflare will redeploy in about 30 seconds. After that, visit `https://thecoffeetimeblog.com/admin`, click **Sign in with GitHub**, approve the OAuth prompt, and you're in.

### 4. (Optional but recommended) Add a second layer with Cloudflare Access

Even though the admin is already locked down to your GitHub account, you can add Cloudflare Access on top of `/admin` so the login page itself isn't visible to the public — it requires you to verify your email with Cloudflare *before* the admin even loads. This is free for personal use (up to 50 users).

1. Cloudflare dashboard → **Zero Trust → Access → Applications → Add application → Self-hosted**.
2. Application name: `Coffee Time Admin`. Domain: `thecoffeetimeblog.com`. Path: `/admin*`.
3. Add an Access policy: **Action: Allow**. Include: **Emails → your email**.
4. Save. Now `/admin` requires a one-time code sent to your email before you can even see the GitHub login page.

This is belt-and-suspenders — useful but not strictly required.

---

## Writing a new entry, trip, or work

### Through the admin (recommended)

Go to `https://thecoffeetimeblog.com/admin`, sign in, click the collection (Journal entries, Trips, or Works), click **Create**. The form has every field with helpful labels and image upload built in.

When you save, Sveltia commits a markdown file to your GitHub repo. Cloudflare Pages auto-deploys within a minute. Refresh your site to see the new content.

### Manually (also fine)

Drop a markdown file into the right folder. The filename becomes the URL slug.

**A new journal entry** (`src/content/entries/barcelona-cortado.md`):

```markdown
---
title: "A cortado in Barcelona"
dek: "What the city sounds like at the hour the cafés open."
publishDate: 2026-05-12
location: "Barcelona"
mode: "café"
heroPalette: "terracotta"
---

The cortado came in a small glass...
```

**A new trip** (`src/content/trips/barcelona-2026.md`):

```markdown
---
title: "Barcelona, May 2026"
location: "Barcelona"
country: "Spain"
coordinates:
  lat: 41.3851
  lng: 2.1734
startDate: 2026-05-10
endDate: 2026-05-22
status: "past"
coverPalette: "terracotta"
---

Twelve days of Gaudí, vermut, and...
```

**A new work** (`src/content/works/the-northern-novel.md`):

```markdown
---
title: "The Northern Novel"
kind: "novel"
status: "first draft"
startedDate: 2026-04-01
note: "What it sounds like to grow up in a small town and leave."
coverPalette: "ocean"
order: 5
---
```

### Frontmatter reference

| Collection | Required fields | Optional fields |
|---|---|---|
| **entries** | `title`, `publishDate`, `location`, `mode` | `dek`, `heroPalette`, `heroImage`, `heroAlt`, `draft` |
| **trips** | `title`, `location`, `country`, `coordinates`, `startDate`, `status` | `endDate`, `coverPalette`, `coverImage`, `photos`, `draft` |
| **works** | `title`, `kind`, `status`, `note` | `startedDate`, `finishedDate`, `excerpt`, `coverImage`, `coverPalette`, `order`, `draft` |

**Hero palette values** (used when no image): `terracotta` · `sage` · `ocean` · `gold` · `espresso`

**Modes** (entries only): `writing` · `travels` · `café` · `essay`

**Statuses**: trips use `past` or `upcoming`; works use `idea`, `gathering`, `first draft`, `in progress`, `editing`, or `finished`.

---

## Adding photos

Drop images into `public/images/` and reference them with `/images/your-photo.jpg` in the frontmatter (the leading slash is important).

**Through the admin**: image fields handle upload automatically — no path-typing needed.

**Manually**: copy the file, then in your markdown frontmatter:

```yaml
heroImage: /images/lisbon-tagus-1.jpg
heroAlt: "The Tagus river at sunset, from Chiado"
```

The site uses lazy loading and proper `aspect-ratio` on every image — good performance out of the box. As your photo library grows past a few hundred photos or you start posting 10MB high-res files, you can move to **Cloudflare Images** ($5/month) without changing the markdown — only the URL pattern. Worth doing later, not now.

---

## Project structure

```
public/
├── admin/
│   ├── index.html            Sveltia CMS entry point
│   └── config.yml            Collections schema + GitHub config (EDIT THIS)
├── images/                   Photos uploaded by the admin live here
└── favicon.svg

src/
├── components/
│   ├── CurrentlyWriting.astro
│   ├── EntryCard.astro       Journal-entry grid card
│   ├── FeaturedEntry.astro   Big hero entry on the homepage
│   ├── Ornament.astro        The · · · divider
│   ├── PrevNext.astro        Previous/next navigation on entries
│   ├── SiteFooter.astro
│   ├── SiteHeader.astro      Logo, tagline, primary nav
│   ├── TripCard.astro        Single trip block on the travel page
│   ├── WorkCard.astro        Single work block on the books page
│   └── WorldMap.astro        SVG map with lat/long-projected markers
├── content/
│   ├── entries/              Journal posts (.md)
│   ├── trips/                Trip destinations (.md)
│   └── works/                Books, stories, essays (.md)
├── content.config.ts         Schemas — DO NOT delete; the build needs them
├── layouts/
│   ├── BaseLayout.astro      HTML shell, fonts, header, footer
│   └── EntryLayout.astro     Single journal-post wrapper
├── lib/
│   └── format.ts             Date/day-of-week helpers
├── pages/
│   ├── about.astro           About page (edit copy directly here)
│   ├── books.astro           Books index — pulls from works collection
│   ├── entries/[slug].astro  Dynamic journal post page
│   ├── index.astro           Homepage feed
│   └── travels.astro         Travel page with map and trip list
└── styles/
    └── global.css            Palette, typography, base styles
```

---

## Editing the design

**Colours** are CSS variables at the top of `src/styles/global.css`. Change `--c-cream`, `--c-espresso`, `--c-terracotta`, etc., and the change cascades site-wide.

**Typography** is loaded from Google Fonts (Fraunces, variable, with optical sizing) in `src/layouts/BaseLayout.astro`. To swap to a different serif: change the `<link href=...>` URL and update `--font-display` / `--font-body` in `global.css`.

**Site logo, tagline, nav links** live in `src/components/SiteHeader.astro`.
**Footer text** lives in `src/components/SiteFooter.astro`.
**About page copy** lives directly in `src/pages/about.astro`.

The "Currently writing" card on the homepage reads from a hard-coded `<CurrentlyWriting />` component call in `src/pages/index.astro`. To make that pull from the `works` collection automatically (showing whichever in-progress work has order=1), change the homepage to use `getCollection('works')`. (Said another way: when you don't want to edit the homepage to update the card, switch to the collection-driven version.)

---

## Day-of-week labelling

Trips, entries, and works show their date in journal style — *"Tuesday — Lisbon, October"*. The day-of-week is computed automatically from `publishDate` in `src/lib/format.ts`. Don't try to set it manually; just put the right date in the frontmatter.

---

## What's next

Things you can layer on as the blog grows:

- **RSS feed** at `/rss.xml` — Astro has a first-party plugin (`@astrojs/rss`).
- **Mode-filtered index pages** — e.g., a `/writing` page that only shows entries with `mode: writing`. ~20 lines per page using `getCollection`.
- **Search** — Pagefind plays nicely with Astro static sites.
- **Tag system** — add a `tags: [array]` field to the entries schema, render a tag cloud somewhere.
- **Cloudflare Images** — once you've got a lot of photos, move them off the repo for faster delivery.

But none of this is needed to publish. Open `/admin`, write something, hit save, and the site rebuilds.
