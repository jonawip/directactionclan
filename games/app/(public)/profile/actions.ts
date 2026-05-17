"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireUser } from "@/lib/auth/require";
import { createClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  display_name: z.string().trim().min(1).max(64),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9_-]{3,24}$/)
    .optional()
    .or(z.literal("")),
  timezone: z.string().min(1),
});

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser("/profile");
  const parsed = profileSchema.safeParse({
    display_name: formData.get("display_name"),
    handle: formData.get("handle"),
    timezone: formData.get("timezone"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { display_name, handle, timezone } = parsed.data;
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
      timezone,
    })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/profile");
  return {};
}
