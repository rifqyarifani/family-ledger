import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "icon";
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        size === "md" && "h-10 px-4 text-sm",
        size === "sm" && "h-8 px-3 text-xs",
        size === "icon" && "h-10 w-10 rounded-full",
        variant === "primary" && "bg-brand-green text-ink hover:bg-brand-green-light",
        variant === "secondary" && "border border-surface-border bg-surface text-ink hover:bg-brand-green-pale",
        variant === "ghost" && "text-ink-secondary hover:bg-surface hover:text-ink",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className
      )}
      {...props}
    />
  );
}
