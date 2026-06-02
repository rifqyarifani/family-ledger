"use client";

import { useCallback, useState } from "react";

export type FormErrors = Record<string, string | null>;

export function useFormErrors() {
  const [errors, setErrors] = useState<FormErrors>({});

  const setAll = useCallback((next: FormErrors) => {
    setErrors(next);
  }, []);

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors((current) => ({ ...current, [field]: message }));
  }, []);

  const clearField = useCallback((field: string) => {
    setErrors((current) => {
      if (!(field in current)) {
        return current;
      }
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setErrors((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, []);

  const hasErrors = Object.keys(errors).length > 0;

  return {
    errors,
    hasErrors,
    setAll,
    setFieldError,
    clearField,
    clearAll
  };
}
