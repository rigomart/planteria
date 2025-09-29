import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { MousePointerClick, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { DeliverableItem } from "./deliverable-item";
import { EditableField } from "./editable-field";
import { NodeOptionsMenu } from "./node-options-menu";
import { useOutlineSelection } from "./outline-selection-context";
import { StatusBadge } from "./status-badge";
import {
  Collapsible,
  CollapsibleChevronTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

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

  const { selectedNode, selectOutcome, selectDeliverable } =
    useOutlineSelection();

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

  return (
    <div
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
          <StatusBadge status={outcome.status} />
        </div>

        <div className="flex items-center gap-1">
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
          <NodeOptionsMenu
            onAiAdjust={() => console.log("[UI] AI adjust outcome", outcome.id)}
            onDelete={() =>
              console.log("[UI] delete outcome", outcome.id, "plan", planId)
            }
          />
        </div>
      </div>
      <div className="flex flex-col">
        <EditableField
          value={outcome.title ?? ""}
          onSave={(nextValue) =>
            console.log("[UI] save outcome title", {
              planId,
              outcomeId: outcome.id,
              value: nextValue,
            })
          }
          placeholder="Add an outcome title"
          displayClassName="text-xl font-semibold"
          editorClassName="text-xl font-semibold"
        />
        <EditableField
          value={outcome.summary ?? ""}
          onSave={(nextValue) =>
            console.log("[UI] save outcome summary", {
              planId,
              outcomeId: outcome.id,
              value: nextValue,
            })
          }
          placeholder="Add a brief outcome summary"
          displayClassName="text-sm text-muted-foreground"
          editorClassName="text-sm"
        />
      </div>

      <Collapsible className="mt-2 border border-primary/10 rounded">
        <div className="flex items-center gap-2 border-b border-primary/10 px-3 py-2">
          <CollapsibleChevronTrigger aria-label="Toggle deliverables" />
          <div className="text-sm font-medium text-muted-foreground">
            Deliverables
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
