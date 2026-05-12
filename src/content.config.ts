import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// --- Daily journal entries ---
const entries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/entries' }),
  schema: z.object({
    title: z.string(),
    dek: z.string().optional(),
    publishDate: z.date(),
    location: z.string(),
    mode: z.enum(['writing', 'travels', 'café', 'essay']),
    heroPalette: z
      .enum(['terracotta', 'sage', 'ocean', 'gold', 'espresso'])
      .default('terracotta'),
    heroImage: z.string().optional(),
    heroAlt: z.string().optional(),
    // Controls how the hero image is positioned when cropped.
    // 'center' (default), 'top', 'bottom', or any object-position value.
    heroPosition: z
      .enum(['center', 'top', 'bottom', 'left', 'right'])
      .default('center'),
    // 1–3 photos shown as a gallery at the end of the entry.
    photos: z.array(z.string()).max(3).optional(),
    photoAlts: z.array(z.string()).max(3).optional(),
    draft: z.boolean().default(false),
  }),
});

// --- Trips: destinations for the travel page + map ---
const trips = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/trips' }),
  schema: z.object({
    title: z.string(),
    location: z.string(),
    country: z.string(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
    startDate: z.date(),
    endDate: z.date().optional(),
    status: z.enum(['past', 'upcoming']).default('past'),
    coverPalette: z
      .enum(['terracotta', 'sage', 'ocean', 'gold', 'espresso'])
      .default('terracotta'),
    coverImage: z.string().optional(),
    coverPosition: z
      .enum(['center', 'top', 'bottom', 'left', 'right'])
      .default('center'),
    photos: z.array(z.string()).optional(),
    draft: z.boolean().default(false),
  }),
});

// --- Works: books, stories, essays in progress and finished ---
const works = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/works' }),
  schema: z.object({
    title: z.string(),
    kind: z.enum([
      'short story',
      'novella',
      'novel',
      'essay collection',
      'poem',
      'poetry collection',
    ]),
    status: z.enum([
      'idea',
      'gathering',
      'first draft',
      'in progress',
      'editing',
      'finished',
    ]),
    startedDate: z.date().optional(),
    finishedDate: z.date().optional(),
    excerpt: z.string().optional(),
    note: z.string(),
    coverImage: z.string().optional(),
    coverPalette: z
      .enum(['terracotta', 'sage', 'ocean', 'gold', 'espresso'])
      .default('espresso'),
    order: z.number().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { entries, trips, works };
