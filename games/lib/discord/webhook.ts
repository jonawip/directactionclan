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
  timestamp?: string;
  footer?: { text: string };
};

const COLOURS = {
  acid: 0xd4ff1a,
  pink: 0xff2d6f,
  cyan: 0x00e5ff,
  muted: 0x4a473e,
} as const;

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

export async function dispatchGameWebhook(
  event: WebhookEvent,
  game: GameRow,
  host: Pick<ProfileRow, "display_name" | "handle">,
  extra?: { openSlots?: number },
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const gameUrl = `${siteUrl}/games/${game.id}`;

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

  const payload: Json = { event, gameId: game.id };
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
      embed = {
        title: `New run: ${game.title}`,
        url: gameUrl,
        color: colour,
        description: `${gameDef?.name ?? game.game_slug} · ${activity?.name ?? game.activity_slug}`,
        fields: [
          { name: "Host", value: host.handle ? `@${host.handle}` : host.display_name },
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
      };
      break;
    case "game.full":
      embed = {
        title: "Crew assembled",
        url: gameUrl,
        color: colour,
        description: `${game.title} is full.`,
        fields: [
          { name: "Game", value: gameDef?.name ?? game.game_slug },
          { name: "Starts", value: discordTimestamp(game.starts_at) },
        ],
        footer: { text: "Direct Action Games" },
      };
      break;
    case "game.cancelled":
      embed = {
        title: "Run cancelled",
        url: gameUrl,
        color: COLOURS.muted,
        description: game.cancelled_reason ?? game.title,
        fields: [{ name: "Game", value: game.title }],
        footer: { text: "Direct Action Games" },
      };
      break;
    case "game.starting":
      embed = {
        title: "Starting soon",
        url: gameUrl,
        color: colour,
        description: game.title,
        fields: [
          { name: "Starts", value: discordTimestamp(game.starts_at) },
          { name: "Host", value: host.display_name },
        ],
        footer: { text: "Direct Action Games · reminders" },
      };
      break;
    default:
      return;
  }

  const channel =
    event === "game.starting" ? "reminders" : "announcements";
  const result = await postDiscord(channel, embed);

  await admin
    .from("webhook_log")
    .update({
      delivered_at: result.ok ? new Date().toISOString() : null,
      error: result.error ?? null,
    })
    .eq("id", logRow.id);
}
