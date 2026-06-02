import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type IconOption = {
  value: string;
  label: string;
  icon: LucideIcon;
};

export function IconPicker({
  value,
  options,
  onChange,
  ariaLabel
}: {
  value: string;
  options: IconOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            aria-label={option.label}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 w-9 rounded-lg border-2 flex items-center justify-center transition-all",
              isActive
                ? "border-ink bg-surface-subtle"
                : "border-transparent hover:bg-surface-subtle"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        );
      })}
    </div>
  );
}
