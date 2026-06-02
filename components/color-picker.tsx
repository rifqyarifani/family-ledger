import { cn } from "@/lib/utils";

export type ColorOption = {
  value: string;
  label: string;
};

export function ColorPicker({
  value,
  options,
  onChange,
  ariaLabel
}: {
  value: string;
  options: ColorOption[];
  onChange: (value: string) => void;
  ariaLabel?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={ariaLabel}>
      {options.map((option) => {
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
              "h-8 w-8 rounded-full border-2 transition-all",
              isActive
                ? "border-ink scale-110"
                : "border-transparent hover:scale-105"
            )}
            style={{ backgroundColor: option.value }}
          />
        );
      })}
    </div>
  );
}
