"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { AlertTriangle, Loader2, Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { api } from "@/convex/_generated/api";
import { PlanOutline } from "./plan-outline";

type PlanWorkspaceContentProps = {
  preloadedPlan: Preloaded<typeof api.plans.getPlan>;
};

export function PlanWorkspaceContent({
  preloadedPlan,
}: PlanWorkspaceContentProps) {
  const plan = usePreloadedQuery(preloadedPlan);

  if (!plan) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-6">
      {/* Left Column - Plan Info */}
      <div className="flex flex-col gap-6 md:col-span-2 h-full bg-background border-r p-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              {plan.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{plan.summary}</p>

            <div className="flex flex-col gap-1 rounded-lg border p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Initial idea</span>
              <span className="text-muted-foreground/90">{plan.idea}</span>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3">
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
      </div>

      {/* Right Column - Plan Outline */}
      <div className="flex flex-col md:col-span-4 p-4">
        <ScrollArea>
          <PlanOutline plan={plan} />
        </ScrollArea>
      </div>
    </div>
  );
}

function GeneratingPlanView({ idea }: { idea: string }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
        <h2 className="text-lg font-semibold">Drafting your plan</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        We’re turning your idea into outcomes, deliverables, and actions. This
        usually takes less than a minute.
      </p>
      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-semibold text-muted-foreground">Idea</p>
        <p>{idea}</p>
      </div>
    </div>
  );
}

function PlanErrorView({ error }: { error: string | null }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-destructive">
        <AlertTriangle className="size-5" />
        <h2 className="text-lg font-semibold">Plan generation failed</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Something went wrong while asking the planning agent for a draft. You
        can return to the workspace and try again.
      </p>
      {error ? (
        <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      ) : null}
    </div>
  );
}
