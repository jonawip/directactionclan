import { requireUser } from "@/lib/auth/require";
import { uiCopy } from "@/lib/ui/copy";
import { createClient } from "@/lib/supabase/server";
import { CreateGameForm } from "./CreateGameForm";

export default async function NewGamePage() {
  const user = await requireUser("/games/new");
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  return (
    <section>
      <h1 className="page-title font-display text-2xl text-[var(--acid)]">
        {uiCopy.postGame.pageTitle}
      </h1>
      <CreateGameForm timezone={profile?.timezone ?? "Europe/London"} />
    </section>
  );
}
