import { randomInt } from "node:crypto";

export const householdCodeLength = 6;

export const householdCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function normalizeHouseholdCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, householdCodeLength);
}

export function formatHouseholdCode(value: string) {
  return normalizeHouseholdCode(value);
}

const blocklist = new Set(["BUBUR", "MAKAN", "MINUM", "MANDI", "KAKAK", "ADIK"]);

export function generateHouseholdCode() {
  for (let attempt = 0; attempt < 64; attempt += 1) {
    const code = Array.from({ length: householdCodeLength }, () =>
      householdCodeAlphabet[randomInt(householdCodeAlphabet.length)]
    ).join("");

    if (!blocklist.has(code)) {
      return code;
    }
  }

  return Array.from({ length: householdCodeLength }, () =>
    householdCodeAlphabet[randomInt(householdCodeAlphabet.length)]
  ).join("");
}
