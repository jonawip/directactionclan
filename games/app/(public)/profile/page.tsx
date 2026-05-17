import Link from "next/link";
import { MemberRank } from "@/components/MemberRank";
import { RankLadder } from "@/components/RankLadder";
import { requireUser } from "@/lib/auth/require";
import { fetchMemberStats } from "@/lib/gamification/stats";
import { createClient } from "@/lib/supabase/server";
import { uiCopy } from "@/lib/ui/copy";
import { ProfileForm } from "./ProfileForm";

export default async function ProfilePage() {
  const user = await requireUser("/profile");
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return <p>Profile not found.</p>;
  }

  const stats = await fetchMemberStats(supabase, user.id);

  const { data: hosted } = await supabase
    .from("games")
    .select("id, title, starts_at, status")
    .eq("created_by", user.id)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  const { data: joined } = await supabase
    .from("rsvps")
    .select("game_id, games(id, title, starts_at, status)")
    .eq("user_id", user.id);

  const upcomingJoined =
    joined
      ?.map((r) => r.games)
      .filter(
        (g): g is { id: string; title: string; starts_at: string; status: string } =>
          g !== null &&
          typeof g === "object" &&
          "starts_at" in g &&
          new Date(g.starts_at as string) >= new Date(),
      ) ?? [];

  return (
    <section>
      <h1 className="font-display text-2xl text-[var(--acid)] mb-6">
        {uiCopy.profile.title}
      </h1>
      <MemberRank stats={stats} variant="card" />
      <RankLadder />
      <ProfileForm profile={profile} />
      <hr className="barcode" />
      <h2 className="font-label text-xl mb-3">{uiCopy.profile.upcomingJoined}</h2>
      <GameList items={upcomingJoined} empty={uiCopy.profile.noJoined} />
      <h2 className="font-label text-xl mb-3 mt-8">
        {uiCopy.profile.upcomingHosted}
      </h2>
      <GameList items={hosted ?? []} empty={uiCopy.profile.noHosted} />
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
        <li key={g.id}>
          <Link href={`/games/${g.id}`} className="text-[var(--cyan)]">
            {g.title}
          </Link>{" "}
          <span className="text-[var(--fg-dim)] text-xs">
            {new Date(g.starts_at).toLocaleString()} · {g.status}
          </span>
        </li>
      ))}
    </ul>
  );
}
