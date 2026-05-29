import type { KeyboardEvent } from "react";

const blockedNumberKeys = new Set(["e", "E", "+", "-"]);

export function formatInputAmount(value: number) {
  return new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value);
}

export function parseFormattedAmount(value: string) {
  if (!value.trim()) {
    return Number.NaN;
  }

  const normalized = value.replace(/\./g, "").replace(",", ".");
  return Number(normalized);
}

export function sanitizeFormattedAmount(value: string) {
  const cleaned = value.replace(/[^\d,.]/g, "");
  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const [integerPartRaw, decimalPartRaw = ""] = normalized.split(".");
  const integerPart = integerPartRaw.replace(/^0+(?=\d)/, "") || integerPartRaw || "0";
  const decimalPart = decimalPartRaw.replace(/\./g, "").slice(0, 2);
  const numericString = decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
  const numericValue = Number(numericString);

  if (!Number.isFinite(numericValue)) {
    return "";
  }

  const formattedInteger = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 0
  }).format(Number(integerPart));

  return decimalPart ? `${formattedInteger},${decimalPart}` : formattedInteger;
}

export function handleBlockedNumberKeys(event: KeyboardEvent<HTMLInputElement>) {
  if (blockedNumberKeys.has(event.key)) {
    event.preventDefault();
  }
}

export function normalizeGoalName(value: string) {
  return value.trim().toLowerCase();
}
