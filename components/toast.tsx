import { cn } from "@/lib/utils";

export type ToastTone = "success" | "error" | "info";

const toneStyles: Record<ToastTone, string> = {
  success: "border-brand-green/30 bg-brand-green-pale text-brand-green-dark",
  error: "border-red-200 bg-red-50 text-red-700",
  info: "border-slate-200 bg-white text-ink"
};

const toneLabels: Record<ToastTone, string> = {
  success: "Success",
  error: "Error",
  info: "Info"
};

export type ToastProps = {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
  onDismiss: (id: string) => void;
};

export function Toast({ id, tone, title, description, onDismiss }: ToastProps) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      aria-live={tone === "error" ? "assertive" : "polite"}
      aria-atomic="true"
      className={cn(
        "pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-green focus-visible:ring-offset-2",
        toneStyles[tone]
      )}
      onClick={() => onDismiss(id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onDismiss(id);
        }
      }}
      tabIndex={0}
    >
      <span className="sr-only">{toneLabels[tone]}:</span>
      <div className="flex-1 text-sm">
        <p className="font-semibold">{title}</p>
        {description ? <p className="mt-0.5 text-xs opacity-90">{description}</p> : null}
      </div>
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDismiss(id);
        }}
        className="rounded-full p-1 text-current opacity-60 transition hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-current"
        aria-label="Dismiss notification"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M3 3L11 11M11 3L3 11"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
