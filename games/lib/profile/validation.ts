import { z } from "zod";

const handleRegex = /^[a-z0-9_-]{3,24}$/;

const bungieNameRegex = /^[^\s#][^\s#]{0,35}#[0-9]{4,7}$/;

export const profileSchema = z.object({
  display_name: z.string().trim().min(1).max(64),
  handle: z
    .string()
    .trim()
    .toLowerCase()
    .refine((value) => value === "" || handleRegex.test(value), {
      message:
        "Handle must be 3–24 characters (a–z, 0–9, _, -) for your profile link. Put your Bungie name in the Bungie field.",
    }),
  bungie_name: z
    .string()
    .trim()
    .refine((value) => value === "" || bungieNameRegex.test(value), {
      message: "Bungie name must look like Name#1234 (e.g. An_Actual_Crab#6497).",
    }),
  timezone: z.string().min(1),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
