"use client";

import { useMemo, useState, useTransition } from "react";
import { GameName } from "@/components/GameName";
import { GAMES } from "@/lib/games/catalogue";
import {
  defaultStartParts,
  localDateTimeToIso,
} from "@/lib/time/local-to-iso";
import { uiCopy } from "@/lib/ui/copy";
import { createGameAction } from "./actions";

const DEFAULT_DURATION_MINUTES = 90;

export function CreateGameForm({ timezone }: { timezone: string }) {
  const [gameSlug, setGameSlug] = useState(GAMES[0]?.slug ?? "");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const game = GAMES.find((g) => g.slug === gameSlug);
  const activity = game?.activities[0];
  const [activitySlug, setActivitySlug] = useState(activity?.slug ?? "");
  const [maxPlayers, setMaxPlayers] = useState(activity?.defaultMaxPlayers ?? 3);

  const selectedActivity = useMemo(
    () => game?.activities.find((a) => a.slug === activitySlug),
    [game, activitySlug],
  );

  const onGameChange = (slug: string) => {
    setGameSlug(slug);
    const g = GAMES.find((x) => x.slug === slug);
    const first = g?.activities[0];
    if (first) {
      setActivitySlug(first.slug);
      setMaxPlayers(first.defaultMaxPlayers);
    }
  };

  const onActivityChange = (slug: string) => {
    setActivitySlug(slug);
    const a = game?.activities.find((x) => x.slug === slug);
    if (a) {
      setMaxPlayers(a.defaultMaxPlayers);
    }
  };

  const defaultStart = useMemo(
    () => defaultStartParts(timezone),
    [timezone],
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    const startDate = String(formData.get("startDate"));
    const startTime = String(formData.get("startTime"));
    formData.set(
      "startsAt",
      localDateTimeToIso(startDate, startTime, timezone),
    );

    startTransition(async () => {
      const result = await createGameAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-lg">
      {error && (
        <p role="alert" className="text-[var(--pink)] mb-4">
          {error}
        </p>
      )}
      
      <div className="form-field">
        <label htmlFor="gameSlug">{uiCopy.postGame.game}</label>
        {game && (
          <p className="mb-2">
            <GameName gameSlug={gameSlug} size={24} />
          </p>
        )}
        <select
          id="gameSlug"
          name="gameSlug"
          value={gameSlug}
          onChange={(e) => onGameChange(e.target.value)}
          required
        >
          {GAMES.map((g) => (
            <option key={g.slug} value={g.slug}>
              {g.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-field">
        <label htmlFor="activitySlug">{uiCopy.postGame.mode}</label>
        <select
          id="activitySlug"
          name="activitySlug"
          value={activitySlug}
          onChange={(e) => onActivityChange(e.target.value)}
          required
        >
          {game?.activities.map((a) => (
            <option key={a.slug} value={a.slug}>
              {a.name}
            </option>
          ))}
        </select>
      </div>
      
      <div className="form-field">
        <label htmlFor="title">{uiCopy.postGame.title}</label>
        <input
          id="title"
          name="title"
          maxLength={80}
          required
          placeholder={uiCopy.postGame.titlePlaceholder}
        />
      </div>
      
      <div className="form-field">
        <label htmlFor="description">{uiCopy.postGame.notes}</label>
        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={2000}
        />
      </div>
      <fieldset className="start-fieldset border-0 p-0 m-0 min-w-0">
        <legend className="font-label text-lg text-[var(--fg-dim)] block w-full">
          {uiCopy.postGame.when(timezone)}
        </legend>
        <div className="start-fieldset-grid grid grid-cols-1 sm:grid-cols-2">
          <div className="form-field mb-0">
            <label htmlFor="startDate">{uiCopy.postGame.date}</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={defaultStart.date}
              required
            />
          </div>
          
          <div className="form-field mb-0">
            <label htmlFor="startTime">{uiCopy.postGame.time}</label>
            <input
              id="startTime"
              name="startTime"
              type="time"
              defaultValue={defaultStart.time}
              required
            />
          </div>
        </div>
      </fieldset>
      <details className="advanced-panel">
        <summary>
          {uiCopy.postGame.moreOptions}
          <span className="advanced-panel-hint">
            {uiCopy.postGame.moreOptionsHint(
              DEFAULT_DURATION_MINUTES,
              maxPlayers,
            )}
          </span>
        </summary>
        <div className="advanced-panel-body">
          <div className="form-field">
            <label htmlFor="durationMinutes">{uiCopy.postGame.duration}</label>
            <input
              id="durationMinutes"
              name="durationMinutes"
              type="number"
              min={15}
              max={480}
              defaultValue={DEFAULT_DURATION_MINUTES}
              required
            />
          </div>
          
          <div className="form-field mb-0">
            <label htmlFor="maxPlayers">{uiCopy.postGame.playerLimit}</label>
            <input
              id="maxPlayers"
              name="maxPlayers"
              type="number"
              min={1}
              max={selectedActivity?.defaultMaxPlayers ?? 8}
              value={maxPlayers}
              onChange={(e) => setMaxPlayers(Number(e.target.value))}
              required
            />
          </div>
        </div>
      </details>
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? uiCopy.postGame.submitting : uiCopy.postGame.submit}
      </button>
    </form>
  );
}
