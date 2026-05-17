import Link from "next/link";
import { GameCard } from "@/components/GameCard";
import { uiCopy } from "@/lib/ui/copy";
import type { GameWithRsvps } from "@/types/domain";

type Props = {
  games: GameWithRsvps[];
  viewerTimezone: string;
};

export function GameFeed({ games, viewerTimezone }: Props) {
  if (games.length === 0) {
    return (
      <section className="empty-state border border-dashed border-[var(--line)] text-center">
        <p className="font-display text-2xl text-[var(--fg-dim)] m-0">
          {uiCopy.feed.emptyTitle}
        </p>
        <p className="text-[var(--fg-dim)] m-0">{uiCopy.feed.emptyBody}</p>
        <Link href="/games/new" className="btn btn-primary">
          {uiCopy.nav.postGame}
        </Link>
      </section>
    );
  }

  return (
    <section className="game-feed" aria-label={uiCopy.feed.listLabel}>
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          viewerTimezone={viewerTimezone}
        />
      ))}
    </section>
  );
}
