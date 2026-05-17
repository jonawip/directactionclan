import type { AccentColour } from "@/types/domain";

export type MemberStats = {
  joined: number;
  hosted: number;
};

export type ParticipationRank = {
  id: string;
  title: string;
  tagline: string;
  minJoined: number;
  accent: AccentColour;
};

export type HostRank = {
  id: string;
  title: string;
  minHosted: number;
  accent: AccentColour;
};

export const PARTICIPATION_RANKS: ParticipationRank[] = [
  {
    id: "boot",
    title: "Boot",
    tagline: "New to the roster",
    minJoined: 0,
    accent: "cyan",
  },
  {
    id: "operative",
    title: "Operative",
    tagline: "On the board",
    minJoined: 1,
    accent: "cyan",
  },
  {
    id: "fireteam",
    title: "Fireteam",
    tagline: "Shows up consistently",
    minJoined: 3,
    accent: "acid",
  },
  {
    id: "veteran",
    title: "Veteran",
    tagline: "Reliable crew",
    minJoined: 8,
    accent: "pink",
  },
  {
    id: "hardline",
    title: "Hardline",
    tagline: "Always in the stack",
    minJoined: 20,
    accent: "acid",
  },
  {
    id: "direct-action",
    title: "Direct Action",
    tagline: "Clan backbone",
    minJoined: 40,
    accent: "pink",
  },
];

export const HOST_RANKS: HostRank[] = [
  { id: "caller", title: "Caller", minHosted: 1, accent: "cyan" },
  { id: "mission-lead", title: "Mission lead", minHosted: 5, accent: "acid" },
  { id: "ops-coordinator", title: "Ops coordinator", minHosted: 15, accent: "pink" },
];

export function getParticipationRank(joined: number): ParticipationRank {
  let current = PARTICIPATION_RANKS[0]!;
  for (const rank of PARTICIPATION_RANKS) {
    if (joined >= rank.minJoined) {
      current = rank;
    }
  }
  return current;
}

export function getHostRank(hosted: number): HostRank | null {
  let current: HostRank | null = null;
  for (const rank of HOST_RANKS) {
    if (hosted >= rank.minHosted) {
      current = rank;
    }
  }
  return current;
}

export function getNextParticipationRank(
  joined: number,
): ParticipationRank | null {
  const current = getParticipationRank(joined);
  const idx = PARTICIPATION_RANKS.findIndex((r) => r.id === current.id);
  return PARTICIPATION_RANKS[idx + 1] ?? null;
}

export function sessionsUntilNextRank(joined: number): number | null {
  const next = getNextParticipationRank(joined);
  if (!next) {
    return null;
  }
  return Math.max(0, next.minJoined - joined);
}

export type ResolvedMemberRanks = {
  stats: MemberStats;
  participation: ParticipationRank;
  host: HostRank | null;
  nextParticipation: ParticipationRank | null;
  sessionsToNext: number | null;
};

export function resolveMemberRanks(stats: MemberStats): ResolvedMemberRanks {
  return {
    stats,
    participation: getParticipationRank(stats.joined),
    host: getHostRank(stats.hosted),
    nextParticipation: getNextParticipationRank(stats.joined),
    sessionsToNext: sessionsUntilNextRank(stats.joined),
  };
}
