# Direct Action Games

Clan session planner and RSVP app (The100.io-style), deployed separately from the main Astro site.

## Local development

```bash
cd games
npm install
cp .env.example .env.local   # fill from Supabase + Discord (see below)
npm run dev
```

Local dev uses the **cloud** Supabase project (not `supabase start`).

## Environment

| Variable | Source |
|----------|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project settings |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase API keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase API keys (server only) |
| `NEXT_PUBLIC_SITE_URL` | e.g. `http://localhost:3000` or production URL |
| `DISCORD_WEBHOOK_ANNOUNCEMENTS` | Discord channel webhook |
| `DISCORD_WEBHOOK_REMINDERS` | Optional reminders channel |
| `API_INGRESS_TOKEN` | Random 32-byte hex for API writes |
| `CRON_SECRET` | Vercel cron auth (can match ingress token) |

## OAuth redirect URLs (Supabase)

Add to **Authentication → URL Configuration**:

- `http://localhost:3000/auth/callback`
- `https://games.directaction.monster/auth/callback` (or your production host)

Discord OAuth redirect for the Discord app:

- `https://<project-ref>.supabase.co/auth/v1/callback`

## Adding a game or activity

Edit `lib/games/catalogue.ts` and redeploy. No database migration required.

## Discord webhooks

Create webhooks under Discord server → Integrations → Webhooks. Paste URLs into Vercel env vars. To rotate, update env and redeploy.

## Smart rules (server-enforced)

1. Start time: now + 15 minutes … now + 30 days  
2. Duration: 15–480 minutes  
3. Max players ≤ activity template (can only shrink)  
4. RSVP closes 5 minutes before start; no leave after start  
5. Creator auto-RSVP on create  
6. DB trigger sets `full` / `open` from RSVP count  
7. Overlap warning in UI only  
8. Creator can cancel anytime before start  
9. Creator leaving transfers host to earliest RSVP, or auto-cancels if empty  

## Deploy (Vercel)

- Root Directory: `games/`
- Framework: Next.js
- Node 22
- Custom domain: `games.directaction.monster` → CNAME `cname.vercel-dns.com`
- Cron: `vercel.json` runs `/api/cron/starting-soon` every 5 minutes and `/api/cron/mark-completed` daily at 03:00 UTC

## API

Public `GET /api/v1/games` and `GET /api/v1/games/:id`. Writes require session cookie or `Authorization: Bearer $API_INGRESS_TOKEN`.
