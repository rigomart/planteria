import {
  ArrowUpDown,
  CheckCircle2,
  Pencil,
  Sparkles,
  Trash2,
} from "lucide-react";
import { NodeActionButton } from "./node-action-button";

type NodeActionGroupProps = {
  onEdit: () => void;
  onStatus: () => void;
  onAiAdjust: () => void;
  onReorder: () => void;
  onDelete: () => void;
};

export function NodeActionGroup({
  onEdit,
  onStatus,
  onAiAdjust,
  onReorder,
  onDelete,
}: NodeActionGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <NodeActionButton icon={Pencil} label="Edit" onClick={onEdit} />
      <NodeActionButton icon={CheckCircle2} label="Status" onClick={onStatus} />
      <NodeActionButton
        icon={Sparkles}
        label="AI adjust"
        onClick={onAiAdjust}
      />
      <NodeActionButton
        icon={ArrowUpDown}
        label="Reorder"
        onClick={onReorder}
      />
      <NodeActionButton icon={Trash2} label="Delete" onClick={onDelete} />
    </div>
  );
}
