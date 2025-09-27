import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ActionRow } from "./action-row";
import { EditableField } from "./editable-field";
import { NodeOptionsMenu } from "./node-options-menu";
import { StatusBadge } from "./status-badge";
import type { DeliverableItemProps } from "./types";
import { sortByOrder } from "./utils";

export function DeliverableItem({
  deliverable,
  outcomeId,
  index,
}: DeliverableItemProps) {
  const [showActions, setShowActions] = useState(false);
  const actions = useMemo(
    () => sortByOrder(deliverable.actions ?? []),
    [deliverable.actions],
  );
  const completedActions = actions.filter(
    (item) => item.status === "done",
  ).length;
  const totalActions = actions.length;
  const ToggleIcon = showActions ? ChevronDown : ChevronRight;

  return (
    <div className="bg-card p-3 flex flex-col gap-1 border-b">
      <div className="flex flex-col gap-2 relative">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Deliverable {index + 1}
          </span>
          <StatusBadge status={deliverable.status} />
        </div>

        <div className="flex flex-col">
          <EditableField
            value={deliverable.title ?? ""}
            onSave={(nextValue) =>
              console.log("[UI] save deliverable title", {
                deliverableId: deliverable.id,
                value: nextValue,
              })
            }
            placeholder="Add a deliverable title"
            displayClassName="text-base font-medium leading-tight"
            editorClassName="text-base font-medium leading-tight"
          />
          <EditableField
            value={deliverable.doneWhen ?? ""}
            onSave={(nextValue) =>
              console.log("[UI] save deliverable doneWhen", {
                deliverableId: deliverable.id,
                value: nextValue,
              })
            }
            placeholder="Add a deliverable doneWhen"
            displayClassName="text-sm text-muted-foreground"
            editorClassName="text-sm"
          />
          {deliverable.notes ? (
            <Alert>
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>{deliverable.notes}</AlertDescription>
            </Alert>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1 absolute top-0 right-0">
          <NodeOptionsMenu
            onAiAdjust={() =>
              console.log(
                "[UI] AI adjust deliverable",
                deliverable.id,
                outcomeId,
              )
            }
            onDelete={() =>
              console.log("[UI] delete deliverable", deliverable.id, outcomeId)
            }
          />
        </div>
      </div>
      <div className="space-y-4">
        <Collapsible open={showActions} onOpenChange={setShowActions}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2"
              >
                <ToggleIcon className="size-4" />
                {showActions
                  ? "Hide actions"
                  : `Show actions (${totalActions})`}
              </Button>
            </CollapsibleTrigger>
            {totalActions > 0 ? (
              <span className="text-xs text-muted-foreground">
                {completedActions}/{totalActions} done
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                No actions yet
              </span>
            )}
          </div>
          <CollapsibleContent>
            <div className="flex flex-col gap-2">
              {totalActions > 0 ? (
                <ul className="flex flex-col gap-2">
                  {actions.map((action) => (
                    <ActionRow
                      key={action.id}
                      action={action}
                      deliverableId={deliverable.id}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No actions yet. Create a few to make this deliverable
                  unambiguous.
                </p>
              )}
              <Button
                type="button"
                variant="dashed"
                onClick={() =>
                  console.log("[UI] add action", deliverable.id, outcomeId)
                }
              >
                <Plus className="mr-2 size-4" /> Add action
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
