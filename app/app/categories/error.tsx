"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  void error;
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4">
      <p className="text-sm text-[#454745]">Something went wrong loading categories.</p>
      <button
        onClick={reset}
        className="rounded-xl bg-[#0e0f0c] px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Try again
      </button>
    </div>
  );
}
