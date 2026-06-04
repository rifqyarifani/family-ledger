import Link from "next/link";
import { EmptyState } from "@/components/empty-state";

export function NoHouseholdCallout({ message }: { message: string }) {
  return (
    <EmptyState
      title="No household found"
      message={message}
      action={
        <Link
          href="/app/onboarding"
          className="inline-flex h-9 items-center justify-center rounded-2xl bg-brand-green px-4 text-sm font-semibold text-white transition hover:bg-brand-green-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2"
        >
          Set up a household
        </Link>
      }
    />
  );
}
