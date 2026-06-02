import { PublicHeader } from "@/components/public-header";

export default function Loading() {
  return (
    <>
      <PublicHeader />

      <main className="min-h-screen bg-surface">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
          <div className="grid w-full items-center gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">
            <div className="rounded-[2rem] bg-ink p-8 text-canvas-soft shadow-soft sm:p-10 lg:p-12">
              <div className="h-6 w-28 animate-pulse rounded-full bg-[#1a1a1a]" />
              <div className="mt-5 h-12 w-3/4 animate-pulse rounded-lg bg-[#1a1a1a] sm:h-16 lg:h-20" />
              <div className="mt-2 h-12 w-full animate-pulse rounded-lg bg-[#1a1a1a] sm:h-16 lg:h-20" />
              <div className="mt-5 h-5 w-full animate-pulse rounded bg-[#1a1a1a]" />
              <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-[#1a1a1a]" />
            </div>

            <section className="w-full rounded-[2rem] border border-surface-border bg-white p-6 shadow-soft sm:p-8">
              <div className="mb-6">
                <div className="h-7 w-24 animate-pulse rounded bg-surface" />
                <div className="mt-2 h-4 w-48 animate-pulse rounded bg-surface" />
              </div>
              <div className="grid gap-4">
                <div>
                  <div className="h-4 w-12 animate-pulse rounded bg-surface" />
                  <div className="mt-2 h-10 w-full animate-pulse rounded-xl bg-surface" />
                </div>
                <div>
                  <div className="h-4 w-16 animate-pulse rounded bg-surface" />
                  <div className="mt-2 h-10 w-full animate-pulse rounded-xl bg-surface" />
                </div>
                <div className="h-12 w-full animate-pulse rounded-2xl bg-surface" />
              </div>
              <div className="mt-5 flex justify-center">
                <div className="h-4 w-56 animate-pulse rounded bg-surface" />
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}
