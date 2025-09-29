"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { api } from "@/convex/_generated/api";
import { PlanOutline } from "./plan-outline";

type PlanWorkspaceContentProps = {
  preloadedPlan: Preloaded<typeof api.plans.queries.getPlanSummary>;
};

export function PlanWorkspaceContent({
  preloadedPlan,
}: PlanWorkspaceContentProps) {
  const plan = usePreloadedQuery(preloadedPlan);

  if (!plan) {
    return null;
  }

  return (
    <div className="flex h-full min-h-0 gap-2 pb-6 pt-2">
      <aside className="flex w-80 min-w-[18rem] flex-col gap-4 overflow-y-auto rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-3">
          <div className="text-2xl font-semibold">{plan.title}</div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{plan.summary}</p>

            <div className="flex flex-col gap-1 rounded-lg border p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Initial idea</span>
              <span className="text-muted-foreground/90">{plan.idea}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => console.log("[UI] refine plan with AI")}
          >
            <Sparkles className="mr-2 size-4" /> AI adjust plan
          </Button>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <PlanOutline planId={plan.id} />
      </section>

      <aside className="flex w-72 min-w-[16rem] flex-col gap-4 overflow-y-auto rounded-lg border bg-card p-4">
        <div className="text-2xl font-semibold">{plan.title}</div>
      </aside>
    </div>
  );
}
