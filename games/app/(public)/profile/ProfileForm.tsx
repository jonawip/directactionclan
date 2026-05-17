"use client";

import { useState, useTransition } from "react";
import type { ProfileRow } from "@/types/domain";
import { updateProfileAction } from "./actions";

const TIMEZONES =
  typeof Intl !== "undefined" && "supportedValuesOf" in Intl
    ? Intl.supportedValuesOf("timeZone")
    : ["Europe/London", "America/New_York", "UTC"];

export function ProfileForm({ profile }: { profile: ProfileRow }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="max-w-lg"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);
        startTransition(async () => {
          const result = await updateProfileAction(formData);
          if (result?.error) {
            setError(result.error);
          }
        });
      }}
    >
      {error && (
        <p role="alert" className="text-[var(--pink)] mb-4">
          {error}
        </p>
      )}
      <div className="form-field">
        <label htmlFor="display_name">Display name</label>
        <input
          id="display_name"
          name="display_name"
          defaultValue={profile.display_name}
          required
        />
      </div>
      <div className="form-field">
        <label htmlFor="handle">Handle</label>
        <input
          id="handle"
          name="handle"
          defaultValue={profile.handle ?? ""}
          pattern="[a-z0-9_-]{3,24}"
          title="3–24 characters: lowercase letters, numbers, underscore, hyphen"
        />
      </div>
      <div className="form-field">
        <label htmlFor="timezone">Timezone</label>
        <select
          id="timezone"
          name="timezone"
          defaultValue={profile.timezone}
        >
          {TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
