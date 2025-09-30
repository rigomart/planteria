import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ChevronDown, MoreHorizontal, Plus, Trash } from "lucide-react";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { DeliverableItem } from "./deliverable-item";
import { EditableField } from "./editable-field";
import { useOutlineSelection } from "./outline-selection-context";
import { StatusBadge } from "./status-badge";

export type OutcomeSectionProps = {
  planId: Id<"plans">;
  outcome: FunctionReturnType<typeof api.outcomes.queries.listByPlan>[number];
  index: number;
};

export function OutcomeSection({
  planId,
  outcome,
  index,
}: OutcomeSectionProps) {
  const deliverables = useQuery(api.deliverables.queries.listByOutcome, {
    outcomeId: outcome.id,
  });

  const { selectDeliverable, clearSelection } = useOutlineSelection();
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

  const deliverableCount = deliverables?.length ?? 0;
  const completedDeliverables =
    deliverables?.reduce(
      (count, item) => (item.status === "done" ? count + 1 : count),
      0,
    ) ?? 0;

  return (
    <div
      ref={containerRef}
      className="group rounded-2xl border border-border/50 bg-card shadow-sm transition-all hover:border-border/80 hover:shadow-md"
    >
      {/* Outcome Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary">
              #{index + 1}
            </span>
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
          </div>

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
            placeholder="Outcome title"
            displayClassName="text-lg font-semibold text-foreground"
            editorClassName="text-lg font-semibold"
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
            placeholder="Brief summary"
            displayClassName="text-sm text-muted-foreground leading-relaxed"
            editorClassName="text-sm"
          />
        </div>

        {/* Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={async () => {
                try {
                  await deleteOutcome({ outcomeId: outcome.id });
                  clearSelection();
                } catch (error) {
                  console.error("Failed to delete outcome", error);
                }
              }}
            >
              <Trash className="mr-2 size-4" />
              Delete outcome
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Deliverables Section */}
      <Collapsible defaultOpen={true} className="border-t border-border/40">
        <CollapsibleTrigger className="flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-muted/30">
          <div className="flex items-center gap-2">
            <ChevronDown className="size-4 text-muted-foreground transition-transform [[data-state=closed]_&]:rotate-[-90deg]" />
            <span className="font-medium text-muted-foreground">
              Deliverables
            </span>
          </div>
          {deliverableCount > 0 ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {completedDeliverables}/{deliverableCount}
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/60">None yet</span>
          )}
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-3">
            {deliverables === undefined ? (
              <div className="py-4 text-center text-sm text-muted-foreground">
                Loading...
              </div>
            ) : deliverables.length === 0 ? (
              <div className="rounded-lg bg-muted/20 py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No deliverables yet
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {deliverables.map((deliverable, deliverableIndex) => (
                  <DeliverableItem
                    key={deliverable.id}
                    outcomeId={outcome.id}
                    deliverable={deliverable}
                    index={deliverableIndex}
                  />
                ))}
              </div>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3"
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
