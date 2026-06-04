import {
  Children,
  cloneElement,
  isValidElement,
  useId,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes
} from "react";
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
  hint?: ReactNode;
};

export function Field({ label, children, error, hint }: FieldProps) {
  const generatedId = useId();
  const errorId = `${generatedId}-error`;
  const hintId = `${generatedId}-hint`;
  const describedBy = [
    hint ? hintId : null,
    error ? errorId : null
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  const enhancedChildren = Children.map(children, (child) => {
    if (!isValidElement(child)) {
      return child;
    }
    const element = child as ReactElement<{
      id?: string;
      "aria-describedby"?: string;
      "aria-invalid"?: boolean;
    }>;
    const existingDescribedBy = element.props["aria-describedby"];
    const combined = [existingDescribedBy, describedBy].filter(Boolean).join(" ") || undefined;
    return cloneElement(element, {
      id: element.props.id ?? generatedId,
      "aria-describedby": combined,
      "aria-invalid": error ? true : undefined
    });
  });

  return (
    <div className="block">
      <label htmlFor={generatedId} className="block text-sm font-semibold text-ink-secondary">
        {label}
      </label>
      <div className="mt-1">{enhancedChildren}</div>
      {hint && !error ? (
        <p id={hintId} className="mt-1 text-xs text-ink-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="mt-1 text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
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
