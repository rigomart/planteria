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
    <div className="flex h-full min-h-0 flex-col lg:overflow-hidden">
      <div className="grid min-h-0 grid-cols-1 lg:h-full lg:flex-1 lg:grid-cols-12 lg:overflow-hidden">
        <div className="hidden w-full overflow-hidden lg:flex lg:h-full lg:min-h-0 lg:col-span-3">
          <PlanWorkspaceAssistant plan={plan} />
        </div>

        <section className="flex min-h-0 min-w-0 flex-col lg:h-full lg:min-h-0 lg:overflow-hidden lg:col-span-5">
          <div className="flex-1 overflow-y-auto">
            <PlanOutline planId={plan.id} />
          </div>
        </section>

        <div className="hidden w-full overflow-hidden lg:flex lg:h-full lg:min-h-0 lg:col-span-4">
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
      <CollapsibleContent className="border-t data-[state=closed]:border-transparent">
        <div className="max-h-[75vh] overflow-y-auto px-4 pb-4 pt-3">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
