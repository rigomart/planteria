"use client";

import { Plus } from "lucide-react";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { OutcomeSection } from "./outcome-section";
import { OutlineToolbar } from "./outline-toolbar";
import type { PlanOutlineProps } from "./types";
import { sortByOrder } from "./utils";

export function PlanOutline({ plan }: PlanOutlineProps) {
  const outcomes = useMemo(
    () => sortByOrder(plan.outcomes ?? []),
    [plan.outcomes],
  );

  return (
    <div className="flex flex-col gap-6">
      <OutlineToolbar />
      <div className="flex flex-col gap-6">
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
