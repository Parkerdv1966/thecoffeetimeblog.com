# the coffee time blog

A personal journal of travels, writing, and coffee. Built with [Astro](https://astro.build/), styled in the **Coffee Notebook** direction (cream, espresso, ink navy, sunset terracotta, sage), and editable through a built-in admin at `/admin`.

Repository: [github.com/Parkerdv1966/thecoffeetimeblog.com](https://github.com/Parkerdv1966/thecoffeetimeblog.com)

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

Three content collections, all editable through `/admin` or as markdown files:

- **Journal entries** (`src/content/entries/`) — the daily/essay feed on the homepage
- **Trips** (`src/content/trips/`) — destinations shown on the travel page, plotted on the world map, with their own detail pages at `/travels/{slug}`
- **Works** (`src/content/works/`) — books, stories, essays in progress and finished, on the books page

Plus the About page and the site header/footer text — those are edited directly in `src/pages/about.astro`, `src/components/SiteHeader.astro`, and `src/components/SiteFooter.astro`.

---

## Photos & images

Drop photos into `public/images/` (or upload through the admin — same place). Reference them as `/images/your-photo.jpg` in the frontmatter.

### Hero image positioning

Hero images get cropped to fit the 16:9 wide hero block. By default the image centers, which can chop off the top of skyline shots. Set `heroPosition: top` in the frontmatter to keep the top portion of the image visible:

```yaml
heroImage: /images/lisbon-sunset.jpg
heroPosition: top         # options: center (default), top, bottom, left, right
heroAlt: "The Tagus river at sunset"
```

### 1–3 photos per journal entry

Add a `photos` array to any entry's frontmatter — up to 3 images, rendered as a gallery at the end of the post:

```yaml
photos:
  - /images/lisbon-1.jpg
  - /images/lisbon-2.jpg
  - /images/lisbon-3.jpg
photoAlts:
  - "Tram on Rua da Conceição"
  - "Coffee at A Brasileira"
  - "Alfama rooftops at dusk"
```

Layout adapts: 1 photo = full width, 2 = side by side, 3 = triptych. On phones, everything stacks.

### Photos on trips

Trips have an unlimited `photos` array (no 3-photo cap) shown on the trip's detail page at `/travels/{slug}`. The `coverImage` shows as both the hero on the trip page and the **hover preview on the world map**.

---

## The world map (travel page)

The map on `/travels` shows every trip as a marker:

- **Filled terracotta dots** = visited (`status: past`)
- **Hollow rings** = planned (`status: upcoming`)
- **Hovering** shows a preview card with the trip's cover image and city
- **Clicking** opens the trip's detail page at `/travels/{slug}` — full body, photo gallery, and any journal entries written from that location

Trip locations are plotted from real `coordinates: { lat, lng }`.

### Linking journal entries to a trip

An entry shows under "journal entries from Lisbon" on the Lisbon trip page automatically if both files use the same `location:` value (case-insensitive). No explicit foreign key needed — just match the city name.

---

## Deploying to Cloudflare Pages

1. Push the project to your GitHub repo (already at `Parkerdv1966/thecoffeetimeblog.com`):

   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/Parkerdv1966/thecoffeetimeblog.com.git
   git push -u origin main
   ```

2. In the Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git**

3. Pick your repo. Build settings:
   - **Framework preset**: Astro
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: `NODE_VERSION` = `20`

4. Deploy. Add `thecoffeetimeblog.com` under **Custom domains**.

After the first deploy, the public site and the admin both work — but the admin will show a login page that doesn't do anything yet. The next section fixes that.

---

## Setting up the admin login

The admin uses [Sveltia CMS](https://sveltiacms.app/). Sveltia has two authentication methods for GitHub. Pick one.

### Option A — Sign in with Token (recommended, ~3 minutes)

This is the simplest setup and works for a single editor (you). No OAuth app, no Cloudflare Worker, nothing else to deploy.

**How it works at runtime:**

1. Go to `https://thecoffeetimeblog.com/admin`
2. On the login screen, click the **small arrow** next to the "Sign In" button
3. Choose **"Sign In with Token"**
4. In the dialog, click the GitHub link Sveltia provides — it opens a token creation page with the right scopes already selected
5. Generate the token, copy it
6. Paste it back into Sveltia's dialog

That's it. The token is stored in your browser's local storage, so you only paste it once per device. You're now editing.

**A few things to know about PATs:**

- Fine-grained PATs default to 90 days. When yours expires, you'll repeat the paste step. Set the expiration longer (up to 1 year) if you want fewer renewals.
- The token only works on the device where you pasted it. Want to edit from your phone too? Generate a separate token for it.
- If you ever revoke the token (GitHub Settings → Personal access tokens → Revoke), the admin instantly loses access. Good kill-switch.

That's the only setup needed for Option A. The admin is ready as soon as Cloudflare deploys.

### Option B — Sign in with GitHub OAuth (advanced, ~15 minutes)

If you'd rather click "Sign in with GitHub" and have a proper OAuth flow with no expiring tokens to babysit, deploy Sveltia's OAuth Worker to Cloudflare. You still own everything — the worker runs in your account.

1. **Deploy the Worker.** Go to [sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) and click their "Deploy to Cloudflare Workers" button. Sign in with Cloudflare, accept defaults. After deploy, note the Worker URL — it looks like `https://sveltia-cms-auth.yoursubdomain.workers.dev`.

2. **Register a GitHub OAuth App.** Go to https://github.com/settings/developers → **OAuth Apps → New OAuth App**:
   - Application name: `the coffee time blog admin`
   - Homepage URL: `https://thecoffeetimeblog.com`
   - Authorization callback URL: `<your Worker URL>/callback` (e.g. `https://sveltia-cms-auth.yoursubdomain.workers.dev/callback`)
   
   Register. Note the **Client ID**. Generate a **Client Secret**. Copy both.

3. **Add the secrets to the Worker.** In Cloudflare → Workers → your `sveltia-cms-auth` worker → **Settings → Variables → Add variable**:
   - `GITHUB_CLIENT_ID` = your Client ID
   - `GITHUB_CLIENT_SECRET` = your Client Secret (mark as a secret)

4. **Point the admin at your Worker.** Edit `public/admin/config.yml` and uncomment + fill in `base_url`:
   ```yaml
   backend:
     name: github
     repo: Parkerdv1966/thecoffeetimeblog.com
     branch: main
     base_url: https://sveltia-cms-auth.yoursubdomain.workers.dev
   ```
   Commit and push. Cloudflare redeploys in ~30 seconds.

5. Visit `/admin` and click **Sign In with GitHub**. Standard OAuth flow.

---

## (Optional) Add Cloudflare Access on `/admin*`

A second layer that requires you to verify your email with Cloudflare before the Sveltia login page even loads. Free for personal use. Works with either auth option above.

1. Cloudflare → **Zero Trust → Access → Applications → Add application → Self-hosted**
2. Name: `Coffee Time Admin`. Domain: `thecoffeetimeblog.com`. Path: `/admin*`
3. Policy: **Allow** → Include: **Emails → your email**

---

## Frontmatter reference

| Collection | Required | Optional |
|---|---|---|
| **entries** | `title`, `publishDate`, `location`, `mode` | `dek`, `heroPalette`, `heroImage`, `heroAlt`, `heroPosition`, `photos` (max 3), `photoAlts`, `draft` |
| **trips** | `title`, `location`, `country`, `coordinates`, `startDate`, `status` | `endDate`, `coverPalette`, `coverImage`, `coverPosition`, `photos`, `draft` |
| **works** | `title`, `kind`, `status`, `note` | `startedDate`, `finishedDate`, `excerpt`, `coverImage`, `coverPalette`, `order`, `draft` |

**Palette values**: `terracotta` · `sage` · `ocean` · `gold` · `espresso`
**Image positions**: `center` (default) · `top` · `bottom` · `left` · `right`
**Modes** (entries): `writing` · `travels` · `café` · `essay`
**Trip statuses**: `past` · `upcoming`
**Work statuses**: `idea` · `gathering` · `first draft` · `in progress` · `editing` · `finished`

---

## Project structure

```
public/
├── admin/
│   ├── index.html              Sveltia CMS entry point
│   └── config.yml              Collections schema + GitHub config
├── images/                     Photos go here
└── favicon.svg

src/
├── components/
│   ├── CurrentlyWriting.astro
│   ├── EntryCard.astro
│   ├── FeaturedEntry.astro
│   ├── Ornament.astro
│   ├── PrevNext.astro
│   ├── SiteFooter.astro
│   ├── SiteHeader.astro
│   ├── TripCard.astro
│   ├── WorkCard.astro
│   └── WorldMap.astro
├── content/
│   ├── entries/
│   ├── trips/
│   └── works/
├── content.config.ts
├── layouts/
│   ├── BaseLayout.astro
│   └── EntryLayout.astro
├── lib/format.ts
├── pages/
│   ├── about.astro
│   ├── books.astro
│   ├── entries/[slug].astro
│   ├── index.astro
│   └── travels/
│       ├── index.astro
│       └── [slug].astro
└── styles/global.css
```

---

## Editing the design

**Colours** are CSS variables at the top of `src/styles/global.css`.

**Typography** loads Fraunces from Google Fonts in `src/layouts/BaseLayout.astro`.

**Currently writing card** copy lives in `src/pages/index.astro`.

**About page copy** lives directly in `src/pages/about.astro`.

**World map continents** are hand-drawn SVG paths in `src/components/WorldMap.astro` — stylized on purpose for the journal aesthetic. Marker positions use real lat/long projection, so they land in geographically correct spots even with stylized continents.

---

## What's next

- **RSS feed** at `/rss.xml` — Astro has `@astrojs/rss`
- **Mode-filtered index pages** — `/writing`, `/travels-mode`, etc., per `mode` field
- **Search** — Pagefind works well with Astro static sites
- **Cloudflare Images** — for serious photo libraries, ~$5/month

But none required. Sign in to `/admin`, write something, hit save — Cloudflare rebuilds within a minute.
