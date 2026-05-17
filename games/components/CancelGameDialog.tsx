"use client";

import { useEffect, useRef, useTransition } from "react";
import { uiCopy } from "@/lib/ui/copy";

type Props = {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
};

export function CancelGameDialog({ open, onClose, onConfirm }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="app-dialog"
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
          const form = e.currentTarget;
          const reason =
            (form.elements.namedItem("reason") as HTMLInputElement)?.value ??
            "";
          startTransition(async () => {
            await onConfirm(reason.trim());
            onClose();
          });
        }}
      >
        <h2 className="font-label text-xl m-0">
          {uiCopy.detail.cancelDialogTitle}
        </h2>
        <p className="text-[var(--fg-dim)] mt-3 mb-4">
          {uiCopy.detail.cancelDialogBody}
        </p>
        <CancelReasonField />
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
            {pending ? uiCopy.detail.cancelling : uiCopy.detail.cancelConfirm}
          </button>
        </div>
      </form>
    </dialog>
  );
}

function CancelReasonField() {
  return (
    <div className="form-field">
      <label htmlFor="cancel-reason">{uiCopy.detail.cancelReasonLabel}</label>
      <input id="cancel-reason" name="reason" type="text" maxLength={200} />
    </div>
  );
}
