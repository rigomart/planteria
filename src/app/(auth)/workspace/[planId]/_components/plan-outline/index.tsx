"use client";

import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { ChevronDown, Plus } from "lucide-react";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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

type PlanSummary = NonNullable<
  FunctionReturnType<typeof api.plans.queries.getPlanSummary>
>;

export function PlanOutline({ planId }: PlanOutlineProps) {
  const plan = useQuery(api.plans.queries.getPlanSummary, { planId });
  const outcomes = useQuery(api.outcomes.queries.listByPlan, {
    planId,
  });

  if (plan === undefined || outcomes === undefined) {
    return (
      <div className="px-4 py-3 text-sm text-muted-foreground">
        Loading plan…
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="px-4 py-3 text-sm text-muted-foreground">
        Plan unavailable.
      </div>
    );
  }

  return (
    <OutlineSelectionProvider>
      <PlanOutlineContent planId={planId} plan={plan} outcomes={outcomes} />
    </OutlineSelectionProvider>
  );
}

type PlanOutlineContentProps = {
  planId: Id<"plans">;
  plan: PlanSummary;
  outcomes: FunctionReturnType<typeof api.outcomes.queries.listByPlan>;
};

function PlanOutlineContent({
  planId,
  plan,
  outcomes,
}: PlanOutlineContentProps) {
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

  const planTitle = plan.title?.trim() ?? plan.idea;
  const planSummary = plan.summary?.trim();
  const planIdea = plan.idea?.trim() ?? "";
  const hasSummary = Boolean(planSummary && planSummary.length > 0);

  return (
    <div className="flex flex-col">
      <section className="p-2 md:p-4 bg-background border-b border-border/60">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {planTitle}
          </h1>

          <div className="space-y-1">
            <Collapsible>
              <CollapsibleTrigger asChild>
                <Button
                  size="xs"
                  variant="outline"
                  className="rounded-full text-xs border border-primary"
                >
                  Initial idea
                  <ChevronDown className="size-4" />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="p-2 bg-primary/5 rounded-xl">
                <p className="rounded-full text-xs leading-relaxed text-foreground">
                  {planIdea}
                </p>
              </CollapsibleContent>
            </Collapsible>
            {hasSummary && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {planSummary}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className=" flex flex-col gap-6 p-2 md:p-6">
        {outcomes.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No outcomes yet. Start by adding one to capture a major result you
            want from this plan.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {outcomes.map((outcome, outcomeIndex) => (
              <OutcomeSection
                key={outcome.id}
                planId={planId}
                outcome={outcome}
                index={outcomeIndex}
              />
            ))}
          </div>
        )}

        <Button type="button" variant="outline" onClick={handleAddOutcome}>
          <Plus className="mr-2 size-4" /> Add outcome
        </Button>
      </div>
    </div>
  );
}
