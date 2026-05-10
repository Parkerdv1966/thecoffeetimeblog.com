import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://thecoffeetimeblog.com',
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
});
