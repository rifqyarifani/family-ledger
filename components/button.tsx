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
        variant === "primary" && "bg-[#9fe870] text-[#0e0f0c] hover:bg-[#cdffad]",
        variant === "secondary" && "border border-[#cfd5ca] bg-[#e8ebe6] text-[#0e0f0c] hover:bg-[#e2f6d5]",
        variant === "ghost" && "text-[#454745] hover:bg-[#e8ebe6] hover:text-[#0e0f0c]",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        className
      )}
      {...props}
    />
  );
}
