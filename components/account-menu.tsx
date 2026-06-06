"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, LogOut, Settings } from "lucide-react";
import { Avatar, getProfileName } from "@/components/avatar";
import { Button } from "@/components/button";
import { cn } from "@/lib/utils";

export function AccountMenu({
  firstName,
  lastName,
  roleLabel,
  onOpenSettings,
  onLogout
}: {
  firstName: string;
  lastName: string;
  roleLabel: string;
  onOpenSettings: () => void;
  onLogout: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const profileName = getProfileName(firstName, lastName);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        className="flex items-center gap-3 rounded-full border border-transparent p-1 pr-2 text-left transition hover:border-surface-border hover:bg-surface"
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Open profile menu"
        aria-expanded={isOpen}
      >
        <Avatar firstName={firstName} lastName={lastName} />
        <span className="hidden min-w-0 md:block">
          <span className="block max-w-36 truncate text-sm font-semibold text-ink">{profileName}</span>
          <span className="block text-xs text-ink-secondary">{roleLabel}</span>
        </span>
        <ChevronDown
          className={cn("hidden h-4 w-4 text-ink-muted transition md:block", isOpen && "rotate-180")}
          aria-hidden="true"
        />
      </button>

      {isOpen ? (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-2xl border border-surface-border bg-canvas p-2 shadow-xl">
          <div className="border-b border-surface px-3 py-2 md:hidden">
            <p className="truncate text-sm font-semibold text-ink">{profileName}</p>
            <p className="text-xs text-ink-secondary">{roleLabel}</p>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => {
              setIsOpen(false);
              onOpenSettings();
            }}
          >
            <Settings className="h-4 w-4" aria-hidden="true" />
            Settings
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:bg-red-50"
            onClick={() => {
              setIsOpen(false);
              onLogout();
            }}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Logout
          </Button>
        </div>
      ) : null}
    </div>
  );
}
