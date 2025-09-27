import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { EditableField } from "./editable-field";
import { StatusBadge } from "./status-badge";
import type { ActionItem } from "./types";

type PlanActionsProps = {
  actions: ActionItem[];
  deliverableId: Id<"deliverables">;
};

export function PlanActions({ actions, deliverableId }: PlanActionsProps) {
  return (
    <div className="flex flex-col gap-2">
      <ActionsList actions={actions} />
      <Button
        type="button"
        variant="dashed"
        size="sm"
        onClick={() => console.log("[UI] add action", deliverableId)}
        className="self-start"
      >
        <Plus className="mr-2 size-4" /> Add action
      </Button>
    </div>
  );
}

type ActionsListProps = {
  actions: ActionItem[];
};

function ActionsList({ actions }: ActionsListProps) {
  if (actions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No actions yet. Create a few to make this deliverable unambiguous.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {actions.map((action) => (
        <li
          key={action.id}
          className="group flex items-center justify-between rounded-lg border border-transparent bg-background/40 px-3 py-2 text-sm transition hover:border-border/60 hover:bg-muted/20"
        >
          <div className="flex items-center gap-3 justify-between w-full">
            <EditableField
              value={action.title ?? ""}
              onSave={(nextValue) =>
                console.log("[UI] save action title", {
                  actionId: action.id,
                  value: nextValue,
                })
              }
              placeholder="Add a brief action title"
              displayClassName="text-xs text-muted-foreground"
              editorClassName="text-xs"
            />

            <div className="flex items-center gap-1">
              <StatusBadge status={action.status} />

              <Button variant="ghost" size="icon">
                <Trash className="size-4" />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
