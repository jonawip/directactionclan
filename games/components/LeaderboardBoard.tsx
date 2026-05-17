import Link from "next/link";
import { MemberRank } from "@/components/MemberRank";
import type { LeaderboardBoard as Board } from "@/lib/gamification/leaderboard";
import { uiCopy } from "@/lib/ui/copy";

type Props = {
  board: Board;
  metricLabel: string;
  metricKey: "joined" | "hosted";
};

export function LeaderboardBoard({ board, metricLabel, metricKey }: Props) {
  if (board.entries.length === 0) {
    return (
      <p className="text-[var(--fg-dim)]">{uiCopy.leaderboard.empty}</p>
    );
  }

  return (
    <ol className="leaderboard-list list-none m-0 p-0">
      {board.entries.map((entry, index) => {
        const count = entry.stats[metricKey];
        const profileHref = entry.profile.handle
          ? `/profile/${entry.profile.handle}`
          : null;

        return (
          <li key={entry.profile.id} className="leaderboard-row">
            <span className="leaderboard-rank" aria-hidden>
              {index + 1}
            </span>
            <span className="leaderboard-avatar" aria-hidden>
              {entry.profile.avatar_url ? (
                <img
                  src={entry.profile.avatar_url}
                  alt=""
                  width={40}
                  height={40}
                  className="rounded-full"
                />
              ) : (
                <span className="leaderboard-avatar-fallback">
                  {(entry.profile.display_name[0] ?? "?").toUpperCase()}
                </span>
              )}
            </span>
            <LeaderboardBody
              entry={entry}
              profileHref={profileHref}
              metricLabel={metricLabel}
              count={count}
            />
          </li>
        );
      })}
    </ol>
  );
}

function LeaderboardBody({
  entry,
  profileHref,
  metricLabel,
  count,
}: {
  entry: Board["entries"][number];
  profileHref: string | null;
  metricLabel: string;
  count: number;
}) {
  return (
    <div className="leaderboard-body">
      <div className="leaderboard-name-row">
        {profileHref ? (
          <Link href={profileHref} className="leaderboard-name">
            {entry.profile.display_name}
          </Link>
        ) : (
          <span className="leaderboard-name">{entry.profile.display_name}</span>
        )}
        <MemberRank stats={entry.stats} variant="compact" />
      </div>
      <p className="leaderboard-degenerate m-0">{entry.degenerateTitle}</p>
      <p className="leaderboard-metric m-0">
        {count} {metricLabel}
      </p>
    </div>
  );
}
