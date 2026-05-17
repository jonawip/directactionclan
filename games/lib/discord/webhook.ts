import { getAdminClient } from "@/lib/supabase/admin";
import { discordTimestamp } from "@/lib/time/format";
import { findActivity, findGame } from "@/lib/games/catalogue";
import type { GameRow, ProfileRow, WebhookEvent } from "@/types/domain";
import type { Json } from "@/types/db";

export type DiscordEmbed = {
  title: string;
  url?: string;
  description?: string;
  color?: number;
  fields?: { name: string; value: string; inline?: boolean }[];
  image?: { url: string };
  thumbnail?: { url: string };
  timestamp?: string;
  footer?: { text: string };
};

const EMBED_DESCRIPTION_MAX = 4096;
const NOTES_MAX = 900;

const COLOURS = {
  acid: 0xd4ff1a,
  pink: 0xff2d6f,
  cyan: 0x00e5ff,
  muted: 0x4a473e,
} as const;

function siteBaseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

function absoluteAssetUrl(path: string): string {
  return `${siteBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

function truncate(text: string, max: number): string {
  if (text.length <= max) {
    return text;
  }
  return `${text.slice(0, max - 1)}…`;
}

function heroImageForGame(game: GameRow): { url: string } | undefined {
  const activity = findActivity(game.game_slug, game.activity_slug);
  if (!activity?.heroSrc) {
    return undefined;
  }
  return { url: absoluteAssetUrl(activity.heroSrc) };
}

function gameContextLine(game: GameRow): string {
  const gameDef = findGame(game.game_slug);
  const activity = findActivity(game.game_slug, game.activity_slug);
  return `**${gameDef?.name ?? game.game_slug}** · ${activity?.name ?? game.activity_slug}`;
}

/** Notes + game/activity line for embed description (Discord markdown). */
function embedDescription(
  game: GameRow,
  options?: { lead?: string; includeNotes?: boolean },
): string {
  const parts: string[] = [];
  if (options?.lead) {
    parts.push(options.lead);
  }
  parts.push(gameContextLine(game));
  if (options?.includeNotes !== false && game.description?.trim()) {
    parts.push("");
    parts.push(truncate(game.description.trim(), NOTES_MAX));
  }
  return truncate(parts.join("\n"), EMBED_DESCRIPTION_MAX);
}

function withHeroImage(embed: DiscordEmbed, game: GameRow): DiscordEmbed {
  const image = heroImageForGame(game);
  return image ? { ...embed, image } : embed;
}

function webhookUrl(channel: "announcements" | "reminders"): string | undefined {
  if (channel === "announcements") {
    return process.env.DISCORD_WEBHOOK_ANNOUNCEMENTS;
  }
  return process.env.DISCORD_WEBHOOK_REMINDERS;
}

export async function postDiscord(
  channel: "announcements" | "reminders",
  embed: DiscordEmbed,
): Promise<{ ok: boolean; error?: string }> {
  const url = webhookUrl(channel);
  if (!url) {
    return { ok: false, error: "Webhook URL not configured" };
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ embeds: [embed] }),
  });

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: text || res.statusText };
  }
  return { ok: true };
}

const ONE_SHOT_WEBHOOK_EVENTS: WebhookEvent[] = [
  "game.created",
  "game.full",
  "game.cancelled",
  "game.reminder_60m",
  "game.reminder_30m",
];

const REMINDER_EVENTS: WebhookEvent[] = [
  "game.reminder_60m",
  "game.reminder_30m",
];

function isReminderEvent(event: WebhookEvent): boolean {
  return REMINDER_EVENTS.includes(event);
}

function reminderCopy(event: WebhookEvent): {
  lead: string;
  titleSuffix: string;
} {
  switch (event) {
    case "game.reminder_60m":
      return {
        lead: "Starts in about **1 hour**.",
        titleSuffix: "1 hour",
      };
    case "game.reminder_30m":
      return {
        lead: "Starts in about **30 minutes**.",
        titleSuffix: "30 minutes",
      };
    default:
      return { lead: "Starting soon.", titleSuffix: "soon" };
  }
}

function slotsLabel(open: number): string {
  if (open <= 0) {
    return "No spots left";
  }
  if (open === 1) {
    return "1 spot left";
  }
  return `${open} spots left`;
}

function playerLabel(
  player: Pick<ProfileRow, "display_name" | "handle">,
): string {
  return player.handle ? `@${player.handle}` : player.display_name;
}

export async function dispatchGameWebhook(
  event: WebhookEvent,
  game: GameRow,
  host: Pick<ProfileRow, "display_name" | "handle">,
  extra?: {
    openSlots?: number;
    player?: Pick<ProfileRow, "display_name" | "handle">;
  },
): Promise<void> {
  const admin = getAdminClient();
  if (!admin) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "[webhook] Skipped %s for game %s: set SUPABASE_SERVICE_ROLE_KEY to enable webhook_log and Discord delivery",
        event,
        game.id,
      );
    }
    return;
  }

  const gameUrl = `${siteBaseUrl()}/games/${game.id}`;

  if (event === "game.player_joined" && !extra?.player) {
    return;
  }

  if (ONE_SHOT_WEBHOOK_EVENTS.includes(event)) {
    const { data: existing } = await admin
      .from("webhook_log")
      .select("id")
      .eq("event", event)
      .eq("game_id", game.id)
      .not("delivered_at", "is", null)
      .maybeSingle();

    if (existing) {
      return;
    }
  }

  const payload: Json = {
    event,
    gameId: game.id,
    ...(extra?.player?.handle
      ? { playerHandle: extra.player.handle }
      : { playerName: extra?.player?.display_name }),
  };
  const { data: logRow, error: logErr } = await admin
    .from("webhook_log")
    .insert({ event, game_id: game.id, payload })
    .select("id")
    .single();

  if (logErr || !logRow) {
    return;
  }

  const gameDef = findGame(game.game_slug);
  const activity = findActivity(game.game_slug, game.activity_slug);
  const accent = gameDef?.accent ?? "acid";
  const colour = COLOURS[accent];

  let embed: DiscordEmbed;

  switch (event) {
    case "game.created":
      embed = withHeroImage(
        {
          title: `New run: ${game.title}`,
          url: gameUrl,
          color: colour,
          description: embedDescription(game),
          fields: [
            {
              name: "Host",
              value: host.handle ? `@${host.handle}` : host.display_name,
            },
            {
              name: "Starts",
              value: discordTimestamp(game.starts_at),
            },
            {
              name: "Slots",
              value: `${extra?.openSlots ?? game.max_players} open`,
              inline: true,
            },
          ],
          footer: { text: "Direct Action Games" },
          timestamp: new Date().toISOString(),
        },
        game,
      );
      break;
    case "game.player_joined": {
      const joiner = extra?.player as Pick<
        ProfileRow,
        "display_name" | "handle"
      >;
      const openSlots = extra?.openSlots ?? 0;
      embed = withHeroImage(
        {
          title: `${playerLabel(joiner)} joined`,
          url: gameUrl,
          color: colour,
          description: embedDescription(game, { includeNotes: false }),
          fields: [
            { name: "Session", value: game.title },
            {
              name: "Spots left",
              value: slotsLabel(openSlots),
              inline: true,
            },
            {
              name: "Starts",
              value: discordTimestamp(game.starts_at),
              inline: true,
            },
            {
              name: "Host",
              value: host.handle ? `@${host.handle}` : host.display_name,
            },
          ],
          footer: { text: "Direct Action Games" },
          timestamp: new Date().toISOString(),
        },
        game,
      );
      break;
    }
    case "game.full":
      embed = withHeroImage(
        {
          title: "Crew assembled",
          url: gameUrl,
          color: colour,
          description: embedDescription(game, {
            lead: `**${game.title}** is full.`,
          }),
          fields: [
            { name: "Starts", value: discordTimestamp(game.starts_at) },
            {
              name: "Host",
              value: host.handle ? `@${host.handle}` : host.display_name,
              inline: true,
            },
          ],
          footer: { text: "Direct Action Games" },
        },
        game,
      );
      break;
    case "game.cancelled": {
      const reason = game.cancelled_reason?.trim();
      embed = withHeroImage(
        {
          title: "Run cancelled",
          url: gameUrl,
          color: COLOURS.muted,
          description: embedDescription(game, {
            lead: reason ? `**Reason:** ${reason}` : undefined,
          }),
          fields: [{ name: "Session", value: game.title }],
          footer: { text: "Direct Action Games" },
        },
        game,
      );
      break;
    }
    case "game.reminder_60m":
    case "game.reminder_30m": {
      const { lead, titleSuffix } = reminderCopy(event);
      embed = withHeroImage(
        {
          title: `Starting in ${titleSuffix} · ${game.title}`,
          url: gameUrl,
          color: colour,
          description: embedDescription(game, { lead }),
          fields: [
            { name: "Starts", value: discordTimestamp(game.starts_at) },
            {
              name: "Host",
              value: host.handle ? `@${host.handle}` : host.display_name,
              inline: true,
            },
          ],
          footer: { text: "Direct Action Games · reminders" },
        },
        game,
      );
      break;
    }
    default:
      return;
  }

  const channel = isReminderEvent(event) ? "reminders" : "announcements";
  const result = await postDiscord(channel, embed);

  await admin
    .from("webhook_log")
    .update({
      delivered_at: result.ok ? new Date().toISOString() : null,
      error: result.error ?? null,
    })
    .eq("id", logRow.id);
}
