"use client";

import { ErrorBoundary } from "@/components/error-boundary";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Root page error:", error);
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-2xl font-black text-ink">Something went wrong</h1>
      <ErrorBoundary message="An unexpected error occurred." reset={reset} />
    </div>
  );
}
