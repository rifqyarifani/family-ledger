import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label: string;
  children: ReactNode;
  error?: string;
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
