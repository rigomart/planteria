import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ChevronDown, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { EditableField } from "./editable-field";
import { useOutlineSelection } from "./outline-selection-context";
import { PlanActions } from "./plan-actions";
import { StatusBadge } from "./status-badge";

export type DeliverableItemProps = {
  deliverable: FunctionReturnType<typeof api.deliverables.queries.listByOutcome>[number];
  outcomeId: Id<"outcomes">;
  index: number;
};

export function DeliverableItem({ deliverable, outcomeId }: DeliverableItemProps) {
  const actions = useQuery(api.actions.listByDeliverable, {
    deliverableId: deliverable.id,
  });

  const { selectedNode, clearSelection } = useOutlineSelection();

  const isSelected =
    selectedNode?.type === "deliverable" && selectedNode.deliverableId === deliverable.id;

  const updateDeliverable = useMutation(api.deliverables.updateDeliverable).withOptimisticUpdate(
    (localStore, args) => {
      const deliverables = localStore.getQuery(api.deliverables.queries.listByOutcome, {
        outcomeId,
      });

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
    },
  );

  const updateDeliverableStatus = useMutation(
    api.deliverables.updateDeliverableStatus,
  ).withOptimisticUpdate((localStore, args) => {
    const deliverables = localStore.getQuery(api.deliverables.queries.listByOutcome, { outcomeId });

    if (deliverables !== undefined) {
      const nextDeliverables = deliverables.map((item) =>
        item.id === args.deliverableId
          ? { ...item, status: args.status, updatedAt: Date.now() }
          : item,
      );

      localStore.setQuery(api.deliverables.queries.listByOutcome, { outcomeId }, nextDeliverables);
    }
  });

  const deleteDeliverable = useMutation(api.deliverables.deleteDeliverable).withOptimisticUpdate(
    (localStore, args) => {
      const deliverables = localStore.getQuery(api.deliverables.queries.listByOutcome, {
        outcomeId,
      });

      if (deliverables !== undefined) {
        const remaining = deliverables
          .filter((item) => item.id !== args.deliverableId)
          .map((item, index) => ({ ...item, order: index }));

        localStore.setQuery(api.deliverables.queries.listByOutcome, { outcomeId }, remaining);
      }
    },
  );

  const handleUpdateStatus = async (
    nextStatus: FunctionReturnType<typeof api.deliverables.queries.listByOutcome>[number]["status"],
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
      if (selectedNode?.type === "deliverable" && selectedNode.deliverableId === deliverable.id) {
        clearSelection();
      }
    } catch (error) {
      console.error("Failed to delete deliverable", error);
    }
  };

  return (
    <div
      className={cn(
        "group rounded-lg border bg-card/50 transition-colors",
        isSelected ? "border-primary/60 bg-primary/5" : "border-border/30",
      )}
    >
      <Collapsible defaultOpen={false}>
        <div className="flex items-start gap-2 p-3">
          <CollapsibleTrigger className="flex-shrink-0 mt-1">
            <ChevronDown className="size-4 text-muted-foreground transition-transform [[data-state=closed]_&]:rotate-[-90deg]" />
          </CollapsibleTrigger>

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <EditableField
                value={deliverable.title ?? ""}
                onSave={async (nextValue) => {
                  try {
                    await updateDeliverable({
                      deliverableId: deliverable.id,
                      title: nextValue,
                    });
                  } catch (error) {
                    console.error("Failed to update deliverable title", error);
                  }
                }}
                placeholder="Deliverable title"
                displayClassName="text-sm font-medium text-foreground"
                editorClassName="text-sm font-medium"
              />

              <div className="flex items-center gap-1 flex-shrink-0">
                <StatusBadge
                  status={deliverable.status}
                  onChange={handleUpdateStatus}
                  className="text-[10px] px-2 py-0.5"
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-6 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={handleDeleteDeliverable}
                    >
                      <Trash className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {deliverable.doneWhen && (
              <p className="text-xs text-muted-foreground">Done when: {deliverable.doneWhen}</p>
            )}
          </div>
        </div>

        <CollapsibleContent>
          <div className="border-t border-border/30 px-3 pb-3 pt-2 space-y-2">
            <EditableField
              value={deliverable.doneWhen ?? ""}
              onSave={async (nextValue) => {
                try {
                  await updateDeliverable({
                    deliverableId: deliverable.id,
                    doneWhen: nextValue,
                  });
                } catch (error) {
                  console.error("Failed to update deliverable doneWhen", error);
                }
              }}
              placeholder="When is this done?"
              displayClassName="text-xs text-muted-foreground"
              editorClassName="text-xs"
            />

            {actions === undefined ? (
              <div className="text-xs text-muted-foreground">Loading...</div>
            ) : (
              <PlanActions actions={actions} deliverableId={deliverable.id} />
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
