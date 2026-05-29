"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition, useCallback } from "react";

export function useRunAction() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const runAction = useCallback(
    (action: () => Promise<void>, onSuccess?: () => void) => {
      setError("");
      startTransition(async () => {
        try {
          await action();
          onSuccess?.();
          router.refresh();
        } catch (actionError) {
          setError(
            actionError instanceof Error
              ? actionError.message
              : "Something went wrong."
          );
        }
      });
    },
    [router]
  );

  return { isPending, error, runAction, setError };
}
