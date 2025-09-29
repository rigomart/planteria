"use client";

import { useQuery } from "convex/react";
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
    <div className="flex flex-col gap-8 p-2 md:p-6">
      {outcomes.map((outcome, outcomeIndex) => (
        <OutcomeSection
          key={outcome.id}
          planId={planId}
          outcome={outcome}
          index={outcomeIndex}
        />
      ))}
    </div>
  );
}
