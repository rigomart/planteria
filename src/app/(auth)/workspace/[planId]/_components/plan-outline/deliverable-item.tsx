import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Trash } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleChevronTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EditableField } from "./editable-field";
import { PlanActions } from "./plan-actions";
import { StatusBadge } from "./status-badge";

export type DeliverableItemProps = {
  deliverable: FunctionReturnType<
    typeof api.deliverables.queries.listByOutcome
  >[number];
  outcomeId: Id<"outcomes">;
  index: number;
};

export function DeliverableItem({
  deliverable,
  outcomeId,
}: DeliverableItemProps) {
  const actions = useQuery(api.actions.listByDeliverable, {
    deliverableId: deliverable.id,
  });

  const updateDeliverable = useMutation(
    api.deliverables.updateDeliverable,
  ).withOptimisticUpdate((localStore, args) => {
    const deliverables = localStore.getQuery(
      api.deliverables.queries.listByOutcome,
      { outcomeId },
    );

    if (deliverables !== undefined) {
      const nextDeliverables = deliverables.map((item) => {
        if (item.id !== args.deliverableId) {
          return item;
        }

        const nextItem = {
          ...item,
          updatedAt: Date.now(),
        };

        if (args.title !== undefined) {
          nextItem.title = args.title;
        }

        if (args.doneWhen !== undefined) {
          nextItem.doneWhen = args.doneWhen;
        }

        if (args.notes !== undefined) {
          nextItem.notes = args.notes ?? null;
        }

        return nextItem;
      });

      localStore.setQuery(
        api.deliverables.queries.listByOutcome,
        { outcomeId },
        nextDeliverables,
      );
    }
  });

  const updateDeliverableStatus = useMutation(
    api.deliverables.updateDeliverableStatus,
  ).withOptimisticUpdate((localStore, args) => {
    const deliverables = localStore.getQuery(
      api.deliverables.queries.listByOutcome,
      { outcomeId },
    );

    if (deliverables !== undefined) {
      const nextDeliverables = deliverables.map((item) =>
        item.id === args.deliverableId
          ? { ...item, status: args.status, updatedAt: Date.now() }
          : item,
      );

      localStore.setQuery(
        api.deliverables.queries.listByOutcome,
        { outcomeId },
        nextDeliverables,
      );
    }
  });

  const deleteDeliverable = useMutation(
    api.deliverables.deleteDeliverable,
  ).withOptimisticUpdate((localStore, args) => {
    const deliverables = localStore.getQuery(
      api.deliverables.queries.listByOutcome,
      { outcomeId },
    );

    if (deliverables !== undefined) {
      const remaining = deliverables
        .filter((item) => item.id !== args.deliverableId)
        .map((item, index) => ({ ...item, order: index }));

      localStore.setQuery(
        api.deliverables.queries.listByOutcome,
        { outcomeId },
        remaining,
      );
    }
  });

  const handleUpdateTitle = async (nextValue: string) => {
    try {
      await updateDeliverable({
        deliverableId: deliverable.id,
        title: nextValue,
      });
    } catch (error) {
      console.error("Failed to update deliverable title", error);
    }
  };

  const handleUpdateDoneWhen = async (nextValue: string) => {
    try {
      await updateDeliverable({
        deliverableId: deliverable.id,
        doneWhen: nextValue,
      });
    } catch (error) {
      console.error("Failed to update deliverable doneWhen", error);
    }
  };

  const handleUpdateStatus = async (
    nextStatus: FunctionReturnType<
      typeof api.deliverables.queries.listByOutcome
    >[number]["status"],
  ) => {
    try {
      await updateDeliverableStatus({
        deliverableId: deliverable.id,
        status: nextStatus,
      });
    } catch (error) {
      console.error("Failed to update deliverable status", error);
    }
  };

  const handleDeleteDeliverable = async () => {
    try {
      await deleteDeliverable({ deliverableId: deliverable.id });
    } catch (error) {
      console.error("Failed to delete deliverable", error);
    }
  };

  return (
    <div className="bg-card p-1 flex flex-col gap-1 border-b">
      <Collapsible className="w-full flex gap-1">
        <CollapsibleChevronTrigger aria-label="Toggle deliverable" />
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 relative justify-between items-center">
            <EditableField
              value={deliverable.title ?? ""}
              onSave={handleUpdateTitle}
              placeholder="Add a deliverable title"
              displayClassName="text-base font-medium leading-tight"
              editorClassName="text-base font-medium leading-tight"
            />

            <div className="flex items-center gap-1">
              <StatusBadge
                status={deliverable.status}
                onChange={handleUpdateStatus}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                onClick={handleDeleteDeliverable}
                aria-label="Delete deliverable"
              >
                <Trash className="size-4" />
              </Button>
            </div>
          </div>

          <CollapsibleContent className="space-y-3">
            <div className="flex flex-col">
              <EditableField
                value={deliverable.doneWhen ?? ""}
                onSave={handleUpdateDoneWhen}
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

            {actions === undefined ? (
              <div className="text-sm text-muted-foreground">
                Loading actions...
              </div>
            ) : (
              <PlanActions actions={actions} deliverableId={deliverable.id} />
            )}
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
}
