import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ActionRow } from "./action-row";
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
    <Card className="border-l-2 border-l-primary/40">
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Deliverable {index + 1}
          </span>
          <StatusBadge status={deliverable.status} />
        </div>
        <h3 className="text-base font-medium leading-tight">
          {deliverable.title}
        </h3>
        <p className="text-sm text-muted-foreground">
          Done when{" "}
          <span className="text-foreground/90">{deliverable.doneWhen}</span>
        </p>
        {deliverable.notes ? (
          <Alert>
            <AlertTitle>Note</AlertTitle>
            <AlertDescription>{deliverable.notes}</AlertDescription>
          </Alert>
        ) : null}

        <CardAction className="flex flex-wrap items-center gap-1">
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
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4 border-t border-border/40">
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
            <div className="mt-3 flex flex-col gap-2">
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
                variant="ghost"
                onClick={() =>
                  console.log("[UI] add action", deliverable.id, outcomeId)
                }
                className="w-full border-dashed border border-primary/10"
              >
                <Plus className="mr-2 size-4" /> Add action
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
}
