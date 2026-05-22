/** Activity slugs for games.directaction.monster — keep in sync with games/lib/games/catalogue.ts */
export const D2_ACTIVITY_SLUGS = [
  'd2-raid',
  'd2-dungeon',
  'd2-pantheon',
  'd2-monument'
] as const;

export const D2_ACTIVITY_LABELS: Record<string, string> = {
  'd2-raid': 'Raid',
  'd2-dungeon': 'Dungeon',
  'd2-pantheon': 'Pantheon',
  'd2-monument': 'Monument of Triumph',
  'd2-nightfall': 'Grandmaster Nightfall',
  'd2-strike': 'Strike',
  'd2-exotic': 'Exotic Quest',
  'd2-trials': 'Trials'
};
