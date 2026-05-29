export default function Loading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="h-9 w-36 animate-pulse rounded-lg bg-surface" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-surface" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-w-0 rounded-3xl bg-white px-4 py-2">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="h-4 w-24 animate-pulse rounded bg-surface" />
                <div className="mt-3 h-8 w-32 animate-pulse rounded bg-surface" />
              </div>
              <div className="h-9 w-9 animate-pulse rounded-2xl bg-surface" />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="min-w-0 rounded-3xl bg-white px-4 py-2">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-surface" />
          <div className="h-72 w-full animate-pulse rounded-lg bg-surface" />
        </div>
        <div className="min-w-0 rounded-3xl bg-white px-4 py-2">
          <div className="mb-4 h-5 w-40 animate-pulse rounded bg-surface" />
          <div className="h-72 w-full animate-pulse rounded-lg bg-surface" />
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="min-w-0 rounded-3xl bg-white px-4 py-2">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-surface" />
          <div className="grid gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-24 animate-pulse rounded bg-surface" />
                  <div className="mt-3 h-2 w-full animate-pulse rounded-full bg-surface" />
                  <div className="mt-2 flex justify-between">
                    <div className="h-3 w-20 animate-pulse rounded bg-surface" />
                    <div className="h-3 w-12 animate-pulse rounded bg-surface" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="min-w-0 rounded-3xl bg-white px-4 py-2">
          <div className="mb-4 h-5 w-40 animate-pulse rounded bg-surface" />
          <div className="overflow-hidden rounded-2xl border border-surface-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 border-b border-surface-border px-4 py-3 last:border-b-0">
                <div className="flex-1">
                  <div className="h-4 w-28 animate-pulse rounded bg-surface" />
                  <div className="mt-1 h-3 w-16 animate-pulse rounded bg-surface" />
                </div>
                <div className="h-4 w-20 animate-pulse rounded bg-surface" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl bg-white px-4 py-2">
        <div className="mb-4 h-5 w-36 animate-pulse rounded bg-surface" />
        <div className="grid gap-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="h-5 w-32 animate-pulse rounded bg-surface" />
              <div className="mt-2 h-4 w-48 animate-pulse rounded bg-surface" />
            </div>
            <div className="h-8 w-16 animate-pulse rounded bg-surface" />
          </div>
          <div className="h-2 w-full animate-pulse rounded-full bg-surface" />
        </div>
      </div>
    </>
  );
}
