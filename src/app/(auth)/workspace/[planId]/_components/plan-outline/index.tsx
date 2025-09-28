"use client";

import { useQuery } from "convex/react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { OutcomeSection } from "./outcome-section";

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
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-10">
        {outcomes.map((outcome, outcomeIndex) => (
          <OutcomeSection
            key={outcome.id}
            planId={planId}
            outcome={outcome}
            index={outcomeIndex}
          />
        ))}
      </div>
      <Button
        type="button"
        variant="ghost"
        className="self-start"
        onClick={() => console.log("[UI] add outcome", planId)}
      >
        <Plus className="mr-2 size-4" /> Add outcome
      </Button>
    </div>
  );
}
