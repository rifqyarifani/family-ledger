"use client";

import { ErrorBoundary } from "@/components/error-boundary";

export default function Error({ error: _error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <ErrorBoundary message="Something went wrong." reset={reset} />
    </div>
  );
}
