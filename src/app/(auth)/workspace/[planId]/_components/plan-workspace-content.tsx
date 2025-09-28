"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { StripedPattern } from "@/components/ui/striped-pattern";
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
    <SidebarProvider
      style={
        {
          "--sidebar-width": "30rem",
          "--sidebar-width-mobile": "20rem",
        } as React.CSSProperties
      }
    >
      <Sidebar side="left">
        <SidebarContent className="p-2 pt-16">
          <div className="flex flex-col gap-3 bg-card">
            <div className="text-2xl font-semibold">{plan.title}</div>

            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{plan.summary}</p>

              <div className="flex flex-col gap-1 rounded-lg border p-3 text-xs text-muted-foreground">
                <span className="font-medium text-foreground">
                  Initial idea
                </span>
                <span className="text-muted-foreground/90">{plan.idea}</span>
              </div>
            </div>
          </div>

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
        </SidebarContent>
      </Sidebar>

      {/* Right Column - Plan Outline */}
      <SidebarInset className="min-h-0 h-full overflow-hidden">
        <div className="relative flex h-full flex-1 flex-col overflow-y-auto p-2 sm:p-4 md:p-6 lg:p-8">
          <StripedPattern className="stroke-[0.1] text-primary" />
          <div className="z-10">
            <PlanOutline planId={plan.id} />
          </div>
        </div>
      </SidebarInset>

      <Sidebar side="right">
        <SidebarContent className="p-2 pt-16">
          <div className="flex flex-col gap-3 bg-card">
            <div className="text-2xl font-semibold">{plan.title}</div>
          </div>
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  );
}
