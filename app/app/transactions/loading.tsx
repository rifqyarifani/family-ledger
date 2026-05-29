export default function Loading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="h-9 w-40 animate-pulse rounded-lg bg-surface" />
          <div className="mt-2 h-4 w-80 animate-pulse rounded bg-surface" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-full bg-surface" />
      </div>

      <div className="mb-6 min-w-0 rounded-3xl bg-white px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="h-5 w-28 animate-pulse rounded bg-surface" />
          <div className="h-8 w-24 animate-pulse rounded-lg bg-surface" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-border">
        <div className="hidden bg-surface-subtle px-4 py-3 md:block">
          <div className="flex gap-4">
            <div className="h-4 flex-1 animate-pulse rounded bg-surface" />
            <div className="h-4 w-16 animate-pulse rounded bg-surface" />
            <div className="h-4 w-20 animate-pulse rounded bg-surface" />
            <div className="h-4 w-20 animate-pulse rounded bg-surface" />
            <div className="h-4 w-20 animate-pulse rounded bg-surface" />
            <div className="h-4 w-20 animate-pulse rounded bg-surface" />
            <div className="h-4 w-24 animate-pulse rounded bg-surface" />
          </div>
        </div>
        <div className="divide-y divide-[#cfd5ca] bg-white">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1">
                <div className="h-4 w-32 animate-pulse rounded bg-surface" />
                <div className="mt-1 h-3 w-20 animate-pulse rounded bg-surface" />
              </div>
              <div className="h-5 w-14 animate-pulse rounded-full bg-surface" />
              <div className="hidden h-4 w-20 animate-pulse rounded bg-surface md:block" />
              <div className="hidden h-4 w-20 animate-pulse rounded bg-surface md:block" />
              <div className="hidden h-4 w-20 animate-pulse rounded bg-surface md:block" />
              <div className="hidden h-4 w-20 animate-pulse rounded bg-surface md:block" />
              <div className="h-4 w-24 animate-pulse rounded bg-surface" />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
