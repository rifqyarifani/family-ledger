import { randomInt } from "node:crypto";

export const householdCodeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export const householdCodeLength = 6;

export function normalizeHouseholdCode(value: string) {
  const normalized = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return normalized.startsWith("FL") ? normalized.slice(2) : normalized;
}

export function formatHouseholdCode(value: string) {
  const code = normalizeHouseholdCode(value).slice(0, householdCodeLength);
  return code ? `FL-${code}` : "";
}

export function generateHouseholdCode() {
  let code = "";

  for (let index = 0; index < householdCodeLength; index += 1) {
    code += householdCodeAlphabet[randomInt(householdCodeAlphabet.length)];
  }

  return `FL-${code}`;
}
