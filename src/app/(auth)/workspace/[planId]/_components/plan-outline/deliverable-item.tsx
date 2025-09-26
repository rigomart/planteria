import {
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
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
import { NodeActionButton } from "./node-action-button";
import { StatusBadge } from "./status-badge";
import type { DeliverableItemProps } from "./types";
import { ensureStatus, sortByOrder } from "./utils";

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
    (item) => ensureStatus(item.status) === "done",
  ).length;
  const totalActions = actions.length;
  const ToggleIcon = showActions ? ChevronDown : ChevronRight;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Deliverable {index + 1}
          </span>
          <StatusBadge status={ensureStatus(deliverable.status)} />
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
          <NodeActionButton
            icon={Pencil}
            label="Edit deliverable"
            onClick={() =>
              console.log("[UI] edit deliverable", deliverable.id, outcomeId)
            }
          />
          <NodeActionButton
            icon={CheckCircle2}
            label="Update status"
            onClick={() =>
              console.log("[UI] status deliverable", deliverable.id, outcomeId)
            }
          />
          <NodeActionButton
            icon={Sparkles}
            label="AI adjust"
            onClick={() =>
              console.log(
                "[UI] AI adjust deliverable",
                deliverable.id,
                outcomeId,
              )
            }
          />
          <NodeActionButton
            icon={ArrowUpDown}
            label="Reorder"
            onClick={() =>
              console.log("[UI] reorder deliverable", deliverable.id, outcomeId)
            }
          />
          <NodeActionButton
            icon={Trash2}
            label="Delete"
            onClick={() =>
              console.log("[UI] delete deliverable", deliverable.id, outcomeId)
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-4 border-t border-border/40 pt-6">
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
                  {actions.map((action, actionIndex) => (
                    <ActionRow
                      key={action.id}
                      action={action}
                      deliverableId={deliverable.id}
                      index={actionIndex}
                    />
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No actions yet. Create a few to make this deliverable
                  unambiguous.
                </p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() =>
            console.log("[UI] add action", deliverable.id, outcomeId)
          }
        >
          <Plus className="mr-2 size-4" /> Add action
        </Button>
      </CardContent>
    </Card>
  );
}
