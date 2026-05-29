export default function Loading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="h-9 w-24 animate-pulse rounded-lg bg-surface" />
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="h-10 w-48 animate-pulse rounded-lg bg-surface" />
          <div className="h-10 w-32 animate-pulse rounded-full bg-surface" />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-surface-border">
        <div className="hidden gap-3 border-b border-surface bg-surface-subtle px-5 py-3 md:grid md:grid-cols-[1fr_3fr_44px_44px]">
          <div className="h-3 w-20 animate-pulse rounded bg-surface" />
          <div className="h-3 w-16 animate-pulse rounded bg-surface" />
          <div className="h-3 w-12 animate-pulse rounded bg-surface" />
          <div />
        </div>
        <div className="divide-y divide-[#e8ebe6]">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="grid grid-cols-[1fr_3fr_44px_44px] items-center gap-3 px-5 py-3">
              <div className="h-4 w-28 animate-pulse rounded bg-surface" />
              <div className="min-w-0 space-y-1">
                <div className="h-2 w-full animate-pulse rounded-full bg-surface" />
                <div className="h-3 w-32 animate-pulse rounded bg-surface" />
              </div>
              <div className="h-4 w-10 animate-pulse rounded bg-surface" />
              <div className="flex justify-end">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-surface" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
