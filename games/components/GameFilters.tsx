"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useTransition } from "react";
import { GameName } from "@/components/GameName";
import { GAMES } from "@/lib/games/catalogue";
import { uiCopy } from "@/lib/ui/copy";

type FilterState = {
  games?: string[];
  activity?: string;
  openOnly?: boolean;
  notJoined?: boolean;
  from?: string;
  to?: string;
};

export function GameFilters({ isAuthed }: { isAuthed: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const selectedGames = searchParams.getAll("game");
  const selectedActivity = searchParams.get("activity") ?? null;
  const openOnly = searchParams.get("open") === "1";
  const notJoined = searchParams.get("notJoined") === "1";
  const fromDate = searchParams.get("from") ?? "";
  const toDate = searchParams.get("to") ?? "";

  const showAll =
    selectedGames.length === 0 &&
    !selectedActivity &&
    !openOnly &&
    !notJoined &&
    !fromDate &&
    !toDate;

  const pushFilters = useCallback(
    (state: FilterState) => {
      const params = new URLSearchParams();
      for (const slug of state.games ?? []) {
        params.append("game", slug);
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
      if (state.from) {
        params.set("from", state.from);
      }
      if (state.to) {
        params.set("to", state.to);
      }
      startTransition(() => {
        const query = params.toString();
        router.push(query ? `/?${query}` : "/");
      });
    },
    [router],
  );

  const baseState = (): FilterState => ({
    games: selectedGames.length ? [...selectedGames] : undefined,
    activity: selectedActivity ?? undefined,
    openOnly: openOnly || undefined,
    notJoined: notJoined || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  });

  const selectShowAll = () => {
    pushFilters({});
  };

  const toggleGame = (slug: string) => {
    const current = new Set(selectedGames);
    if (current.has(slug)) {
      current.delete(slug);
    } else {
      current.add(slug);
    }
    const games = [...current];
    pushFilters({
      ...baseState(),
      games: games.length ? games : undefined,
      activity: games.length === 1 ? selectedActivity ?? undefined : undefined,
    });
  };

  const selectActivity = (activitySlug: string) => {
    if (selectedGames.length !== 1) {
      return;
    }
    if (selectedActivity === activitySlug) {
      pushFilters({ ...baseState(), activity: undefined });
      return;
    }
    pushFilters({ ...baseState(), activity: activitySlug });
  };

  const soleGame =
    selectedGames.length === 1 ? selectedGames[0] : undefined;
  const gameDef = soleGame ? GAMES.find((g) => g.slug === soleGame) : null;
  const activities = gameDef?.activities ?? [];

  return (
    <fieldset className="filter-panel border border-[var(--line)]" disabled={pending}>
      <legend className="filter-legend font-label text-lg text-[var(--fg-dim)]">
        {uiCopy.filters.legend}
      </legend>
      <div>
        <p className="filter-group-label text-xs text-[var(--fg-dim)] uppercase">
          {uiCopy.filters.game}
        </p>
        <GameFilterButtons
          showAll={showAll}
          selectedGames={selectedGames}
          onShowAll={selectShowAll}
          onToggleGame={toggleGame}
        />
      </div>
      {soleGame && activities.length > 0 && (
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
      <div className="filter-date-row">
        <div className="form-field mb-0">
          <label htmlFor="filter-from">{uiCopy.filters.fromDate}</label>
          <input
            id="filter-from"
            type="date"
            value={fromDate}
            onChange={(e) => {
              const value = e.target.value;
              pushFilters({
                ...baseState(),
                from: value || undefined,
              });
            }}
          />
        </div>
        <div className="form-field mb-0">
          <label htmlFor="filter-to">{uiCopy.filters.toDate}</label>
          <input
            id="filter-to"
            type="date"
            value={toDate}
            min={fromDate || undefined}
            onChange={(e) => {
              const value = e.target.value;
              pushFilters({
                ...baseState(),
                to: value || undefined,
              });
            }}
          />
        </div>
        {(fromDate || toDate) && (
          <button
            type="button"
            className="btn text-xs self-end"
            onClick={() =>
              pushFilters({
                ...baseState(),
                from: undefined,
                to: undefined,
              })
            }
          >
            {uiCopy.filters.clearDates}
          </button>
        )}
      </div>
      <div className="filter-checks">
        <label className="filter-check-label text-sm">
          <input
            type="checkbox"
            checked={openOnly}
            onChange={() => {
              pushFilters({
                ...baseState(),
                openOnly: openOnly ? undefined : true,
              });
            }}
          />
          {uiCopy.filters.withSpace}
        </label>
        {isAuthed && (
          <label className="filter-check-label text-sm">
            <input
              type="checkbox"
              checked={notJoined}
              onChange={() => {
                pushFilters({
                  ...baseState(),
                  notJoined: notJoined ? undefined : true,
                });
              }}
            />
            {uiCopy.filters.hideJoined}
          </label>
        )}
      </div>
    </fieldset>
  );
}

function GameFilterButtons({
  showAll,
  selectedGames,
  onShowAll,
  onToggleGame,
}: {
  showAll: boolean;
  selectedGames: string[];
  onShowAll: () => void;
  onToggleGame: (slug: string) => void;
}) {
  return (
    <div className="filter-actions">
      <button
        type="button"
        className={`btn text-xs ${showAll ? "btn-primary" : ""}`}
        onClick={onShowAll}
        aria-pressed={showAll}
      >
        {uiCopy.filters.allGames}
      </button>
      {GAMES.map((g) => (
        <button
          key={g.slug}
          type="button"
          className={`filter-game-btn btn text-xs ${selectedGames.includes(g.slug) ? "btn-primary" : ""}`}
          onClick={() => onToggleGame(g.slug)}
          aria-pressed={selectedGames.includes(g.slug)}
        >
          <GameName
            gameSlug={g.slug}
            size={16}
            iconTone={selectedGames.includes(g.slug) ? "contrast" : "accent"}
            labelClassName="game-name-label"
          />
        </button>
      ))}
    </div>
  );
}
