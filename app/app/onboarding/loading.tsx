export default function Loading() {
  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <div className="h-9 w-44 animate-pulse rounded-lg bg-surface" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-3xl border border-surface-border bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-surface" />
            <div>
              <div className="h-5 w-36 animate-pulse rounded bg-surface" />
              <div className="mt-1 h-3 w-48 animate-pulse rounded bg-surface" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-1 h-4 w-28 animate-pulse rounded bg-surface" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface" />
            </div>
            <div className="h-10 w-full animate-pulse rounded-full bg-surface" />
          </div>
        </div>

        <div className="min-w-0 rounded-3xl border border-surface-border bg-white p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-xl bg-surface" />
            <div>
              <div className="h-5 w-40 animate-pulse rounded bg-surface" />
              <div className="mt-1 h-3 w-56 animate-pulse rounded bg-surface" />
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-1 h-4 w-32 animate-pulse rounded bg-surface" />
              <div className="h-10 w-full animate-pulse rounded-lg bg-surface" />
            </div>
            <div className="h-10 w-full animate-pulse rounded-full bg-surface" />
          </div>
        </div>
      </div>
    </>
  );
}
