"use client";

import type { FunctionReturnType } from "convex/server";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { api } from "@/convex/_generated/api";
import { OutlineSelectionProvider } from "./outline-selection-context";
import { PlanOutcomes } from "./plan-outcomes";

export type PlanOutlineProps = {
  plan?: FunctionReturnType<typeof api.plans.queries.getPlanSummary>;
};

type PlanSummary = FunctionReturnType<typeof api.plans.queries.getPlanSummary>;

export function PlanOutline({ plan }: PlanOutlineProps) {
  if (!plan) {
    return (
      <div className="px-4 py-3 text-sm text-muted-foreground">
        Loading plan...
      </div>
    );
  }

  return (
    <OutlineSelectionProvider>
      <PlanOutlineContent plan={plan} />
    </OutlineSelectionProvider>
  );
}

type PlanOutlineContentProps = {
  plan: PlanSummary;
};

function PlanOutlineContent({ plan }: PlanOutlineContentProps) {
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

      <PlanOutcomes planId={plan.id} />
    </div>
  );
}
