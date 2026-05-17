"use client";

import { useState, useTransition } from "react";
import { CancelGameDialog } from "@/components/CancelGameDialog";
import { EditGameDialog } from "@/components/EditGameDialog";
import { uiCopy } from "@/lib/ui/copy";
import {
  cancelGameAction,
  joinGameAction,
  leaveGameAction,
  updateGameAction,
} from "./actions";

type Props = {
  gameId: string;
  isOwner: boolean;
  hasJoined: boolean;
  status: string;
  isAuthed: boolean;
  canEditCore: boolean;
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
};

export function GameActions({
  gameId,
  isOwner,
  hasJoined,
  status,
  isAuthed,
  canEditCore,
  timezone,
  gameSlug,
  activitySlug,
  initial,
}: Props) {
  const [pending, startTransition] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  if (status === "cancelled" || status === "completed") {
    return null;
  }

  if (!isAuthed) {
    return (
      <p className="mt-8">
        <a href={`/login?next=/games/${gameId}`} className="btn btn-primary">
          {uiCopy.detail.signInToJoin}
        </a>
      </p>
    );
  }

  return (
    <>
      <ActionButtons
        gameId={gameId}
        isOwner={isOwner}
        hasJoined={hasJoined}
        status={status}
        pending={pending}
        startTransition={startTransition}
        onEdit={() => setEditOpen(true)}
        onCancel={() => setCancelOpen(true)}
      />
      <EditGameDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        gameId={gameId}
        timezone={timezone}
        gameSlug={gameSlug}
        activitySlug={activitySlug}
        initial={initial}
        canChangeMaxPlayers={canEditCore}
        onSave={updateGameAction}
      />
      <CancelGameDialog
        open={cancelOpen}
        onClose={() => setCancelOpen(false)}
        onConfirm={async (reason) => {
          await cancelGameAction(gameId, reason || undefined);
        }}
      />
    </>
  );
}

function ActionButtons({
  gameId,
  isOwner,
  hasJoined,
  status,
  pending,
  startTransition,
  onEdit,
  onCancel,
}: {
  gameId: string;
  isOwner: boolean;
  hasJoined: boolean;
  status: string;
  pending: boolean;
  startTransition: (fn: () => void | Promise<void>) => void;
  onEdit: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      {!hasJoined && status !== "full" && (
        <button
          type="button"
          className="btn btn-primary"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await joinGameAction(gameId);
            })
          }
        >
          {uiCopy.detail.join}
        </button>
      )}
      {hasJoined && (
        <button
          type="button"
          className="btn"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await leaveGameAction(gameId);
            })
          }
        >
          {uiCopy.detail.leave}
        </button>
      )}
      {isOwner && (
        <>
          <button type="button" className="btn" disabled={pending} onClick={onEdit}>
            {uiCopy.detail.edit}
          </button>
          <button
            type="button"
            className="btn"
            disabled={pending}
            onClick={onCancel}
          >
            {uiCopy.detail.cancel}
          </button>
        </>
      )}
    </div>
  );
}
