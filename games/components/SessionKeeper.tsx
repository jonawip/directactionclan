"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

/** Refreshes the Supabase session when the tab is opened or refocused. */
export function SessionKeeper() {
  useEffect(() => {
    const supabase = createClient();

    const refresh = () => {
      void supabase.auth.getSession();
    };

    refresh();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        refresh();
      }
    });

    const onVisible = () => {
      if (document.visibilityState === "visible") {
        refresh();
      }
    };

    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refresh);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  return null;
}
