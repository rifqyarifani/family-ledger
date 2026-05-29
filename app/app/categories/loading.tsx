export default function Loading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="h-9 w-32 animate-pulse rounded-lg bg-surface" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-surface" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-full bg-surface" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {Array.from({ length: 2 }).map((_, section) => (
          <div key={section} className="min-w-0 rounded-3xl bg-white px-4 py-2">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-9 w-9 animate-pulse rounded-xl bg-surface" />
              <div className="h-5 w-24 animate-pulse rounded bg-surface" />
              <div className="h-5 w-6 animate-pulse rounded-full bg-surface" />
            </div>
            <div className="grid gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-2xl border border-surface-border px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 animate-pulse rounded-full bg-surface" />
                    <div className="h-4 w-28 animate-pulse rounded bg-surface" />
                  </div>
                  <div className="flex gap-1">
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-surface" />
                    <div className="h-8 w-8 animate-pulse rounded-lg bg-surface" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
