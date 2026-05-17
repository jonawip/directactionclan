"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth/require";
import { profileSchema } from "@/lib/profile/validation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser("/profile");
  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name"),
    handle: formData.get("handle"),
    bungie_name: formData.get("bungie_name"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { display_name, handle, bungie_name, timezone } = parsed.data;
  const supabase = await createClient();

  if (handle) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("handle", handle)
      .neq("id", user.id)
      .maybeSingle();

    if (existing) {
      return { error: "Handle already taken." };
    }
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name,
      handle: handle || null,
      bungie_name: bungie_name || null,
      timezone,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  if (handle) {
    revalidatePath(`/profile/${handle}`);
  }
  return {};
}
