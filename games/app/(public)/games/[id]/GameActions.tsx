"use client";

import { useTransition } from "react";
import { uiCopy } from "@/lib/ui/copy";
import { cancelGameAction, joinGameAction, leaveGameAction } from "./actions";

type Props = {
  gameId: string;
  isOwner: boolean;
  hasJoined: boolean;
  status: string;
  isAuthed: boolean;
  canEditCore: boolean;
};

export function GameActions({
  gameId,
  isOwner,
  hasJoined,
  status,
  isAuthed,
}: Props) {
  const [pending, startTransition] = useTransition();

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
        <button
          type="button"
          className="btn"
          disabled={pending}
          onClick={() => {
            const reason = window.prompt(uiCopy.detail.cancelPrompt);
            startTransition(async () => {
              await cancelGameAction(gameId, reason ?? undefined);
            });
          }}
        >
          {uiCopy.detail.cancel}
        </button>
      )}
    </div>
  );
}
