# Agents

## Cursor Cloud specific instructions

This repository contains **two independent products** sharing one git repo (not a monorepo with shared tooling):

| Product | Directory | Stack | Dev command | Port |
|---------|-----------|-------|-------------|------|
| Clan landing site | `/` (root) | Astro 6, Vercel adapter | `npm run dev` | 4321 |
| Games session planner | `games/` | Next.js 15 (App Router), React 19, Tailwind 4, Supabase | `npm run dev` | 3000 |

### Running the services

- **Astro site** — no external dependencies; starts immediately with `npm run dev` from the repo root.
- **Games app** — requires Supabase credentials in `games/.env.local`. Without them the middleware throws on every request ("Your project's URL and Key are required"). The dev server compiles and starts, but pages return 500 until the env vars are set.

### Lint / build / test

| Task | Root (Astro) | games/ (Next.js) |
|------|-------------|-----------------|
| Lint | n/a | `npm run lint` |
| Build | `npm run build` | `npm run build` (works without Supabase env vars) |
| Dev | `npm run dev` | `npm run dev` |

### Environment variables (games/)

Required for the app to serve pages (middleware uses Supabase on every request):

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL` (e.g. `http://localhost:3000`)

Optional (app works without them):

- `DISCORD_WEBHOOK_ANNOUNCEMENTS`
- `DISCORD_WEBHOOK_REMINDERS`
- `API_INGRESS_TOKEN`
- `CRON_SECRET`

### Non-obvious notes

- The games app `npm run dev` script runs `clean` (deletes `.next/`) then `next dev`. Use `npm run dev:watch` to skip the clean step for faster restarts.
- Both projects use `npm` (lockfile is `package-lock.json`). Node >= 22.12 is required.
- The Astro site fetches live data from `games.directaction.monster/api/v1/games` at build time but gracefully falls back to static JSON, so it builds independently.
- No automated test suites exist in this repo — linting (`npm run lint` in `games/`) is the primary automated check.
