import { Plus } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { DeliverableItem } from "./deliverable-item";
import { NodeOptionsMenu } from "./node-options-menu";
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
    <div className="border border-primary/10 p-4 sm:p-6 bg-card/60">
      <div className="flex items-center gap-2 justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground/80">
            Outcome {index + 1}
          </span>
          <StatusBadge status={ensureStatus(outcome.status)} />
        </div>

        <NodeOptionsMenu
          onComplete={() => console.log("[UI] complete outcome", outcome.id)}
          onAiAdjust={() => console.log("[UI] AI adjust outcome", outcome.id)}
          onDelete={() =>
            console.log("[UI] delete outcome", outcome.id, "plan", planId)
          }
        />
      </div>
      <div className="flex flex-col gap-1">
        <div className="text-xl font-semibold">{outcome.title}</div>
        <p className="text-sm text-muted-foreground">{outcome.summary}</p>
      </div>

      <div className="flex flex-col gap-4 mt-6">
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
