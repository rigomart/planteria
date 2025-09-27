"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { api } from "@/convex/_generated/api";
import { PlanOutline } from "./plan-outline";

type PlanWorkspaceContentProps = {
  preloadedPlan: Preloaded<typeof api.plans.queries.getPlan>;
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
      <div className="flex flex-col md:col-span-4 p-2 sm:p-4 md:p-6 lg:p-8">
        <ScrollArea>
          <PlanOutline plan={plan} />
        </ScrollArea>
      </div>
    </div>
  );
}
