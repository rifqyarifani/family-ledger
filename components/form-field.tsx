import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import {
  handleBlockedNumberKeys,
  sanitizeFormattedAmount
} from "@/lib/format-utils";
import { cn } from "@/lib/utils";
import { MAX_NAME_LENGTH } from "@/lib/validation";

type FieldProps = {
  label: string;
  children: ReactNode;
  error?: string | null;
};

export function Field({ label, children, error }: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink-secondary">{label}</span>
      <div className="mt-1">{children}</div>
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-surface-border bg-white px-3 text-sm text-ink placeholder:text-ink-muted disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-muted",
        className
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-xl border border-surface-border bg-white px-3 text-sm text-ink disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-muted",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full rounded-xl border border-surface-border bg-white px-3 py-2 text-sm text-ink placeholder:text-ink-muted disabled:cursor-not-allowed disabled:bg-surface disabled:text-ink-muted",
        className
      )}
      {...props}
    />
  );
}

type CappedTextInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "maxLength" | "onChange" | "value"> & {
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  showCounter?: boolean;
};

export function CappedTextInput({
  value,
  onChange,
  maxLength = MAX_NAME_LENGTH,
  showCounter = true,
  className,
  ...props
}: CappedTextInputProps) {
  return (
    <>
      <Input
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value.slice(0, maxLength))}
        className={className}
        {...props}
      />
      {showCounter ? (
        <p className="mt-1 text-right text-xs text-ink-muted">
          {value.length}/{maxLength}
        </p>
      ) : null}
    </>
  );
}

type MoneyInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange" | "value" | "onKeyDown"> & {
  value: string;
  onChange: (value: string) => void;
};

export function MoneyInput({ value, onChange, className, ...props }: MoneyInputProps) {
  return (
    <Input
      type="text"
      inputMode="decimal"
      value={value}
      onKeyDown={handleBlockedNumberKeys}
      onChange={(event) => onChange(sanitizeFormattedAmount(event.target.value))}
      className={cn("no-spinner", className)}
      {...props}
    />
  );
}
