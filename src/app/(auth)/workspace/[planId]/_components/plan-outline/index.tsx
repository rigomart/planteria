"use client";

import { Plus, Sparkles } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { OutcomeSection } from "./outcome-section";
import type { PlanOutlineProps } from "./types";
import { sortByOrder } from "./utils";

export function PlanOutline({ plan }: PlanOutlineProps) {
  const outcomes = useMemo(
    () => sortByOrder(plan.outcomes ?? []),
    [plan.outcomes],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => console.log("[UI] refine plan with AI")}
          >
            <Sparkles className="mr-2 size-4" /> AI adjust plan
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => console.log("[UI] add outcome", "toolbar")}
          >
            <Plus className="mr-2 size-4" /> Add outcome
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-8">
        {outcomes.map((outcome, outcomeIndex) => (
          <OutcomeSection
            key={outcome.id}
            planId={plan.id}
            outcome={outcome}
            index={outcomeIndex}
          />
        ))}
        <Button
          type="button"
          variant="ghost"
          className="self-start"
          onClick={() => console.log("[UI] add outcome", plan.id)}
        >
          <Plus className="mr-2 size-4" /> Add outcome
        </Button>
      </div>
    </div>
  );
}
