"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const hours = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const minutes = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));

export function TimePicker({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedHour, setSelectedHour] = useState(value?.split(":")[0] ?? "00");
  const [selectedMinute, setSelectedMinute] = useState(value?.split(":")[1] ?? "00");

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (value) {
      const [h, m] = value.split(":");
      if (h) setSelectedHour(h);
      if (m) setSelectedMinute(m);
    }
  }, [value]);

  const displayValue = value ? `${value}` : "";

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-surface-border bg-white px-3 text-left text-sm text-ink transition hover:border-[#b0b8a8]",
          !displayValue && "text-[#9ca390]"
        )}
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Choose time"
        aria-expanded={isOpen}
      >
        <span>{displayValue || "Select time"}</span>
        <Clock className="h-4 w-4 text-[#9ca390]" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-surface-border bg-white p-3 shadow-xl sm:right-auto sm:w-64">
          <div className="flex items-center gap-2">
            <select
              value={selectedHour}
              onChange={(event) => {
                const newHour = event.target.value;
                setSelectedHour(newHour);
                onChange(`${newHour}:${selectedMinute}`);
              }}
              className="h-10 flex-1 rounded-xl border border-surface-border bg-white px-2 text-center text-sm text-ink focus:border-brand focus:outline-none"
            >
              {hours.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span className="text-lg font-semibold text-ink">:</span>
            <select
              value={selectedMinute}
              onChange={(event) => {
                const newMinute = event.target.value;
                setSelectedMinute(newMinute);
                onChange(`${selectedHour}:${newMinute}`);
                setIsOpen(false);
              }}
              className="h-10 flex-1 rounded-xl border border-surface-border bg-white px-2 text-center text-sm text-ink focus:border-brand focus:outline-none"
            >
              {minutes.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
    </div>
  );
}
