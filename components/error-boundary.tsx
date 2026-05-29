"use client";

export function ErrorBoundary({
  message,
  reset
}: {
  message: string;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <p className="text-sm text-ink-secondary">{message}</p>
      <button
        onClick={reset}
        className="rounded-xl bg-brand px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
