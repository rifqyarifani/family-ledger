"use client";

import { useState, type ReactNode } from "react";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Header } from "@/components/header";
import { SettingsDialog } from "@/components/settings-dialog";
import { Sidebar } from "@/components/sidebar";
import type { ActiveHousehold } from "@/src/lib/data/households";
import type { UserProfile } from "@/types/finance";

type AppShellProfile = UserProfile;

export function AppShell({
  children,
  householdName,
  householdCode,
  monthlyCycleDay,
  householdRole,
  profile
}: {
  children: ReactNode;
  householdName: string;
  householdCode: string;
  monthlyCycleDay: number;
  householdRole: ActiveHousehold["role"];
  profile: AppShellProfile;
}) {
  return (
    <AuthenticatedApp
      householdName={householdName}
      householdCode={householdCode}
      monthlyCycleDay={monthlyCycleDay}
      householdRole={householdRole}
      profile={profile}
    >
      {children}
    </AuthenticatedApp>
  );
}

function AuthenticatedApp({
  children,
  householdName,
  householdCode,
  monthlyCycleDay,
  householdRole,
  profile
}: {
  children: ReactNode;
  householdName: string;
  householdCode: string;
  monthlyCycleDay: number;
  householdRole: ActiveHousehold["role"];
  profile: AppShellProfile;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface">
      <a
        href="#main-content"
        className="fixed left-0 top-0 z-[100] -translate-y-full bg-brand px-4 py-2 text-sm font-medium text-brand-green transition focus:translate-y-0"
      >
        Skip to content
      </a>
      <div id="sr-announcements" aria-live="polite" aria-atomic="true" className="sr-only" />
      <div className="fixed inset-y-0 left-0 z-40 hidden w-56 md:block">
        <Sidebar />
      </div>
      {isSidebarOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            className="absolute inset-0 bg-slate-950/40"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
          />
          <div className="relative h-full w-72 shadow-xl">
            <Sidebar onNavigate={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      ) : null}
      <div className="md:pl-56">
        <Header
          householdName={householdName}
          householdRole={householdRole}
          profile={profile}
          onMenuClick={() => setIsSidebarOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onLogout={() => setIsLogoutOpen(true)}
        />
        <main id="main-content" className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">{children}</main>
      </div>
      <SettingsDialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={profile}
        householdName={householdName}
        householdCode={householdCode}
        monthlyCycleDay={monthlyCycleDay}
        householdRole={householdRole}
      />
      <ConfirmDialog
        open={isLogoutOpen}
        title="Logout from FamilyLedger?"
        message="This will sign out on this browser. Your household data stays saved in Supabase."
        confirmLabel="Logout"
        onClose={() => setIsLogoutOpen(false)}
        onConfirm={() => {
          setIsLogoutOpen(false);
          window.location.href = "/logout";
        }}
      />
    </div>
  );
}
