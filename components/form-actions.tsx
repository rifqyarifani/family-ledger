import { Button } from "@/components/button";

export function FormActions({
  submitLabel,
  onCancel,
  pending = false,
  pendingLabel
}: {
  submitLabel: string;
  onCancel: () => void;
  pending?: boolean;
  pendingLabel?: string;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
      <Button
        variant="secondary"
        className="w-full sm:w-auto"
        onClick={onCancel}
        disabled={pending}
      >
        Cancel
      </Button>
      <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
        {pending ? (pendingLabel ?? "Saving...") : submitLabel}
      </Button>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <p className="rounded-2xl border border-surface-border bg-surface-subtle p-3 text-sm text-ink-secondary sm:col-span-2">{message}</p>;
}
