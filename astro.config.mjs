// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import vercel from '@astrojs/vercel';

// https://astro.build/config
export default defineConfig({
  site: process.env.SITE_URL ?? 'https://directactionclan.com',
  output: 'static',
  integrations: [sitemap()],
  adapter: vercel()
});