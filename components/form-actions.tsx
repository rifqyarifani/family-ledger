import { Button } from "@/components/button";

export function FormActions({
  submitLabel,
  onCancel
}: {
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 sm:col-span-2 sm:flex-row sm:justify-end">
      <Button variant="secondary" className="w-full sm:w-auto" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" className="w-full sm:w-auto">
        {submitLabel}
      </Button>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700 sm:col-span-2">{message}</p>;
}
