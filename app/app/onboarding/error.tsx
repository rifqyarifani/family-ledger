"use client";

import { ErrorBoundary } from "@/components/error-boundary";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  console.error("Onboarding page error:", error);
  return <ErrorBoundary message="Something went wrong." reset={reset} />;
}
