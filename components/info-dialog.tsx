"use client";

import { useRef } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/button";
import { useFocusTrap } from "@/hooks/use-focus-trap";

export function InfoDialog({
  open,
  title,
  message,
  closeLabel = "Close",
  onClose
}: {
  open: boolean;
  title: string;
  message: string;
  closeLabel?: string;
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
      aria-describedby="info-message"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div ref={dialogRef} className="w-full max-w-md rounded-[2rem] bg-canvas p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-brand-light p-2 text-brand">
            <Info className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            <p id="info-message" className="mt-2 text-sm text-ink-secondary">{message}</p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
