"use client";

import { useMutation, useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Plus } from "lucide-react";
import { useCallback } from "react";
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
  const hasIdea = planIdea.length > 0;
  const showIdeaDetails = hasSummary || hasIdea;

  return (
    <div className="flex flex-col">
      <section className="p-2 md:p-4 bg-background border-b border-border/60">
        {showIdeaDetails ? (
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {planTitle}
            </h1>

            <div className="space-y-2  px-4 py-4">
              {hasSummary && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Plan summary
                  </p>
                  <p className="rounded-md border border-border/60 bg-muted/40 px-3 py-2 text-sm leading-relaxed text-muted-foreground">
                    {planSummary}
                  </p>
                </div>
              )}
              {hasIdea && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Initial idea
                  </p>
                  <p className="rounded-md border border-primary/40 bg-primary/5 px-3 py-3 text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                    {planIdea}
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-border/60 bg-background/80 px-4 py-3">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {planTitle}
            </h1>
          </div>
        )}
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
