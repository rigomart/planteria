"use client";

import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { OutcomeSection } from "./outcome-section";
import {
  OutlineSelectionProvider,
  useOutlineSelection,
} from "./outline-selection-context";

export type PlanOutlineProps = {
  planId: Id<"plans">;
};

export function PlanOutline({ planId }: PlanOutlineProps) {
  const outcomes = useQuery(api.outcomes.queries.listByPlan, {
    planId: planId,
  });

  if (outcomes === undefined) {
    return <div>Loading outcomes...</div>;
  }

  return (
    <OutlineSelectionProvider>
      <PlanOutlineContent planId={planId} outcomes={outcomes} />
    </OutlineSelectionProvider>
  );
}

type PlanOutlineContentProps = {
  planId: Id<"plans">;
  outcomes: FunctionReturnType<typeof api.outcomes.queries.listByPlan>;
};

function PlanOutlineContent({ planId, outcomes }: PlanOutlineContentProps) {
  const { selectOutcome } = useOutlineSelection();
  const [pendingScrollOutcomeId, setPendingScrollOutcomeId] = useState<
    Id<"outcomes">
  | null>(null);

  const addOutcome = useMutation(api.outcomes.addOutcome);

  const handleAddOutcome = useCallback(async () => {
    try {
      const result = await addOutcome({
        planId,
        title: "New outcome",
        summary: "",
      });

      const newOutcomeId = result?.outcomeId;
      if (newOutcomeId) {
        setPendingScrollOutcomeId(newOutcomeId);
        selectOutcome(newOutcomeId);
      }
    } catch (error) {
      console.error("Failed to add outcome", error);
    }
  }, [addOutcome, planId, selectOutcome]);

  const handleScrollHandled = useCallback(() => {
    setPendingScrollOutcomeId(null);
  }, []);

  const totalOutcomes = outcomes.length;

  return (
    <div className="flex flex-col gap-6 p-2 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h2 className="text-lg font-semibold">Plan Outline</h2>
          <span className="text-sm text-muted-foreground">
            {totalOutcomes} {totalOutcomes === 1 ? "outcome" : "outcomes"}
          </span>
        </div>

        <Button type="button" size="sm" onClick={handleAddOutcome}>
          <Plus className="mr-2 size-4" /> Add outcome
        </Button>
      </div>

      {outcomes.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
          No outcomes yet. Start by adding one to capture a major result you want
          from this plan.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {outcomes.map((outcome, outcomeIndex) => (
            <OutcomeSection
              key={outcome.id}
              planId={planId}
              outcome={outcome}
              index={outcomeIndex}
              shouldScrollIntoView={pendingScrollOutcomeId === outcome.id}
              onScrollHandled={handleScrollHandled}
            />
          ))}
        </div>
      )}
    </div>
  );
}
