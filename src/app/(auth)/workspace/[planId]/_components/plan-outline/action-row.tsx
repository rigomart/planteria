import { ArrowUpDown, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { NodeActionButton } from "./node-action-button";
import { StatusBadge } from "./status-badge";
import type { ActionRowProps } from "./types";
import { ensureStatus } from "./utils";

export function ActionRow({ action, deliverableId, index }: ActionRowProps) {
  return (
    <li className="group flex items-center justify-between rounded-lg border border-transparent bg-background/40 px-3 py-2 text-sm transition hover:border-border/60 hover:bg-muted/20">
      <div className="flex items-center gap-3">
        <StatusBadge
          status={ensureStatus(action.status)}
          className="px-2 py-0.5 text-[11px]"
        />
        <div className="flex flex-col">
          <span className="font-medium leading-tight">{action.title}</span>
          <span className="text-xs text-muted-foreground">
            Action {index + 1}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <NodeActionButton
          icon={CheckCircle2}
          label="Toggle status"
          onClick={() =>
            console.log("[UI] toggle action status", action.id, deliverableId)
          }
        />
        <NodeActionButton
          icon={Pencil}
          label="Edit action"
          onClick={() =>
            console.log("[UI] edit action", action.id, deliverableId)
          }
        />
        <NodeActionButton
          icon={ArrowUpDown}
          label="Reorder"
          onClick={() =>
            console.log("[UI] reorder action", action.id, deliverableId)
          }
        />
        <NodeActionButton
          icon={Trash2}
          label="Delete"
          onClick={() =>
            console.log("[UI] delete action", action.id, deliverableId)
          }
        />
      </div>
    </li>
  );
}
