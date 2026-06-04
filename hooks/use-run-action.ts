"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useCallback } from "react";
import { useToast } from "@/components/toast-provider";
import { useAnnounce } from "@/hooks/use-announce";

export type RunActionOptions = {
  successMessage?: string;
  errorMessage?: string;
};

export function useRunAction() {
  const router = useRouter();
  const { showToast } = useToast();
  const announce = useAnnounce();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const runAction = useCallback(
    (action: () => Promise<void>, onSuccess?: () => void, options?: RunActionOptions) => {
      setError("");
      startTransition(async () => {
        try {
          await action();
          onSuccess?.();
          router.refresh();
          if (options?.successMessage) {
            showToast({ tone: "success", title: options.successMessage });
            announce(options.successMessage);
          }
        } catch (actionError) {
          const message = actionError instanceof Error ? actionError.message : "Something went wrong.";
          setError(message);
          showToast({
            tone: "error",
            title: options?.errorMessage ?? "Action failed",
            description: message
          });
          announce(`${options?.errorMessage ?? "Action failed"}. ${message}`);
        }
      });
    },
    [router, showToast, announce]
  );

  return { isPending, error, runAction, setError };
}
