"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { findActivity } from "@/lib/games/catalogue";
import { isoToLocalParts, localDateTimeToIso } from "@/lib/time/local-to-iso";
import { uiCopy } from "@/lib/ui/copy";

type Props = {
  open: boolean;
  onClose: () => void;
  gameId: string;
  timezone: string;
  gameSlug: string;
  activitySlug: string;
  initial: {
    title: string;
    description: string | null;
    startsAt: string;
    durationMinutes: number;
    maxPlayers: number;
  };
  canChangeMaxPlayers: boolean;
  onSave: (formData: FormData) => Promise<{ error?: string }>;
};

export function EditGameDialog({
  open,
  onClose,
  gameId,
  timezone,
  gameSlug,
  activitySlug,
  initial,
  canChangeMaxPlayers,
  onSave,
}: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const startParts = isoToLocalParts(initial.startsAt, timezone);
  const activity = findActivity(gameSlug, activitySlug);
  const maxCap = activity?.defaultMaxPlayers ?? initial.maxPlayers;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
      setError(null);
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="app-dialog app-dialog--wide"
      onClose={onClose}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
    >
      <form
        method="dialog"
        onSubmit={(e) => {
          e.preventDefault();
          setError(null);
          const form = e.currentTarget;
          const formData = new FormData(form);
          formData.set("gameId", gameId);
          const startDate = String(formData.get("startDate"));
          const startTime = String(formData.get("startTime"));
          formData.set(
            "startsAt",
            localDateTimeToIso(startDate, startTime, timezone),
          );

          startTransition(async () => {
            const result = await onSave(formData);
            if (result.error) {
              setError(result.error);
              return;
            }
            onClose();
          });
        }}
      >
        <h2 className="font-label text-xl m-0">{uiCopy.detail.editTitle}</h2>
        {error && (
          <p role="alert" className="text-[var(--pink)] mt-3 mb-0">
            {error}
          </p>
        )}
        <div className="form-field mt-4">
          <label htmlFor="edit-title">{uiCopy.postGame.title}</label>
          <input
            id="edit-title"
            name="title"
            defaultValue={initial.title}
            maxLength={80}
            required
          />
        </div>
        <div className="form-field">
          <label htmlFor="edit-description">{uiCopy.postGame.notes}</label>
          <textarea
            id="edit-description"
            name="description"
            rows={4}
            maxLength={2000}
            defaultValue={initial.description ?? ""}
          />
        </div>
        <fieldset className="start-fieldset border-0 p-0 m-0 min-w-0">
          <legend className="font-label text-lg text-[var(--fg-dim)] block w-full">
            {uiCopy.postGame.when(timezone)}
          </legend>
          <StartDateTimeFields
            date={startParts.date}
            time={startParts.time}
          />
        </fieldset>
        <div className="form-field">
          <label htmlFor="edit-duration">{uiCopy.postGame.duration}</label>
          <input
            id="edit-duration"
            name="durationMinutes"
            type="number"
            min={15}
            max={480}
            defaultValue={initial.durationMinutes}
            required
          />
        </div>
        {canChangeMaxPlayers && (
          <div className="form-field">
            <label htmlFor="edit-max">{uiCopy.postGame.playerLimit}</label>
            <input
              id="edit-max"
              name="maxPlayers"
              type="number"
              min={1}
              max={maxCap}
              defaultValue={initial.maxPlayers}
              required
            />
          </div>
        )}
        <div className="app-dialog-actions">
          <button
            type="button"
            className="btn"
            disabled={pending}
            onClick={onClose}
          >
            {uiCopy.detail.cancelBack}
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? uiCopy.detail.savingEdits : uiCopy.detail.saveEdits}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function StartDateTimeFields({ date, time }: { date: string; time: string }) {
  return (
    <div className="start-fieldset-grid grid grid-cols-1 sm:grid-cols-2">
      <div className="form-field mb-0">
        <label htmlFor="edit-startDate">{uiCopy.postGame.date}</label>
        <input
          id="edit-startDate"
          name="startDate"
          type="date"
          defaultValue={date}
          required
        />
      </div>
      <div className="form-field mb-0">
        <label htmlFor="edit-startTime">{uiCopy.postGame.time}</label>
        <input
          id="edit-startTime"
          name="startTime"
          type="time"
          defaultValue={time}
          required
        />
      </div>
    </div>
  );
}
