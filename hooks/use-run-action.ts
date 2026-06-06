"use client";

import { useRouter } from "next/navigation";
import { useCallback, useRef, useState, useTransition } from "react";
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
  const runningRef = useRef(false);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");

  const runAction = useCallback(
    (action: () => Promise<void>, onSuccess?: () => void, options?: RunActionOptions) => {
      if (runningRef.current) {
        return;
      }

      runningRef.current = true;
      setIsRunning(true);
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
        } finally {
          runningRef.current = false;
          setIsRunning(false);
        }
      });
    },
    [router, showToast, announce]
  );

  return { isPending, isRunning, error, runAction, setError };
}
