import { ChevronDown, Plus } from "lucide-react";
import { useMemo } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { Id } from "@/convex/_generated/dataModel";
import { ActionRow } from "./action-row";
import { EditableField } from "./editable-field";
import { NodeOptionsMenu } from "./node-options-menu";
import { StatusBadge } from "./status-badge";
import type { Deliverable } from "./types";
import { sortByOrder } from "./utils";

export type DeliverableItemProps = {
  deliverable: Deliverable;
  outcomeId: Id<"outcomes">;
  index: number;
};

export function DeliverableItem({
  deliverable,
  outcomeId,
}: DeliverableItemProps) {
  const actions = useMemo(
    () => sortByOrder(deliverable.actions ?? []),
    [deliverable.actions],
  );
  const completedActions = actions.filter(
    (item) => item.status === "done",
  ).length;
  const totalActions = actions.length;

  return (
    <div className="bg-card p-1 flex flex-col gap-1 border-b">
      <Collapsible className="w-full flex gap-1">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="icon">
            <ChevronDown className="size-4" />
          </Button>
        </CollapsibleTrigger>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 relative w-full justify-between items-center">
            <EditableField
              value={deliverable.title ?? ""}
              onSave={(nextValue) =>
                console.log("[UI] save deliverable title", {
                  deliverableId: deliverable.id,
                  value: nextValue,
                })
              }
              placeholder="Add a deliverable title"
              displayClassName="text-sm font-medium leading-tight"
              editorClassName="text-sm font-medium leading-tight"
            />

            <div className="flex items-center gap-1">
              <StatusBadge status={deliverable.status} />

              <NodeOptionsMenu
                onAiAdjust={() =>
                  console.log(
                    "[UI] AI adjust deliverable",
                    deliverable.id,
                    outcomeId,
                  )
                }
                onDelete={() =>
                  console.log(
                    "[UI] delete deliverable",
                    deliverable.id,
                    outcomeId,
                  )
                }
              />
            </div>
          </div>

          <CollapsibleContent>
            <div className="flex flex-col">
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

            <div className="flex flex-wrap items-center justify-between gap-2">
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
        </div>
      </Collapsible>
    </div>
  );
}
