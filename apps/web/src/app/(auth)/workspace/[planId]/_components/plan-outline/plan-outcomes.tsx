"use client";

import { useMutation, useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { OutcomeSection } from "./outcome-section";
import { useOutlineSelection } from "./outline-selection-context";

type OutcomesProps = {
  planId: Id<"plans">;
};

export function PlanOutcomes({ planId }: OutcomesProps) {
  const outcomes = useQuery(api.outcomes.queries.listByPlan, {
    planId,
  });

  const { selectOutcome } = useOutlineSelection();

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
        selectOutcome(newOutcomeId);
      }
    } catch (error) {
      console.error("Failed to add outcome", error);
    }
  }, [addOutcome, planId, selectOutcome]);

  if (!outcomes) {
    return (
      <div className="mx-4 mt-4 mb-6 rounded-xl border border-dashed border-border/40 bg-muted/20 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No outcomes yet. Add one to define a major result.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 md:px-6">
      <div className="flex flex-col gap-3">
        {outcomes.map((outcome, outcomeIndex) => (
          <OutcomeSection key={outcome.id} planId={planId} outcome={outcome} index={outcomeIndex} />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleAddOutcome}
        className="self-start"
      >
        <Plus className="size-4" /> Add outcome
      </Button>
    </div>
  );
}
