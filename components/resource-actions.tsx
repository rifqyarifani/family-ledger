import { Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/button";

export function ResourceActions({
  editLabel,
  deleteLabel,
  onEdit,
  onDelete
}: {
  editLabel: string;
  deleteLabel: string;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex shrink-0 gap-1">
      <Button variant="ghost" size="icon" onClick={onEdit} aria-label={editLabel}>
        <Edit2 className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Button variant="ghost" size="icon" onClick={onDelete} aria-label={deleteLabel}>
        <Trash2 className="h-4 w-4 text-red-600" aria-hidden="true" />
      </Button>
    </div>
  );
}
