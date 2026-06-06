"use client";

import { useEffect, type ReactNode } from "react";
import {
  isThemePreference,
  resolveThemePreference,
  themePreferenceEvent,
  themeStorageKey,
  type ThemePreference,
} from "@/lib/theme";

function applyThemePreference(preference: ThemePreference, persist = true) {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const resolvedTheme = resolveThemePreference(preference, mediaQuery.matches);

  document.documentElement.dataset.theme = resolvedTheme;
  document.documentElement.dataset.themePreference = preference;

  if (persist) {
    localStorage.setItem(themeStorageKey, preference);
  }
}

export function ThemeProvider({
  preference,
  children,
}: {
  preference: ThemePreference;
  children: ReactNode;
}) {
  useEffect(() => {
    applyThemePreference(preference);

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleSystemChange = () => {
      if (document.documentElement.dataset.themePreference === "system") {
        applyThemePreference("system");
      }
    };
    const handlePreferenceChange = (event: Event) => {
      const preferenceDetail = (event as CustomEvent).detail?.preference;
      const persist = (event as CustomEvent).detail?.persist !== false;

      if (isThemePreference(preferenceDetail)) {
        applyThemePreference(preferenceDetail, persist);
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    window.addEventListener(themePreferenceEvent, handlePreferenceChange);

    return () => {
      mediaQuery.removeEventListener("change", handleSystemChange);
      window.removeEventListener(themePreferenceEvent, handlePreferenceChange);
    };
  }, [preference]);

  return children;
}
