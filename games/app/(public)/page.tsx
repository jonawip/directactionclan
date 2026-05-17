import { Suspense } from "react";
import { GameFeed } from "@/components/GameFeed";
import { GameFilters } from "@/components/GameFilters";
import { getOptionalUser } from "@/lib/auth/require";
import { fetchUpcomingGames } from "@/lib/games/queries";
import {
  dateInTimezoneToUtcEnd,
  dateInTimezoneToUtcStart,
} from "@/lib/time/local-to-iso";
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

  const gameSlugs = toMultiArray(params.game);
  const activitySlugs = toMultiArray(params.activity);
  const openOnly = params.open === "1";
  const notJoined = params.notJoined === "1";
  const fromDate =
    typeof params.from === "string" ? params.from : undefined;
  const toDate = typeof params.to === "string" ? params.to : undefined;

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

  const from = fromDate
    ? dateInTimezoneToUtcStart(fromDate, timezone)
    : undefined;
  const to = toDate ? dateInTimezoneToUtcEnd(toDate, timezone) : undefined;

  const games = await fetchUpcomingGames(supabase, {
    gameSlugs: gameSlugs.length ? gameSlugs : undefined,
    activitySlugs: activitySlugs.length ? activitySlugs : undefined,
    openOnly,
    excludeUserId: notJoined && user ? user.id : undefined,
    from,
    to,
  });

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

function toMultiArray(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}
