import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { MousePointerClick, Plus, Trash } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleChevronTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { DeliverableItem } from "./deliverable-item";
import { EditableField } from "./editable-field";
import { useOutlineSelection } from "./outline-selection-context";
import { StatusBadge } from "./status-badge";

export type OutcomeSectionProps = {
  planId: Id<"plans">;
  outcome: FunctionReturnType<typeof api.outcomes.queries.listByPlan>[number];
  index: number;
  shouldScrollIntoView?: boolean;
  onScrollHandled?: () => void;
};

export function OutcomeSection({
  planId,
  outcome,
  index,
  shouldScrollIntoView = false,
  onScrollHandled,
}: OutcomeSectionProps) {
  const deliverables = useQuery(api.deliverables.queries.listByOutcome, {
    outcomeId: outcome.id,
  });

  const { selectedNode, selectOutcome, selectDeliverable, clearSelection } =
    useOutlineSelection();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const updateOutcome = useMutation(
    api.outcomes.updateOutcome,
  ).withOptimisticUpdate((localStore, args) => {
    const outcomes = localStore.getQuery(api.outcomes.queries.listByPlan, {
      planId,
    });

    if (outcomes !== undefined) {
      const nextOutcomes = outcomes.map((item) => {
        if (item.id !== args.outcomeId) {
          return item;
        }

        const nextItem = {
          ...item,
          updatedAt: Date.now(),
        };

        if (args.title !== undefined) {
          nextItem.title = args.title;
        }

        if (args.summary !== undefined) {
          nextItem.summary = args.summary;
        }

        if (args.status !== undefined) {
          nextItem.status = args.status;
        }

        return nextItem;
      });

      localStore.setQuery(
        api.outcomes.queries.listByPlan,
        { planId },
        nextOutcomes,
      );
    }
  });

  const deleteOutcome = useMutation(
    api.outcomes.deleteOutcome,
  ).withOptimisticUpdate((localStore, args) => {
    const outcomes = localStore.getQuery(api.outcomes.queries.listByPlan, {
      planId,
    });

    if (outcomes !== undefined) {
      const remaining = outcomes
        .filter((item) => item.id !== args.outcomeId)
        .map((item, index) => ({ ...item, order: index }));

      localStore.setQuery(
        api.outcomes.queries.listByPlan,
        { planId },
        remaining,
      );
    }
  });

  const addDeliverable = useMutation(
    api.deliverables.addDeliverable,
  ).withOptimisticUpdate((localStore, args) => {
    const current = localStore.getQuery(
      api.deliverables.queries.listByOutcome,
      {
        outcomeId: args.outcomeId,
      },
    );

    if (current !== undefined) {
      const now = Date.now();
      const tempDeliverable = {
        id: `temp-${now}` as Id<"deliverables">,
        title: args.title,
        doneWhen: args.doneWhen,
        notes: null,
        status: "todo" as const,
        order: current.length,
        createdAt: now,
        updatedAt: now,
      };

      localStore.setQuery(
        api.deliverables.queries.listByOutcome,
        { outcomeId: args.outcomeId },
        [...current, tempDeliverable],
      );
    }
  });

  const isSelected =
    selectedNode?.type === "outcome" && selectedNode.outcomeId === outcome.id;

  const deliverableCount = deliverables?.length ?? 0;
  const completedDeliverables =
    deliverables?.reduce(
      (count, item) => (item.status === "done" ? count + 1 : count),
      0,
    ) ?? 0;

  useEffect(() => {
    if (shouldScrollIntoView && containerRef.current) {
      containerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      onScrollHandled?.();
    }
  }, [shouldScrollIntoView, onScrollHandled]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "p-2 sm:p-4 border rounded bg-background transition-colors",
        isSelected ? "border-primary/60 bg-primary/5" : "border-border/60",
      )}
    >
      <div className="flex items-center gap-2 justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground/80">
            Outcome {index + 1}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <StatusBadge
            status={outcome.status}
            onChange={async (nextStatus) => {
              try {
                await updateOutcome({
                  outcomeId: outcome.id,
                  status: nextStatus,
                });
              } catch (error) {
                console.error("Failed to update outcome status", error);
              }
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => selectOutcome(outcome.id)}
            aria-pressed={isSelected}
            aria-label="Select outcome"
            className={cn(
              "text-muted-foreground",
              isSelected && "text-primary",
            )}
          >
            <MousePointerClick className="size-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            onClick={async () => {
              try {
                await deleteOutcome({ outcomeId: outcome.id });
                if (
                  selectedNode?.type === "outcome" &&
                  selectedNode.outcomeId === outcome.id
                ) {
                  clearSelection();
                }
              } catch (error) {
                console.error("Failed to delete outcome", error);
              }
            }}
            aria-label="Delete outcome"
          >
            <Trash className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col">
        <EditableField
          value={outcome.title ?? ""}
          onSave={async (nextValue) => {
            try {
              await updateOutcome({
                outcomeId: outcome.id,
                title: nextValue,
              });
            } catch (error) {
              console.error("Failed to update outcome title", error);
            }
          }}
          placeholder="Add an outcome title"
          displayClassName="text-xl font-semibold"
          editorClassName="text-xl font-semibold"
        />
        <EditableField
          value={outcome.summary ?? ""}
          onSave={async (nextValue) => {
            try {
              await updateOutcome({
                outcomeId: outcome.id,
                summary: nextValue,
              });
            } catch (error) {
              console.error("Failed to update outcome summary", error);
            }
          }}
          placeholder="Add a brief outcome summary"
          displayClassName="text-sm text-muted-foreground"
          editorClassName="text-sm"
        />
      </div>

      <Collapsible className="mt-2 border border-primary/10 rounded">
        <div className="flex items-center border-b border-primary/10 px-3 py-2">
          <CollapsibleChevronTrigger aria-label="Toggle deliverables" />
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground justify-between w-full">
            <span>Deliverables</span>
            {deliverableCount > 0 ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                {completedDeliverables}/{deliverableCount} done
              </span>
            ) : (
              <span className="text-xs text-muted-foreground/80">None yet</span>
            )}
          </div>
        </div>
        <CollapsibleContent>
          <div className="flex flex-col">
            {deliverables === undefined ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading deliverables...
              </div>
            ) : deliverables.length === 0 ? (
              <div className="p-4 text-sm text-muted-foreground">
                No deliverables yet. Add one to break this outcome into concrete
                pieces.
              </div>
            ) : (
              deliverables.map((deliverable, deliverableIndex) => (
                <DeliverableItem
                  key={deliverable.id}
                  outcomeId={outcome.id}
                  deliverable={deliverable}
                  index={deliverableIndex}
                />
              ))
            )}
          </div>
          <div className="p-2">
            <Button
              type="button"
              variant="dashed"
              onClick={async () => {
                try {
                  const result = await addDeliverable({
                    outcomeId: outcome.id,
                    title: "New deliverable",
                    doneWhen: "",
                  });

                  const nextDeliverableId = result?.deliverableId;
                  if (nextDeliverableId) {
                    selectDeliverable(outcome.id, nextDeliverableId);
                  }
                } catch (error) {
                  console.error("Failed to add deliverable", error);
                }
              }}
            >
              <Plus className="size-4" /> Add deliverable
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
