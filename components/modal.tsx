"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/button";

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center overflow-y-auto bg-[#0e0f0c]/50 p-3 sm:items-center sm:p-4">
      <div className="my-4 w-full max-w-2xl rounded-3xl bg-white p-5 shadow-xl sm:my-0">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-[#0e0f0c]">{title}</h2>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
