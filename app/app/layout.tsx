import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { ToastProvider } from "@/components/toast-provider";
import { getActiveHousehold, getCurrentUserProfile } from "@/src/lib/data/households";

export default async function ProtectedAppLayout({ children }: { children: ReactNode }) {
  const [household, profile] = await Promise.all([
    getActiveHousehold(),
    getCurrentUserProfile()
  ]);

  return (
    <ToastProvider>
      <AppShell
        householdName={household?.name ?? "FamilyLedger Home"}
        householdCode={household?.inviteCode ?? ""}
        monthlyCycleDay={household?.monthlyCycleDay ?? 1}
        householdRole={household?.role ?? "member"}
        profile={profile}
      >
        {children}
      </AppShell>
    </ToastProvider>
  );
}
