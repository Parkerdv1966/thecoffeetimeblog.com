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
heroPosition: top         # default is 'center'. options: top, bottom, left, right, center
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

The layout adapts automatically: 1 photo = full width, 2 photos = side by side, 3 photos = a triptych. On phones, all photos stack to a single column.

In the admin, the photos field shows as an image-upload list with a 3-photo cap.

### Photos on trips

Trips have an unlimited `photos` array (no 3-photo cap) shown on the trip's detail page at `/travels/{slug}`. The `coverImage` shows as both the hero on the trip page and the **hover preview on the world map**.

---

## The world map (travel page)

The map on `/travels` shows every trip you've logged as a marker:

- **Filled terracotta dots** = trips you've taken (`status: past`)
- **Hollow rings** = trips you're planning (`status: upcoming`)
- **Hovering** a marker shows a preview card with the trip's cover image and city name
- **Clicking** a marker takes you to `/travels/{slug}` — the trip's detail page, with photos and any journal entries written from that location

Trip locations are plotted from real `coordinates: { lat, lng }`. The continents are stylized rather than precisely geographic — fits the journal aesthetic — but the markers themselves use accurate lat/long projection, so they land in the right place.

### Linking journal entries to a trip

A journal entry shows up under "journal entries from Lisbon" on the Lisbon trip page automatically if both files use the same `location:` value (case-insensitive). No explicit foreign key needed — just match the city name.

---

## Setting up the admin (one-time)

The admin lives at `https://thecoffeetimeblog.com/admin`. It uses [Sveltia CMS](https://github.com/sveltia/sveltia-cms) — a free Git-based CMS that commits your edits as markdown files to your GitHub repo. Cloudflare Pages then auto-rebuilds the site.

This requires three things, in order:

### 1. Push the project to GitHub

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
4. Add `thecoffeetimeblog.com` under **Custom domains**.

After this, the public site is live.

### 3. Wire up GitHub login for the admin

Sveltia uses GitHub OAuth so only you (and any collaborators on the repo) can log in.

**Step A — Create a GitHub OAuth App.**

1. Go to https://github.com/settings/developers → **OAuth Apps → New OAuth App**.
2. Fill in:
   - **Application name**: `the coffee time blog admin`
   - **Homepage URL**: `https://thecoffeetimeblog.com`
   - **Authorization callback URL**: `https://auth.sveltia.app/callback`
3. Click **Register application**.
4. Note the **Client ID**. Generate a **Client Secret** and copy that too.

**Step B — Register with Sveltia's hosted auth.**

Sveltia maintains a free public OAuth proxy at `auth.sveltia.app`. Visit `https://auth.sveltia.app/` and paste your Client ID + Client Secret. The hosted proxy will handle the GitHub handshake on every admin login.

(*Alternative:* self-host the proxy on Cloudflare Workers using [Sveltia's auth guide](https://github.com/sveltia/sveltia-cms-auth). Then uncomment `base_url` in `public/admin/config.yml`.)

**Step C — Point the admin at your repo.**

Edit `public/admin/config.yml`, replace `YOUR-GITHUB-USERNAME/YOUR-REPO-NAME` with your actual repo, commit and push. After Cloudflare redeploys (~30 seconds), visit `https://thecoffeetimeblog.com/admin`, click **Sign in with GitHub**, approve.

### 4. (Optional) Add Cloudflare Access on `/admin*`

Belt-and-suspenders second layer — requires you to verify your email with Cloudflare before the GitHub login page even loads. Free for personal use.

1. Cloudflare dashboard → **Zero Trust → Access → Applications → Add application → Self-hosted**.
2. Name: `Coffee Time Admin`. Domain: `thecoffeetimeblog.com`. Path: `/admin*`.
3. Policy: **Allow**. Include: **Emails → your email**.

---

## Frontmatter reference

| Collection | Required fields | Optional fields |
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
│   ├── index.html            Sveltia CMS entry point
│   └── config.yml            Collections schema + GitHub config (EDIT THIS)
├── images/                   Photos go here (uploaded via admin or manually)
└── favicon.svg

src/
├── components/
│   ├── CurrentlyWriting.astro
│   ├── EntryCard.astro        Journal-entry grid card
│   ├── FeaturedEntry.astro    Big hero entry on the homepage
│   ├── Ornament.astro         The · · · divider
│   ├── PrevNext.astro         Previous/next nav on entries
│   ├── SiteFooter.astro
│   ├── SiteHeader.astro       Logo, tagline, nav
│   ├── TripCard.astro         Trip block on the travels index
│   ├── WorkCard.astro         Work block on the books page
│   └── WorldMap.astro         SVG map with hover preview + click-to-page
├── content/
│   ├── entries/               Journal posts (.md)
│   ├── trips/                 Trip destinations (.md)
│   └── works/                 Books, stories, essays (.md)
├── content.config.ts          Schemas — required for the build
├── layouts/
│   ├── BaseLayout.astro       HTML shell, fonts, header, footer
│   └── EntryLayout.astro      Journal-post wrapper
├── lib/
│   └── format.ts              Date/day-of-week helpers
├── pages/
│   ├── about.astro            About page (edit copy directly)
│   ├── books.astro            Books index — pulls from works
│   ├── entries/[slug].astro   Dynamic journal post
│   ├── index.astro            Homepage feed
│   └── travels/
│       ├── index.astro        Map + trip list
│       └── [slug].astro       Individual trip page (photos + related entries)
└── styles/
    └── global.css             Palette, typography, base styles
```

---

## Editing the design

**Colours** live as CSS variables at the top of `src/styles/global.css`. Change `--c-cream`, `--c-espresso`, `--c-terracotta`, etc., and the change cascades everywhere.

**Typography** loads Fraunces from Google Fonts in `src/layouts/BaseLayout.astro`. To swap to a different serif, change the `<link>` URL and update `--font-display` / `--font-body`.

**The "Currently writing" card** copy is in `src/pages/index.astro` — edit the `<CurrentlyWriting title="..." description="..." />` line.

**The world map's continents** are SVG paths in `src/components/WorldMap.astro`. The map is intentionally stylized (hand-drawn-feel) to fit the journal aesthetic. To swap in a real geographic map, replace the path data — markers will still project correctly because they use real lat/long.

---

## What's next

Things to layer on as the blog grows:

- **RSS feed** at `/rss.xml` — Astro has `@astrojs/rss`.
- **Mode-filtered index pages** — `/writing`, `/travels` modes per `mode` field.
- **Search** — Pagefind works well with Astro static sites.
- **Cloudflare Images** — once your photo library passes a few hundred files, move to their CDN service ($5/month). Only the URL pattern changes.

But none of this is required. Open `/admin`, write something, hit save, and Cloudflare rebuilds the site within a minute.
