"use client";

import { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/button";
import { formatDate, formatMonthLongYear } from "@/lib/finance";
import { cn } from "@/lib/utils";

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

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

function normalizeRange(startDate: string, endDate: string) {
  if (!startDate || !endDate || startDate <= endDate) {
    return { startDate, endDate };
  }

  return { startDate: endDate, endDate: startDate };
}

function isDateInRange(date: string, startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return false;
  }

  return date >= startDate && date <= endDate;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange
}: {
  startDate: string;
  endDate: string;
  onChange: (range: { startDate: string; endDate: string }) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => fromIsoDate(startDate || endDate));
  const visibleDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const monthLabel = formatMonthLongYear(visibleMonth);

  function moveMonth(offset: number) {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function handleSelect(date: string) {
    if (!startDate || (startDate && endDate)) {
      onChange({ startDate: date, endDate: "" });
      return;
    }

    const normalized = normalizeRange(startDate, date);
    onChange(normalized);
  }

  const label = startDate && endDate
    ? `${formatDate(startDate)} - ${formatDate(endDate)}`
    : startDate
      ? formatDate(startDate)
      : "Choose date range";

  return (
    <div className="relative">
      <button
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 text-left text-sm text-slate-900 transition hover:border-slate-300",
          !startDate && !endDate && "text-slate-400"
        )}
        onClick={() => setIsOpen((current) => !current)}
        aria-label="Choose date range"
        aria-expanded={isOpen}
      >
        <span className="truncate">{label}</span>
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-lg border border-slate-200 bg-white p-3 shadow-xl sm:right-auto sm:w-[22rem]">
          <div className="mb-3 flex items-center justify-between">
            <Button variant="ghost" size="icon" onClick={() => moveMonth(-1)} aria-label="Previous month">
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </Button>
            <p className="text-sm font-semibold text-slate-950">{monthLabel}</p>
            <Button variant="ghost" size="icon" onClick={() => moveMonth(1)} aria-label="Next month">
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            {startDate && endDate
              ? `${formatDate(startDate)} - ${formatDate(endDate)}`
              : startDate
                ? "Choose an end date"
                : "Choose a start date"}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-400">
            {dayLabels.map((day) => (
              <span key={day} className="py-1">
                {day}
              </span>
            ))}
          </div>

          <div className="mt-1 grid grid-cols-7 gap-1">
            {visibleDays.map((date) => {
              const isoDate = toIsoDate(date);
              const isSelectedStart = startDate === isoDate;
              const isSelectedEnd = endDate === isoDate;
              const isSelected = isSelectedStart || isSelectedEnd;
              const isInRange = isDateInRange(isoDate, startDate, endDate);
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isToday = isoDate === toIsoDate(new Date());

              return (
                <button
                  key={isoDate}
                  type="button"
                  className={cn(
                    "h-9 rounded-lg text-sm font-medium transition",
                    isCurrentMonth ? "text-slate-700 hover:bg-slate-100" : "text-slate-300 hover:bg-slate-50",
                    isToday && "ring-1 ring-slate-300",
                    isInRange && "bg-slate-100",
                    isSelected && "bg-slate-900 text-white hover:bg-slate-900"
                  )}
                  onClick={() => handleSelect(isoDate)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex justify-between gap-2 border-t border-slate-100 pt-3">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onChange({ startDate: "", endDate: "" });
                setIsOpen(false);
              }}
            >
              Clear
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
