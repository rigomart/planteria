"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import type { ReactNode } from "react";
import {
  Collapsible,
  CollapsibleChevronTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import type { api } from "@/convex/_generated/api";
import { PlanOutline } from "./plan-outline";
import {
  PlanWorkspaceAssistant,
  PlanWorkspaceAssistantContent,
} from "./plan-workspace-assistant";
import {
  PlanWorkspacePreview,
  PlanWorkspacePreviewContent,
} from "./plan-workspace-preview";

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
    <div className="flex h-full min-h-0 flex-col gap-4 pb-6 pt-2">
      <div className="grid h-full min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-[20rem_minmax(0,1fr)_18rem] xl:grid-cols-[22rem_minmax(0,1fr)_20rem]">
        <div className="hidden h-full min-h-0 w-full lg:flex">
          <PlanWorkspaceAssistant plan={plan} />
        </div>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          <PlanOutline planId={plan.id} />
        </section>

        <div className="hidden h-full min-h-0 w-full lg:flex">
          <PlanWorkspacePreview plan={plan} />
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:hidden">
        <MobileWorkspaceSection title="AI assistant">
          <PlanWorkspaceAssistantContent plan={plan} />
        </MobileWorkspaceSection>

        <MobileWorkspaceSection title="Plan preview">
          <PlanWorkspacePreviewContent plan={plan} />
        </MobileWorkspaceSection>
      </div>
    </div>
  );
}

type MobileWorkspaceSectionProps = {
  title: string;
  children: ReactNode;
};

function MobileWorkspaceSection({
  title,
  children,
}: MobileWorkspaceSectionProps) {
  return (
    <Collapsible defaultOpen={false} className="rounded-lg border bg-card">
      <div className="flex items-center justify-between px-4 py-3">
        <span className="text-sm font-medium text-foreground">{title}</span>
        <CollapsibleChevronTrigger
          aria-label={`Toggle ${title}`}
          className="text-muted-foreground"
        />
      </div>
      <CollapsibleContent className="border-t px-4 pb-4 pt-3 data-[state=closed]:border-transparent">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}
