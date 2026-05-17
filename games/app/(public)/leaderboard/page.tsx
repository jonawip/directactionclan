import type { Metadata } from "next";
import { LeaderboardBoard } from "@/components/LeaderboardBoard";
import { fetchLeaderboards } from "@/lib/gamification/leaderboard";
import { createClient } from "@/lib/supabase/server";
import { uiCopy } from "@/lib/ui/copy";

export const metadata: Metadata = {
  title: "Leaderboard · Direct Action Games",
  description: uiCopy.leaderboard.metaDescription,
};

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const { joined, hosted } = await fetchLeaderboards(supabase);

  return (
    <section>
      <header className="page-header">
        <h1 className="font-display text-3xl text-[var(--acid)] m-0">
          {uiCopy.leaderboard.title}
        </h1>
        <p className="text-[var(--fg-dim)] m-0 mt-3 max-w-xl">
          {uiCopy.leaderboard.subtitle}
        </p>
      </header>
      <hr className="barcode" />
      <LeaderboardGrid joined={joined} hosted={hosted} />
    </section>
  );
}

function LeaderboardGrid({
  joined,
  hosted,
}: {
  joined: Parameters<typeof LeaderboardBoard>[0]["board"];
  hosted: Parameters<typeof LeaderboardBoard>[0]["board"];
}) {
  return (
    <div className="leaderboard-grid">
      <section aria-labelledby="board-joined">
        <h2 id="board-joined" className="font-label text-xl mb-4">
          {uiCopy.leaderboard.joinedHeading}
        </h2>
        <LeaderboardBoard
          board={joined}
          metricLabel={uiCopy.leaderboard.sessionsJoined}
          metricKey="joined"
        />
      </section>
      <section aria-labelledby="board-hosted">
        <h2 id="board-hosted" className="font-label text-xl mb-4">
          {uiCopy.leaderboard.hostedHeading}
        </h2>
        <LeaderboardBoard
          board={hosted}
          metricLabel={uiCopy.leaderboard.sessionsPosted}
          metricKey="hosted"
        />
      </section>
    </div>
  );
}
