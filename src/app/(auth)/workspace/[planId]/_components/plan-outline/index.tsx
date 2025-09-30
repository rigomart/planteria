"use client";

import type { FunctionReturnType } from "convex/server";
import { ChevronDown, Sparkles } from "lucide-react";
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

  if (plan.status === "generating") {
    return <PlanGeneratingLoader idea={plan.idea} />;
  }

  return (
    <OutlineSelectionProvider>
      <PlanOutlineContent plan={plan} />
    </OutlineSelectionProvider>
  );
}

function PlanGeneratingLoader({ idea }: { idea: string }) {
  return (
    <section className="relative flex flex-col items-center justify-center min-h-[60vh] h-full overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-xl bg-primary/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-64 w-64 rounded-xl bg-muted/40 blur-3xl animate-pulse [animation-delay:700ms]" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-xl text-center">
        <div className="relative mb-2">
          <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full animate-pulse" />
          <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl border border-primary/20 shadow-lg">
            <Sparkles className="size-14 text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Crafting your plan...
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
            AI is structuring your idea into outcomes, deliverables, and
            actionable steps.
          </p>
        </div>

        <div className="mt-2 w-full max-w-lg rounded-2xl border border-border/60 bg-background/90 p-5 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="rounded-lg bg-primary/10 p-2">
                <Sparkles className="size-4 text-primary" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Your idea
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed">
                {idea}
              </p>
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 mt-4">
          <div className="size-2 rounded-full bg-primary/70 animate-bounce" />
          <div className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:150ms]" />
          <div className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </section>
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
