import { Plus } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Outcome {index + 1}
            </span>
            <StatusBadge status={ensureStatus(outcome.status)} />
          </div>
          <CardTitle className="text-xl font-semibold">
            {outcome.title}
          </CardTitle>
          {outcome.summary ? (
            <CardDescription>{outcome.summary}</CardDescription>
          ) : null}
        </div>
        <CardAction>
          <NodeActionGroup
            onEdit={() => console.log("[UI] edit outcome", outcome.id)}
            onStatus={() => console.log("[UI] status outcome", outcome.id)}
            onAiAdjust={() => console.log("[UI] AI adjust outcome", outcome.id)}
            onReorder={() => console.log("[UI] reorder outcome", outcome.id)}
            onDelete={() =>
              console.log("[UI] delete outcome", outcome.id, "plan", planId)
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
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
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() =>
            console.log("[UI] add deliverable", outcome.id, "plan", planId)
          }
        >
          <Plus className="mr-2 size-4" /> Add deliverable
        </Button>
      </CardContent>
    </Card>
  );
}
