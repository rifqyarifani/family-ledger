"use client";

import { useCallback } from "react";

export function useAnnounce() {
  return useCallback((message: string) => {
    const el = document.getElementById("sr-announcements");
    if (el) {
      el.textContent = "";
      requestAnimationFrame(() => {
        el.textContent = message;
      });
    }
  }, []);
}
