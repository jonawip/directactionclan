import Link from "next/link";
import { notFound } from "next/navigation";
import { MemberRank } from "@/components/MemberRank";
import { RankLadder } from "@/components/RankLadder";
import { getOptionalUser } from "@/lib/auth/require";
import { fetchMemberStats } from "@/lib/gamification/stats";
import { createClient } from "@/lib/supabase/server";
import { uiCopy } from "@/lib/ui/copy";

type Params = { params: Promise<{ handle: string }> };

export default async function PublicProfilePage({ params }: Params) {
  const { handle } = await params;
  const normalized = handle.toLowerCase();
  const supabase = await createClient();
  const user = await getOptionalUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, display_name, handle, avatar_url, timezone")
    .ilike("handle", normalized)
    .maybeSingle();

  if (!profile?.handle) {
    notFound();
  }

  const isSelf = user?.id === profile.id;
  const stats = await fetchMemberStats(supabase, profile.id);

  const { data: hosted } = await supabase
    .from("games")
    .select("id, title, starts_at, status")
    .eq("created_by", profile.id)
    .gte("starts_at", new Date().toISOString())
    .neq("status", "completed")
    .order("starts_at", { ascending: true });

  const { data: joined } = await supabase
    .from("rsvps")
    .select("game_id, games(id, title, starts_at, status)")
    .eq("user_id", profile.id);

  const upcomingJoined =
    joined
      ?.map((r) => r.games)
      .filter(
        (g): g is { id: string; title: string; starts_at: string; status: string } =>
          g !== null &&
          typeof g === "object" &&
          "starts_at" in g &&
          g.status !== "completed" &&
          new Date(g.starts_at as string) >= new Date(),
      ) ?? [];

  return (
    <section>
      <header className="page-header flex flex-wrap items-center gap-4">
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt=""
            width={64}
            height={64}
            className="rounded-full"
          />
        ) : (
          <span
            className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--bg-3)] text-2xl font-display text-[var(--acid)]"
            aria-hidden
          >
            {(profile.display_name[0] ?? "?").toUpperCase()}
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl text-[var(--acid)] m-0">
            {uiCopy.profile.memberTitle(profile.display_name)}
          </h1>
          <p className="text-[var(--fg-dim)] m-0 mt-1">@{profile.handle}</p>
          <p className="m-0 mt-2">
            <MemberRank stats={stats} variant="compact" />
          </p>
          {isSelf && (
            <p className="m-0 mt-3">
              <Link href="/profile" className="text-[var(--cyan)]">
                {uiCopy.profile.editOwn}
              </Link>
            </p>
          )}
        </div>
      </header>
      <hr className="barcode" />
      <MemberRank stats={stats} variant="card" />
      {isSelf && <RankLadder />}
      <h2 className="font-label text-xl mb-3 mt-8">{uiCopy.profile.memberJoined}</h2>
      <GameList items={upcomingJoined} empty={uiCopy.profile.memberNoJoined} />
      <h2 className="font-label text-xl mb-3 mt-8">
        {uiCopy.profile.memberHosted}
      </h2>
      <GameList items={hosted ?? []} empty={uiCopy.profile.memberNoHosted} />
    </section>
  );
}

function GameList({
  items,
  empty,
}: {
  items: { id: string; title: string; starts_at: string; status: string }[];
  empty: string;
}) {
  if (items.length === 0) {
    return <p className="text-[var(--fg-dim)]">{empty}</p>;
  }
  return (
    <ul className="list-none m-0 p-0 space-y-2">
      {items.map((g) => (
        <li key={g.id} className="profile-game-item">
          <Link href={`/games/${g.id}`} className="text-[var(--cyan)]">
            {g.title}
          </Link>
          <span className="text-[var(--fg-dim)] text-xs">
            {new Date(g.starts_at).toLocaleString()} · {g.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
