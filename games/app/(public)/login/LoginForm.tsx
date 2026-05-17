"use client";

import { createClient } from "@/lib/supabase/client";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const supabase = createClient();
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const redirectTo = `${siteUrl}/auth/callback${nextPath ? `?next=${encodeURIComponent(nextPath)}` : ""}`;

  const signIn = async (provider: "discord" | "google") => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo },
    });
  };

  return (
    <ul className="flex flex-col gap-3 list-none m-0 p-0">
      <li>
        <button
          type="button"
          className="btn btn-primary w-full"
          onClick={() => signIn("discord")}
        >
          Continue with Discord
        </button>
      </li>
      <li>
        <button
          type="button"
          className="btn w-full"
          onClick={() => signIn("google")}
        >
          Continue with Google
        </button>
      </li>
    </ul>
  );
}
