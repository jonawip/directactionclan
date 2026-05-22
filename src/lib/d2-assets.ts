export const D2_ICON_BASE = '/goodbye-d2/icons';

export const d2Icons = {
  destiny2: `${D2_ICON_BASE}/destiny2.svg`,
  titan: `${D2_ICON_BASE}/class-titan.svg`,
  hunter: `${D2_ICON_BASE}/class-hunter.svg`,
  warlock: `${D2_ICON_BASE}/class-warlock.svg`,
  raid: `${D2_ICON_BASE}/raid.svg`,
  ghost: `${D2_ICON_BASE}/ghost.svg`,
  engram: `${D2_ICON_BASE}/engram.svg`,
  damageArc: `${D2_ICON_BASE}/damage-arc.svg`,
  damageSolar: `${D2_ICON_BASE}/damage-solar.svg`,
  damageVoid: `${D2_ICON_BASE}/damage-void.svg`,
  ammoHeavy: `${D2_ICON_BASE}/ammo-heavy.svg`,
  ammoSpecial: `${D2_ICON_BASE}/ammo-special.svg`
} as const;

export type D2IconKey = keyof typeof d2Icons;

export const d2ClassIcon: Record<'Titan' | 'Hunter' | 'Warlock', string> = {
  Titan: d2Icons.titan,
  Hunter: d2Icons.hunter,
  Warlock: d2Icons.warlock
};

export const d2ActivityIcon: Record<string, D2IconKey> = {
  'd2-raid': 'raid',
  'd2-dungeon': 'engram',
  'd2-pantheon': 'raid',
  'd2-monument': 'damageSolar',
  'd2-nightfall': 'ammoHeavy',
  'd2-strike': 'ghost',
  'd2-exotic': 'engram',
  'd2-trials': 'damageArc'
};

export function getD2ActivityIconSrc(activitySlug: string): string {
  const key = d2ActivityIcon[activitySlug];
  return key ? d2Icons[key] : d2Icons.ghost;
}

export function isD2ColorIcon(src: string): boolean {
  return src.includes('damage-') || src.includes('ammo-');
}
