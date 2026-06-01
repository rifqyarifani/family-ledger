"use client";

import { ErrorBoundary } from "@/components/error-boundary";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  void error;
  return <ErrorBoundary message="Something went wrong loading family." reset={reset} />;
}
