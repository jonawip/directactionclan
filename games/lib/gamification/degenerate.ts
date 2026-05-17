import type { MemberStats } from "@/lib/gamification/ranks";

export type DegenerateContext = {
  board: "joined" | "hosted";
  rank: number;
  totalOnBoard: number;
};

/** Irreverent subtitle for the leaderboard — rules first, then stable hash fallback. */
export function getDegenerateTitle(
  stats: MemberStats,
  userId: string,
  ctx: DegenerateContext,
): string {
  const { joined, hosted } = stats;
  const { board, rank } = ctx;

  if (joined === 0 && hosted === 0) {
    return "Lurker supreme";
  }

  if (board === "joined") {
    if (rank === 1) {
      return "Touch grass speedrun (WR: denied)";
    }
    if (joined >= 40) {
      return "Terminally in stack";
    }
    if (joined >= 20 && hosted < 2) {
      return "Professional plus-one";
    }
    if (hosted === 0 && joined >= 8) {
      return "Never hosts, always queues";
    }
    if (hosted >= 5 && joined < 3) {
      return "Alleged shot-caller";
    }
    if (joined === 1) {
      return "Sample size hero";
    }
    if (rank === 2) {
      return "Second monitor main";
    }
    if (rank === 3) {
      return "Bronze mentality, gold attendance";
    }
  }

  if (board === "hosted") {
    if (rank === 1) {
      return "Discord event warlord";
    }
    if (hosted >= 15) {
      return "Calendar app in human form";
    }
    if (joined === 0 && hosted >= 3) {
      return "Empty lobby cosplayer";
    }
    if (hosted >= 5 && joined < 2) {
      return "Posts and ghosts";
    }
    if (hosted >= 1 && joined === 0) {
      return "Solo queue activist";
    }
    if (rank === 2) {
      return "Second fiddle, first calendar";
    }
    if (hosted === 1) {
      return "One (1) heroic post";
    }
  }

  const hostHeavy = hosted > 0 && joined / hosted < 0.5;
  const joinHeavy = joined > hosted * 4 && joined >= 5;

  if (hostHeavy && hosted >= 3) {
    return "Scheduler with a gaming problem";
  }
  if (joinHeavy) {
    return "RSVP goblin";
  }
  if (joined + hosted >= 25) {
    return "Both sides of the LFG";
  }

  return pickStable(userId, DEGENERATE_FALLBACKS);
}

const DEGENERATE_FALLBACKS = [
  "Chronically online",
  "Side quest enthusiast",
  "Queue theorist",
  "Patch notes reader",
  "Mic optional, vibes mandatory",
  "Emotionally available for raids",
  "Built different (derogatory)",
  "Grass is a social construct",
  "Sleep is soft CC",
  "Friendship ended with offline",
  "Ratio'd by daylight",
  "Main character in someone else's fireteam",
  "Loot goblin sympathiser",
  "One more game (liar)",
  "Discord notification addict",
] as const;

function pickStable(seed: string, options: readonly string[]): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 2147483647;
  }
  return options[hash % options.length] ?? options[0]!;
}
