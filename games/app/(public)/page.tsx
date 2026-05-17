import { Suspense } from "react";
import { GameFeed } from "@/components/GameFeed";
import { GameFilters } from "@/components/GameFilters";
import { getOptionalUser } from "@/lib/auth/require";
import { fetchUpcomingGames } from "@/lib/games/queries";
import { uiCopy } from "@/lib/ui/copy";
import { createClient } from "@/lib/supabase/server";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const user = await getOptionalUser();

  const gameSlugs = toSingleArray(params.game);
  const activitySlugs = toSingleArray(params.activity);
  const openOnly = params.open === "1";
  const notJoined = params.notJoined === "1";

  const games = await fetchUpcomingGames(supabase, {
    gameSlugs: gameSlugs.length ? gameSlugs : undefined,
    activitySlugs: activitySlugs.length ? activitySlugs : undefined,
    openOnly,
    excludeUserId: notJoined && user ? user.id : undefined,
  });

  let timezone = "Europe/London";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("timezone")
      .eq("id", user.id)
      .single();
    if (profile?.timezone) {
      timezone = profile.timezone;
    }
  }

  return (
    <>
      <header className="page-header">
        <h1 className="font-display text-3xl text-[var(--acid)] tracking-widest">
          {uiCopy.feed.title}
        </h1>
        <p className="text-[var(--fg-dim)]">{uiCopy.feed.subtitle}</p>
      </header>
      <hr className="barcode" />
      <Suspense fallback={<p className="text-[var(--fg-dim)]">Loading…</p>}>
        <GameFilters isAuthed={!!user} />
      </Suspense>
      <GameFeed games={games} viewerTimezone={timezone} />
    </>
  );
}

function toSingleArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const first = Array.isArray(value) ? value[0] : value;
  return first ? [first] : [];
}
