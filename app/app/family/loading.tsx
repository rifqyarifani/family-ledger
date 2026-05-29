export default function Loading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="h-9 w-24 animate-pulse rounded-lg bg-surface" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-surface" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-full bg-surface" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="min-w-0 rounded-3xl bg-white px-4 py-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 animate-pulse rounded-xl bg-surface" />
                <div>
                  <div className="h-4 w-28 animate-pulse rounded bg-surface" />
                  <div className="mt-1 h-3 w-16 animate-pulse rounded bg-surface" />
                </div>
              </div>
              <div className="flex gap-1">
                <div className="h-8 w-8 animate-pulse rounded-lg bg-surface" />
                <div className="h-8 w-8 animate-pulse rounded-lg bg-surface" />
              </div>
            </div>
            <div className="mt-4 h-3 w-36 animate-pulse rounded bg-surface" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-brand-green-pale p-4">
                <div className="h-3 w-24 animate-pulse rounded bg-[#c5e8b0]" />
                <div className="mt-2 h-5 w-20 animate-pulse rounded bg-[#c5e8b0]" />
              </div>
              <div className="rounded-2xl bg-danger-lighter p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-[#fecaca]" />
                <div className="mt-2 h-5 w-20 animate-pulse rounded bg-[#fecaca]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
