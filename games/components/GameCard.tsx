import Link from "next/link";
import { CardHero } from "@/components/CardHero";
import { accentCssVar, findActivity, findGame } from "@/lib/games/catalogue";
import { GameName } from "@/components/GameName";
import { LocalTime } from "@/components/LocalTime";
import { SlotGrid } from "@/components/SlotGrid";
import { statusLabel, uiCopy } from "@/lib/ui/copy";
import type { GameWithRsvps } from "@/types/domain";

type Props = {
  game: GameWithRsvps;
  viewerTimezone: string;
};

function statusClass(status: string): string {
  switch (status) {
    case "open":
      return "status-open";
    case "full":
      return "status-full";
    case "cancelled":
      return "status-cancelled";
    default:
      return "";
  }
}

export function GameCard({ game, viewerTimezone }: Props) {
  const gameDef = findGame(game.game_slug);
  const activity = findActivity(game.game_slug, game.activity_slug);
  const accent = gameDef?.accent ?? "acid";
  const heroSrc = activity?.heroSrc;
  const titleId = `session-${game.id}-title`;

  return (
    <article className="session-card card">
      <Link
        href={`/games/${game.id}`}
        className="session-card-link"
        aria-labelledby={titleId}
      >
        {heroSrc ? (
          <CardHero src={heroSrc} accent={accent} />
        ) : (
          <AccentBar colour={accentCssVar(accent)} />
        )}

        <div className="session-card-body">
          <h2 id={titleId} className="session-card-title font-display">
            {game.title}
          </h2>

          <p className="session-card-schedule">
            <span className="session-card-label font-label">
              {uiCopy.sessionCard.starts}
            </span>
            <LocalTime
              iso={game.starts_at}
              timezone={viewerTimezone}
              variant="inline"
            />
          </p>

          <div className="session-card-meta-row">
            <p className="session-card-game-meta">
              {gameDef && <GameName gameSlug={game.game_slug} size={18} />}
              {activity && (
                <>
                  <span aria-hidden className="session-card-meta-sep">
                    ·
                  </span>
                  <span>{activity.name}</span>
                </>
              )}
            </p>
            <span
              className={`status-pill session-card-status ${statusClass(game.status)}`}
            >
              {statusLabel(game.status)}
            </span>
          </div>

          <p className="session-card-host">
            {uiCopy.sessionCard.hostedBy}{" "}
            <span className="session-card-host-name">
              {game.creator.handle
                ? `@${game.creator.handle}`
                : game.creator.display_name}
            </span>
          </p>

          <div className="session-card-crew">
            <SlotGrid
              maxPlayers={game.max_players}
              rsvps={game.rsvps}
              variant="card"
            />
          </div>
        </div>
      </Link>
    </article>
  );
}

function AccentBar({ colour }: { colour: string }) {
  return (
    <div
      className="card-accent"
      style={{ background: colour }}
      aria-hidden
    />
  );
}
