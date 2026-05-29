export default function Loading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="h-9 w-28 animate-pulse rounded-lg bg-surface" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-surface" />
        </div>
        <div className="h-10 w-44 animate-pulse rounded-lg bg-surface" />
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

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="min-w-0 rounded-3xl bg-white px-4 py-2">
            <div className="mb-4 h-5 w-44 animate-pulse rounded bg-surface" />
            <div className="h-72 w-full animate-pulse rounded-lg bg-surface" />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="min-w-0 rounded-3xl bg-white px-4 py-2">
          <div className="mb-4 h-5 w-40 animate-pulse rounded bg-surface" />
          <div className="h-72 w-full animate-pulse rounded-lg bg-surface" />
        </div>
        <div className="min-w-0 rounded-3xl bg-white px-4 py-2">
          <div className="mb-4 h-5 w-32 animate-pulse rounded bg-surface" />
          <div className="divide-y divide-[#e8ebe6]">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-4 py-3">
                <div className="h-4 w-28 animate-pulse rounded bg-surface" />
                <div className="h-4 w-24 animate-pulse rounded bg-surface" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="min-w-0 rounded-3xl bg-white px-4 py-2">
          <div className="mb-4 h-5 w-36 animate-pulse rounded bg-surface" />
          <div className="h-72 w-full animate-pulse rounded-lg bg-surface" />
        </div>
        <div className="min-w-0 rounded-3xl bg-white px-4 py-2">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="h-4 w-32 animate-pulse rounded bg-surface" />
              <div className="mt-3 h-8 w-28 animate-pulse rounded bg-surface" />
            </div>
            <div className="h-9 w-9 animate-pulse rounded-2xl bg-surface" />
          </div>
        </div>
      </div>
    </>
  );
}
