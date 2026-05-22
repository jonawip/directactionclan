import { GAMES_SITE_URL } from '../constants.ts';
import staticWeek from '../data/goodbye-d2-week.json';
import { D2_ACTIVITY_LABELS } from '../data/d2-activities.ts';
import { getD2ActivityIconSrc } from './d2-assets.ts';
import {
  GOODBYE_D2_TAKEOVER_END_EXCLUSIVE,
  GOODBYE_D2_TAKEOVER_START
} from './goodbye-d2.ts';

export type D2WeekSession = {
  id: string;
  title: string;
  startsAt: string;
  maxPlayers: number;
  activitySlug: string;
  activityLabel: string;
  iconSrc: string;
  hostName: string;
  hostAvatarUrl: string | null;
  spotsTaken: number;
  url: string;
};

type ApiGame = {
  id: string;
  title: string;
  starts_at: string;
  max_players: number;
  activity_slug: string;
  creator?: {
    display_name?: string;
    avatar_url?: string | null;
  };
  rsvps?: unknown[];
};

function mapApiGame(row: ApiGame): D2WeekSession {
  const taken = Array.isArray(row.rsvps) ? row.rsvps.length : 0;
  return {
    id: row.id,
    title: row.title,
    startsAt: row.starts_at,
    maxPlayers: row.max_players,
    activitySlug: row.activity_slug,
    activityLabel: D2_ACTIVITY_LABELS[row.activity_slug] ?? row.activity_slug,
    iconSrc: getD2ActivityIconSrc(row.activity_slug),
    hostName: row.creator?.display_name ?? 'Unknown',
    hostAvatarUrl: row.creator?.avatar_url ?? null,
    spotsTaken: taken,
    url: `${GAMES_SITE_URL}/games/${row.id}`
  };
}

function mapStatic(row: (typeof staticWeek.sessions)[number]): D2WeekSession {
  return {
    id: row.id,
    title: row.title,
    startsAt: row.startsAt,
    maxPlayers: row.maxPlayers,
    activitySlug: row.activitySlug,
    activityLabel: D2_ACTIVITY_LABELS[row.activitySlug] ?? row.activitySlug,
    iconSrc: getD2ActivityIconSrc(row.activitySlug),
    hostName: row.hostName,
    hostAvatarUrl: row.hostAvatarUrl,
    spotsTaken: row.spotsTaken,
    url: row.url
  };
}

const CACHE_TTL_MS = 5 * 60 * 1000;
let sessionCache: { fetchedAt: number; sessions: D2WeekSession[] } | null = null;

export async function fetchD2WeekSessions(): Promise<D2WeekSession[]> {
  if (sessionCache && Date.now() - sessionCache.fetchedAt < CACHE_TTL_MS) {
    return sessionCache.sessions;
  }

  const at = new Date();
  const oneHourAgo = new Date(at.getTime() - 60 * 60 * 1000);
  const fromMs = Math.max(oneHourAgo.getTime(), GOODBYE_D2_TAKEOVER_START.getTime());
  const from = new Date(fromMs).toISOString();
  const to = GOODBYE_D2_TAKEOVER_END_EXCLUSIVE.toISOString();
  const url = new URL('/api/v1/games', GAMES_SITE_URL);
  url.searchParams.set('game', 'destiny2');
  url.searchParams.set('from', from);
  url.searchParams.set('to', to);

  try {
    const res = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) {
      const fallback = staticWeek.sessions.map(mapStatic);
      sessionCache = { fetchedAt: Date.now(), sessions: fallback };
      return fallback;
    }
    const body = (await res.json()) as { games?: ApiGame[] };
    const games = body.games ?? [];
    const sessions =
      games.length === 0 ? staticWeek.sessions.map(mapStatic) : games.map(mapApiGame);
    sessionCache = { fetchedAt: Date.now(), sessions };
    return sessions;
  } catch {
    const fallback = staticWeek.sessions.map(mapStatic);
    sessionCache = { fetchedAt: Date.now(), sessions: fallback };
    return fallback;
  }
}
