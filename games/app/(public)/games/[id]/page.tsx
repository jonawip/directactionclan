import Link from "next/link";
import { notFound } from "next/navigation";
import { CardHero } from "@/components/CardHero";
import { GameName } from "@/components/GameName";
import { LocalTime } from "@/components/LocalTime";
import { SlotGrid } from "@/components/SlotGrid";
import { getOptionalUser } from "@/lib/auth/require";
import { accentCssVar, findActivity, findGame } from "@/lib/games/catalogue";
import { fetchGameById, fetchUpcomingGames } from "@/lib/games/queries";
import { gamesOverlap } from "@/lib/games/rules";
import { renderSimpleMarkdown } from "@/lib/markdown";
import { createClient } from "@/lib/supabase/server";
import { statusLabel, uiCopy } from "@/lib/ui/copy";
import { GameActions } from "./GameActions";

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const user = await getOptionalUser();
  const game = await fetchGameById(supabase, id);

  if (!game) {
    notFound();
  }

  let timezone = "Europe/London";
  let userId: string | null = null;
  if (user) {
    userId = user.id;
    const { data: profile } = await supabase
      .from("profiles")
      .select("timezone")
      .eq("id", user.id)
      .single();
    if (profile?.timezone) {
      timezone = profile.timezone;
    }
  }

  const gameDef = findGame(game.game_slug);
  const activity = findActivity(game.game_slug, game.activity_slug);
  const isOwner = userId === game.created_by;
  const hasJoined = userId
    ? game.rsvps.some((r) => r.user_id === userId)
    : false;

  let conflictWarning: string | null = null;
  if (userId && hasJoined === false) {
    const myGames = await fetchUpcomingGames(supabase, {});
    const overlapping = myGames.filter(
      (g) =>
        g.id !== game.id &&
        g.rsvps.some((r) => r.user_id === userId) &&
        gamesOverlap(g, game),
    );
    if (overlapping.length > 0) {
      conflictWarning = uiCopy.detail.scheduleConflict(overlapping.length);
    }
  }

  const otherRsvps = game.rsvps.filter((r) => r.user_id !== game.created_by);
  const canEditCore = otherRsvps.length === 0;

  const accent = gameDef?.accent ?? "acid";
  const heroSrc = activity?.heroSrc;

  return (
    <article>
      {heroSrc ? (
        <CardHero src={heroSrc} accent={accent} variant="detail" />
      ) : (
        <div
          className="card-accent mb-4"
          style={{ background: accentCssVar(accent) }}
          aria-hidden
        />
      )}
      <header className="page-header">
        <p className="text-[var(--fg-dim)] text-lg flex flex-wrap items-center gap-x-2 gap-y-1">
          {gameDef && <GameName gameSlug={game.game_slug} size={22} />}
          {activity && (
            <>
              <span aria-hidden>·</span>
              <span>{activity.name}</span>
            </>
          )}
        </p>
        <h1 className="font-display text-3xl m-0 mt-3">
          {game.title}
        </h1>
        <p className="m-0 mt-4">
          <LocalTime iso={game.starts_at} timezone={timezone} />
        </p>
        <p className="text-sm text-[var(--fg-dim)] m-0 mt-3">
          {uiCopy.detail.hostedBy}{" "}
          {game.creator.handle ? (
            <Link href={`/profile/${game.creator.handle}`}>
              @{game.creator.handle}
            </Link>
          ) : (
            game.creator.display_name
          )}{" "}
          · {uiCopy.detail.duration(game.duration_minutes)} ·{" "}
          {uiCopy.detail.status(statusLabel(game.status))}
        </p>
      </header>

      {conflictWarning && (
        <p
          role="status"
          className="detail-section border border-[var(--pink)] text-[var(--pink)] p-4"
        >
          {conflictWarning}
        </p>
      )}

      {game.status === "cancelled" && game.cancelled_reason && (
        <p className="detail-section text-[var(--fg-faint)]">
          {uiCopy.detail.cancelled(game.cancelled_reason)}
        </p>
      )}

      {game.description && (
        <MarkdownBlock
          className="detail-section text-[var(--fg-dim)]"
          html={renderSimpleMarkdown(game.description)}
        />
      )}

      <section className="detail-section">
        <h2 className="font-label text-xl">{uiCopy.detail.players}</h2>
        <SlotGrid maxPlayers={game.max_players} rsvps={game.rsvps} />
      </section>

      <GameActions
        gameId={game.id}
        isOwner={isOwner}
        hasJoined={hasJoined}
        status={game.status}
        isAuthed={!!userId}
        canEditCore={canEditCore}
      />
    </article>
  );
}

function MarkdownBlock({
  className,
  html,
}: {
  className?: string;
  html: string;
}) {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
