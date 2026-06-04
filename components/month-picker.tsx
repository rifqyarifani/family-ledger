"use client";

import { useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/button";
import { useClickOutside } from "@/hooks/use-click-outside";
import { formatMonthLongYear } from "@/lib/finance";
import { cn } from "@/lib/utils";

const shortMonthFormatter = new Intl.DateTimeFormat("id-ID", {
  month: "short"
});

function fromMonthKey(value: string) {
  const [year, month] = value.split("-").map(Number);
  return year && month ? new Date(year, month - 1, 1) : new Date();
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function getYearMonths(yearDate: Date) {
  return Array.from({ length: 12 }, (_, index) => new Date(yearDate.getFullYear(), index, 1));
}

export function MonthPicker({
  value,
  onChange
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleYear, setVisibleYear] = useState(() => fromMonthKey(value));
  const months = getYearMonths(visibleYear);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, isOpen, () => setIsOpen(false));

  function moveYear(offset: number) {
    setVisibleYear((current) => new Date(current.getFullYear() + offset, 0, 1));
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border border-surface-border bg-white px-3 text-left text-sm text-ink transition hover:border-[#b0b8a8]",
          !value && "text-[#9ca390]"
        )}
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Choose budget month"
        aria-expanded={isOpen}
      >
        <span>{formatMonthLongYear(fromMonthKey(value))}</span>
        <CalendarDays className="h-4 w-4 text-[#9ca390]" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-2xl border border-surface-border bg-white p-3 shadow-xl sm:right-auto sm:w-80">
          <div className="mb-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => moveYear(-1)} aria-label="Previous year">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="text-sm font-semibold text-ink">{visibleYear.getFullYear()}</p>
            <Button variant="ghost" size="icon" onClick={() => moveYear(1)} aria-label="Next year">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {months.map((monthDate) => {
              const monthKey = toMonthKey(monthDate);
              const isSelected = value === monthKey;

              return (
                <button
                  key={monthKey}
                  type="button"
                  className={cn(
                    "rounded-lg px-3 py-3 text-sm font-medium transition",
                    isSelected
                      ? "bg-brand text-white hover:bg-brand"
                      : "bg-surface-subtle text-ink-secondary hover:bg-surface"
                  )}
                  onClick={() => {
                    onChange(monthKey);
                    setIsOpen(false);
                  }}
                >
                  {shortMonthFormatter.format(monthDate)}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between gap-2 border-t border-surface pt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                const currentMonth = toMonthKey(new Date());
                onChange(currentMonth);
                setVisibleYear(fromMonthKey(currentMonth));
                setIsOpen(false);
              }}
            >
              This month
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
