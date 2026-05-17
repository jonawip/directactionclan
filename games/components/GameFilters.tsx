"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { GameName } from "@/components/GameName";
import { GAMES } from "@/lib/games/catalogue";
import { uiCopy } from "@/lib/ui/copy";

type FilterState = {
  game?: string;
  activity?: string;
  openOnly?: boolean;
  notJoined?: boolean;
};

export function GameFilters({ isAuthed }: { isAuthed: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const selectedGame = searchParams.get("game") ?? null;
  const selectedActivity = searchParams.get("activity") ?? null;
  const openOnly = searchParams.get("open") === "1";
  const notJoined = searchParams.get("notJoined") === "1";

  const showAll =
    !selectedGame && !selectedActivity && !openOnly && !notJoined;

  const pushFilters = useCallback(
    (state: FilterState) => {
      const params = new URLSearchParams();
      if (state.game) {
        params.set("game", state.game);
      }
      if (state.activity) {
        params.set("activity", state.activity);
      }
      if (state.openOnly) {
        params.set("open", "1");
      }
      if (state.notJoined) {
        params.set("notJoined", "1");
      }
      startTransition(() => {
        const query = params.toString();
        router.push(query ? `/?${query}` : "/");
      });
    },
    [router],
  );

  const selectShowAll = () => {
    pushFilters({});
  };

  const selectGame = (slug: string) => {
    if (selectedGame === slug) {
      pushFilters({});
      return;
    }
    pushFilters({ game: slug });
  };

  const selectActivity = (activitySlug: string) => {
    if (!selectedGame) {
      return;
    }
    if (selectedActivity === activitySlug) {
      pushFilters({ game: selectedGame });
      return;
    }
    pushFilters({ game: selectedGame, activity: activitySlug });
  };

  const gameDef = selectedGame
    ? GAMES.find((g) => g.slug === selectedGame)
    : null;
  const activities = gameDef?.activities ?? [];

  return (
    <fieldset className="filter-panel border border-[var(--line)]" disabled={pending}>
      <legend className="font-label text-lg px-2 text-[var(--fg-dim)]">
        {uiCopy.filters.legend}
      </legend>
      <div>
        <p className="filter-group-label text-xs text-[var(--fg-dim)] uppercase">
          {uiCopy.filters.game}
        </p>
        <div className="filter-actions">
          <button
            type="button"
            className={`btn text-xs ${showAll ? "btn-primary" : ""}`}
            onClick={selectShowAll}
            aria-pressed={showAll}
          >
            {uiCopy.filters.allGames}
          </button>
          {GAMES.map((g) => (
            <button
              key={g.slug}
              type="button"
              className={`btn text-xs ${selectedGame === g.slug ? "btn-primary" : ""}`}
              onClick={() => selectGame(g.slug)}
              aria-pressed={selectedGame === g.slug}
            >
              <GameName
                gameSlug={g.slug}
                size={16}
                iconTone={selectedGame === g.slug ? "contrast" : "accent"}
              />
            </button>
          ))}
        </div>
      </div>
      {selectedGame && activities.length > 0 && (
        <div>
          <p className="filter-group-label text-xs text-[var(--fg-dim)] uppercase">
            {uiCopy.filters.mode}
          </p>
          <div className="filter-actions">
            {activities.map((a) => (
              <button
                key={a.slug}
                type="button"
                className={`btn text-xs ${selectedActivity === a.slug ? "btn-primary" : ""}`}
                onClick={() => selectActivity(a.slug)}
                aria-pressed={selectedActivity === a.slug}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
      )}
      <div className="filter-checks">
        <label className="flex items-center gap-3 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={() => {
              if (openOnly) {
                pushFilters({});
              } else {
                pushFilters({ openOnly: true });
              }
            }}
          />
          {uiCopy.filters.withSpace}
        </label>
        {isAuthed && (
          <label className="flex items-center gap-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={notJoined}
              onChange={() => {
                if (notJoined) {
                  pushFilters({});
                } else {
                  pushFilters({ notJoined: true });
                }
              }}
            />
            {uiCopy.filters.hideJoined}
          </label>
        )}
      </div>
    </fieldset>
  );
}
