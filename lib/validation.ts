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
