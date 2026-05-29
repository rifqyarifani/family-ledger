"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/button";
import { formatDate } from "@/lib/finance";
import { cn } from "@/lib/utils";

const dayLabels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

function toIsoDate(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function fromIsoDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return year && month && day ? new Date(year, month - 1, day) : new Date();
}

function getMonthDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(year, month, 1 - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);
    return date;
  });
}

export function DatePicker({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => fromIsoDate(value));
  const visibleDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const monthLabel = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric" }).format(visibleMonth);

  function moveMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-surface-border bg-white px-3 text-left text-sm text-ink transition hover:border-[#b0b8a8]",
          !value && "text-[#9ca390]"
        )}
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Choose due date"
        aria-expanded={isOpen}
      >
        <span>{value ? formatDate(value) : "Choose date"}</span>
        <CalendarDays className="h-4 w-4 text-[#9ca390]" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-surface-border bg-white p-3 shadow-xl sm:right-auto sm:w-80">
          <div className="mb-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => moveMonth(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="text-sm font-semibold text-ink">{monthLabel}</p>
            <Button variant="ghost" size="icon" onClick={() => moveMonth(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#9ca390]">
            {dayLabels.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {visibleDays.map((date) => {
              const isoDate = toIsoDate(date);
              const isSelected = value === isoDate;
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isToday = isoDate === toIsoDate(new Date());

              return (
                <button
                  key={isoDate}
                  type="button"
                  className={cn(
                    "h-9 rounded-xl text-sm font-medium transition",
                    isCurrentMonth ? "text-ink-secondary hover:bg-surface-subtle" : "text-[#b0b8a8] hover:bg-surface-subtle",
                    isToday && "ring-1 ring-[#b0b8a8]",
                    isSelected && "bg-brand text-white hover:bg-brand"
                  )}
                  onClick={() => {
                    onChange(isoDate);
                    setIsOpen(false);
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between gap-2 border-t border-surface pt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onChange(toIsoDate(new Date()));
                setIsOpen(false);
              }}
            >
              Today
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
