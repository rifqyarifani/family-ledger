"use client";

import { Menu } from "lucide-react";
import { AccountMenu } from "@/components/account-menu";
import { Button } from "@/components/button";
import type { ActiveHousehold } from "@/src/lib/data/households";

type HeaderProfile = {
  firstName: string;
  lastName: string;
  displayName: string;
} | null;

export function Header({
  householdName,
  householdRole,
  profile,
  onMenuClick,
  onOpenSettings,
  onLogout
}: {
  householdName: string;
  householdRole: ActiveHousehold["role"];
  profile: HeaderProfile;
  onMenuClick: () => void;
  onOpenSettings: () => void;
  onLogout: () => void;
}) {
  const [fallbackFirstName = "Family", ...fallbackLastParts] = (profile?.displayName ?? "Family member").split(" ");
  const firstName = profile?.firstName || fallbackFirstName;
  const lastName = profile?.lastName || fallbackLastParts.join(" ");
  const roleLabel = householdRole === "owner" ? "Owner" : "Member";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-950">{householdName}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="secondary" size="icon" onClick={onMenuClick} className="md:hidden" aria-label="Open navigation">
          <Menu className="h-4 w-4" aria-hidden="true" />
        </Button>
        <AccountMenu
          firstName={firstName}
          lastName={lastName}
          roleLabel={roleLabel}
          onOpenSettings={onOpenSettings}
          onLogout={onLogout}
        />
      </div>
    </header>
  );
}
