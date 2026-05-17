import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export async function AuthButtons() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Link href="/login" className="btn text-sm">
        Sign in
      </Link>
    );
  }

  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className="btn text-sm">
        Sign out
      </button>
    </form>
  );
}
