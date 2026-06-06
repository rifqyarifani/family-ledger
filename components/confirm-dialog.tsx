"use client";

import { useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/button";
import { useFocusTrap } from "@/hooks/use-focus-trap";

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Delete",
  disabled = false,
  pending = false,
  pendingLabel,
  onConfirm,
  onClose
}: {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  disabled?: boolean;
  pending?: boolean;
  pendingLabel?: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, open, onClose);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-brand/50 p-4"
      role="alertdialog"
      aria-modal="true"
      aria-label={title}
      aria-describedby="confirm-message"
      onClick={(event) => {
        if (event.target === event.currentTarget && !pending) {
          onClose();
        }
      }}
    >
      <div ref={dialogRef} className="w-full max-w-md rounded-[2rem] bg-canvas p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-danger-light p-2 text-danger">
            <AlertTriangle className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            <p id="confirm-message" className="mt-2 text-sm text-ink-secondary">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} disabled={disabled || pending}>
            {pending ? (pendingLabel ?? "Working...") : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
