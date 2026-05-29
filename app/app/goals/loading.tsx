export default function Loading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="h-9 w-48 animate-pulse rounded-lg bg-surface" />
        </div>
        <div className="h-10 w-32 animate-pulse rounded-full bg-surface" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="min-w-0 rounded-3xl bg-white px-4 py-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-9 w-9 animate-pulse rounded-xl bg-surface" />
                <div>
                  <div className="h-4 w-28 animate-pulse rounded bg-surface" />
                  <div className="mt-2 h-3 w-20 animate-pulse rounded bg-surface" />
                </div>
              </div>
              <div className="h-8 w-8 animate-pulse rounded-lg bg-surface" />
            </div>
            <div className="mt-6">
              <div className="mb-2 flex justify-between">
                <div className="h-4 w-12 animate-pulse rounded bg-surface" />
                <div className="h-4 w-36 animate-pulse rounded bg-surface" />
              </div>
              <div className="h-2 w-full animate-pulse rounded-full bg-surface" />
              <div className="mt-3 h-4 w-24 animate-pulse rounded bg-surface" />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
