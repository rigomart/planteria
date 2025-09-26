import { Plus } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DeliverableItem } from "./deliverable-item";
import { NodeActionGroup } from "./node-action-group";
import { StatusBadge } from "./status-badge";
import type { OutcomeSectionProps } from "./types";
import { ensureStatus, sortByOrder } from "./utils";

export function OutcomeSection({
  planId,
  outcome,
  index,
}: OutcomeSectionProps) {
  const deliverables = useMemo(
    () => sortByOrder(outcome.deliverables ?? []),
    [outcome.deliverables],
  );

  return (
    <div className="border-l-4 border border-l-primary/20 p-4">
      <div className="flex items-center gap-2 justify-end">
        <StatusBadge status={ensureStatus(outcome.status)} />

        <NodeActionGroup
          onEdit={() => console.log("[UI] edit outcome", outcome.id)}
          onStatus={() => console.log("[UI] status outcome", outcome.id)}
          onAiAdjust={() => console.log("[UI] AI adjust outcome", outcome.id)}
          onReorder={() => console.log("[UI] reorder outcome", outcome.id)}
          onDelete={() =>
            console.log("[UI] delete outcome", outcome.id, "plan", planId)
          }
        />
      </div>
      <div className="flex flex-col gap-3">
        <div className="text-xl font-semibold">
          {index + 1}. {outcome.title}
        </div>
        <p className="text-sm text-muted-foreground">{outcome.summary}</p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {deliverables.map((deliverable, deliverableIndex) => (
            <DeliverableItem
              key={deliverable.id}
              outcomeId={outcome.id}
              deliverable={deliverable}
              index={deliverableIndex}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            console.log("[UI] add deliverable", outcome.id, "plan", planId)
          }
          className="w-full border-dashed border border-primary/10"
        >
          <Plus className="size-4" /> Add deliverable
        </Button>
      </div>
    </div>
  );
}
