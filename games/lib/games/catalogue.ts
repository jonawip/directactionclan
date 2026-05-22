import type { AccentColour } from "@/types/domain";
import { d2HeroForActivity } from "@/lib/games/d2-assets";

export type ActivityTemplate = {
  slug: string;
  name: string;
  defaultMaxPlayers: number;
  heroSrc: string;
  description?: string;
};

export type GameDefinition = {
  slug: string;
  name: string;
  iconSrc: string;
  accent: AccentColour;
  activities: ActivityTemplate[];
};

const ICON_BASE = "/images/icons";
const HERO_BASE = "/images/games";

export const GAMES: GameDefinition[] = [
  {
    slug: "marathon",
    name: "Marathon",
    iconSrc: `${ICON_BASE}/Marathon_Logo.svg`,
    accent: "acid",
    activities: [
      {
        slug: "marathon-trio",
        name: "Trios",
        defaultMaxPlayers: 3,
        heroSrc: `${HERO_BASE}/marathon-trios.png`,
      },
      {
        slug: "marathon-duo",
        name: "Duos",
        defaultMaxPlayers: 2,
        heroSrc: `${HERO_BASE}/marathon-duos.png`,
      },
    ],
  },
  {
    slug: "destiny2",
    name: "Destiny 2",
    iconSrc: `${ICON_BASE}/destiny2.svg`,
    accent: "pink",
    activities: [
      {
        slug: "d2-raid",
        name: "Raid",
        defaultMaxPlayers: 6,
        heroSrc: d2HeroForActivity("d2-raid")!,
        description:
          "Six-player. Name the raid in the title (e.g. The Desert Perpetual, Salvation's Edge, King's Fall, Vault of Glass, Last Wish).",
      },
      {
        slug: "d2-dungeon",
        name: "Dungeon",
        defaultMaxPlayers: 3,
        heroSrc: d2HeroForActivity("d2-dungeon")!,
        description:
          "Three-player. Sundered Doctrine, Equilibrium, Vesper's Host, Warlord's Ruin, and the rest of the catalogue.",
      },
      {
        slug: "d2-pantheon",
        name: "Pantheon",
        defaultMaxPlayers: 3,
        heroSrc: d2HeroForActivity("d2-pantheon")!,
        description:
          "Pantheon 2.0 boss rush. First slates from 9 June; full gauntlet from 13 June; featured rotations from 16 June.",
      },
      {
        slug: "d2-monument",
        name: "Monument of Triumph",
        defaultMaxPlayers: 3,
        heroSrc: d2HeroForActivity("d2-monument")!,
        description:
          "Monument of Triumph week: Sparrow Racing League, Solstice, Legendary Marks, Director tour, or other launch activities.",
      },
    ],
  },
  {
    slug: "arc-raiders",
    name: "Arc Raiders",
    iconSrc: `${ICON_BASE}/arc_raiders_logo.png`,
    accent: "cyan",
    activities: [
      {
        slug: "arc-trio",
        name: "Raid",
        defaultMaxPlayers: 3,
        heroSrc: `${HERO_BASE}/arc-raid.png`,
      },
    ],
  },
  {
    slug: "slay-the-spire-2",
    name: "Slay the Spire 2",
    iconSrc: `${ICON_BASE}/slay-the-spire-2.ico`,
    accent: "acid",
    activities: [
      {
        slug: "sts2-coop",
        name: "Co-op climb",
        defaultMaxPlayers: 4,
        heroSrc: `${HERO_BASE}/slay-the-spire.png`,
      },
    ],
  },
  {
    slug: "friendslop",
    name: "Friendslop (casual)",
    iconSrc: `${ICON_BASE}/friendslop.svg`,
    accent: "pink",
    activities: [
      {
        slug: "friendslop-any",
        name: "Whatever's on",
        defaultMaxPlayers: 8,
        heroSrc: `${HERO_BASE}/friendslop.png`,
      },
    ],
  },
];

export function findGame(gameSlug: string) {
  return GAMES.find((g) => g.slug === gameSlug);
}

export function findActivity(gameSlug: string, activitySlug: string) {
  const game = findGame(gameSlug);
  return game?.activities.find((a) => a.slug === activitySlug);
}

export function accentCssVar(accent: AccentColour): string {
  const map: Record<AccentColour, string> = {
    acid: "var(--acid)",
    pink: "var(--pink)",
    cyan: "var(--cyan)",
  };
  return map[accent];
}
