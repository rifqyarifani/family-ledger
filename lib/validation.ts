export const MAX_NAME_LENGTH = 30;

type ValidatorResult = string | null;

export function requiredString(value: string, label = "This field") {
  if (!value || !value.trim()) {
    return `${label} is required.`;
  }
  return null;
}

export function maxLength(value: string, max: number, label = "This field") {
  if (value.length > max) {
    return `${label} must be ${max} characters or fewer.`;
  }
  return null;
}

export function cappedName(value: string, label = "Name") {
  return requiredString(value, label) ?? maxLength(value, MAX_NAME_LENGTH, label);
}

export function positiveAmount(
  rawValue: string,
  parseAmount: (value: string) => number,
  label = "Amount"
) {
  if (!rawValue || !rawValue.trim()) {
    return `${label} is required.`;
  }
  const numeric = parseAmount(rawValue);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return `${label} must be a positive number.`;
  }
  return null;
}

export function nonNegativeAmount(
  rawValue: string,
  parseAmount: (value: string) => number,
  label = "Amount"
) {
  if (!rawValue || !rawValue.trim()) {
    return `${label} is required.`;
  }
  const numeric = parseAmount(rawValue);
  if (!Number.isFinite(numeric) || numeric < 0) {
    return `${label} must be zero or a positive number.`;
  }
  return null;
}

export function mustSelect(value: string, label = "This field") {
  if (!value) {
    return `Choose ${label.toLowerCase()}.`;
  }
  return null;
}

export function composeValidators(
  ...validators: Array<ValidatorResult>
): ValidatorResult {
  for (const result of validators) {
    if (result) {
      return result;
    }
  }
  return null;
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}(:\d{2})?$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidISODate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }
  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

export function isValidTime(value: string): boolean {
  if (!TIME_PATTERN.test(value)) {
    return false;
  }
  const parts = value.split(":");
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
}

export function isValidMonthKey(value: string): boolean {
  if (!MONTH_KEY_PATTERN.test(value)) {
    return false;
  }
  const month = Number(value.slice(5, 7));
  return month >= 1 && month <= 12;
}

export function isValidUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

