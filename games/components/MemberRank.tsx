import { accentCssVar } from "@/lib/games/catalogue";
import {
  resolveMemberRanks,
  type MemberStats,
  type ResolvedMemberRanks,
} from "@/lib/gamification/ranks";
import type { AccentColour } from "@/types/domain";
import { uiCopy } from "@/lib/ui/copy";

type Props = {
  stats: MemberStats;
  variant?: "compact" | "card";
};

export function MemberRank({ stats, variant = "compact" }: Props) {
  const ranks = resolveMemberRanks(stats);

  if (variant === "compact") {
    return <MemberRankCompact ranks={ranks} />;
  }

  return <MemberRankCard ranks={ranks} />;
}

function MemberRankCompact({ ranks }: { ranks: ResolvedMemberRanks }) {
  return (
    <span className="member-rank member-rank--compact">
      <RankBadge
        label={ranks.participation.title}
        accent={ranks.participation.accent}
      />
      {ranks.host && (
        <RankBadge label={ranks.host.title} accent={ranks.host.accent} host />
      )}
    </span>
  );
}

function MemberRankCard({ ranks }: { ranks: ResolvedMemberRanks }) {
  const { stats, participation, host, sessionsToNext, nextParticipation } =
    ranks;

  return (
    <section
      className="member-rank-card"
      aria-label={uiCopy.ranks.cardLabel(participation.title)}
    >
      <RankHeader participation={participation} host={host} />
      <p className="member-rank-tagline m-0 text-[var(--fg-dim)]">
        {participation.tagline}
      </p>
      <dl className="member-rank-stats">
        <div>
          <dt>{uiCopy.ranks.joined}</dt>
          <dd>{stats.joined}</dd>
        </div>
        <div>
          <dt>{uiCopy.ranks.hosted}</dt>
          <dd>
            {stats.hosted}
            {host ? (
              <span className="member-rank-host-note"> · {host.title}</span>
            ) : null}
          </dd>
        </div>
      </dl>
      {sessionsToNext !== null && nextParticipation && (
        <p className="member-rank-progress m-0 text-sm text-[var(--fg-faint)]">
          {uiCopy.ranks.progress(sessionsToNext, nextParticipation.title)}
        </p>
      )}
    </section>
  );
}

function RankHeader({
  participation,
  host,
}: {
  participation: ResolvedMemberRanks["participation"];
  host: ResolvedMemberRanks["host"];
}) {
  return (
    <div className="member-rank-card-header">
      <RankBadge label={participation.title} accent={participation.accent} />
      {host && <RankBadge label={host.title} accent={host.accent} host />}
    </div>
  );
}

function RankBadge({
  label,
  accent,
  host = false,
}: {
  label: string;
  accent: AccentColour;
  host?: boolean;
}) {
  return (
    <span
      className={`rank-badge${host ? " rank-badge--host" : ""}`}
      style={{ ["--rank-accent" as string]: accentCssVar(accent) }}
    >
      {label}
    </span>
  );
}
