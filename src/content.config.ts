import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

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
    draft: z.boolean().default(false),
  }),
});

export const collections = { entries };
