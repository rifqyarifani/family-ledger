export default function Loading() {
  return (
    <main className="min-h-screen bg-surface">
      <section className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-5 sm:px-6 lg:px-8">
        <header className="sticky top-5 z-20 flex items-center justify-between gap-4 rounded-3xl border border-surface-border bg-white/95 px-4 py-3 shadow-soft">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 animate-pulse rounded-2xl bg-surface" />
            <div>
              <div className="h-4 w-24 animate-pulse rounded bg-surface" />
              <div className="mt-1 h-3 w-20 animate-pulse rounded bg-surface" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-20 animate-pulse rounded-2xl bg-surface" />
            <div className="h-10 w-20 animate-pulse rounded-2xl bg-surface" />
          </div>
        </header>

        <div className="grid flex-1 items-center gap-8 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
          <div className="rounded-[2rem] bg-brand p-6 text-white shadow-soft sm:p-8">
            <div className="mb-4 h-6 w-28 animate-pulse rounded-full bg-[#1a1a1a]" />
            <div className="h-14 w-full animate-pulse rounded-lg bg-[#1a1a1a]" />
            <div className="mt-6 h-4 w-full animate-pulse rounded bg-[#1a1a1a]" />
            <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-[#1a1a1a]" />
          </div>

          <section className="w-full rounded-3xl border border-surface-border bg-white p-6 shadow-xl">
            <div className="mb-6">
              <div className="h-7 w-36 animate-pulse rounded bg-surface" />
              <div className="mt-2 h-4 w-56 animate-pulse rounded bg-surface" />
            </div>
            <div className="grid gap-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="mb-1 h-4 w-20 animate-pulse rounded bg-surface" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-surface" />
                </div>
                <div>
                  <div className="mb-1 h-4 w-20 animate-pulse rounded bg-surface" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-surface" />
                </div>
              </div>
              <div>
                <div className="mb-1 h-4 w-16 animate-pulse rounded bg-surface" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-surface" />
              </div>
              <div>
                <div className="mb-1 h-4 w-20 animate-pulse rounded bg-surface" />
                <div className="h-10 w-full animate-pulse rounded-lg bg-surface" />
              </div>
              <div className="h-10 w-full animate-pulse rounded-full bg-surface" />
            </div>
            <div className="mt-5 text-center">
              <div className="mx-auto h-4 w-44 animate-pulse rounded bg-surface" />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}
