const D2_BASE = "/images/games/d2";

export const d2ActivityHero: Record<string, string> = {
  "d2-raid": `${D2_BASE}/raid.svg`,
  "d2-dungeon": `${D2_BASE}/engram.svg`,
  "d2-nightfall": `${D2_BASE}/ammo-heavy.svg`,
  "d2-strike": `${D2_BASE}/ghost.svg`,
  "d2-exotic": `${D2_BASE}/engram.svg`,
  "d2-trials": `${D2_BASE}/damage-arc.svg`,
};

export function d2HeroForActivity(slug: string): string | undefined {
  return d2ActivityHero[slug];
}
