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

## Staying signed in

Sessions use HTTP-only cookies (default **30 days**). Middleware refreshes the access token on each visit; `SessionKeeper` refreshes when you return to the tab.

In **Supabase → Authentication → Sessions**, set **refresh token lifetime** to at least **30 days** (or match `SESSION_COOKIE_MAX_AGE` in Vercel). If the dashboard lifetime is shorter than the cookie, users will still be signed out when the refresh token expires.

Discord OAuth redirect for the Discord app:

- `https://<project-ref>.supabase.co/auth/v1/callback`

## Adding a game or activity

Edit `lib/games/catalogue.ts` and redeploy. No database migration required.

## Ranks and titles

Member ranks are computed from participation (no extra database tables):

- **Participation** — count of RSVPs on non-cancelled games (`Boot` → `Direct Action`).
- **Hosting** — optional host titles from games posted (`Caller`, `Mission lead`, `Ops coordinator`).

Tier thresholds live in `lib/gamification/ranks.ts`. Ranks appear on profiles, game detail (host + crew), and the rank ladder on your own profile. **`/leaderboard`** shows top joiners and hosts with degenerate subtitles from `lib/gamification/degenerate.ts`.

Auth is **Discord and Google only** (no Apple Sign-In).

## Discord webhooks

Create webhooks under Discord server → Integrations → Webhooks. Paste URLs into Vercel env vars. To rotate, update env and redeploy.

Announcements embed the activity hero image and session notes (when provided). Images must be reachable at your public `NEXT_PUBLIC_SITE_URL` (Discord cannot load `localhost`).

**Reminders channel** (`DISCORD_WEBHOOK_REMINDERS`): optional separate webhook. The `/api/cron/starting-soon` job (every 5 minutes) posts once per game at **60**, **30**, and **5 minutes** before `starts_at` for open/full sessions. Each embed includes crew status (spots left or “Run is full”). Reminders are deduped in `webhook_log` per game per offset.

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
- Cron: `vercel.json` runs `/api/cron/starting-soon` every 5 minutes (60m, 30m, and 5m Discord reminders) and `/api/cron/mark-completed` daily at 03:00 UTC

## API

Public `GET /api/v1/games` and `GET /api/v1/games/:id`. Writes require session cookie or `Authorization: Bearer $API_INGRESS_TOKEN`.
