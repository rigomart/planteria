"use client";

import { useQuery } from "convex/react";
import type { ReactNode } from "react";
import {
  Collapsible,
  CollapsibleChevronTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { StripedPattern } from "@/components/ui/striped-pattern";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { PlanOutline } from "./plan-outline";
import { PlanWorkspaceAssistant } from "./plan-workspace-assistant";
import {
  PlanWorkspacePreview,
  PlanWorkspacePreviewContentWrapper,
} from "./plan-workspace-preview";

type PlanWorkspaceContentProps = {
  planId: Id<"plans">;
};

export function PlanWorkspaceContent({ planId }: PlanWorkspaceContentProps) {
  const plan = useQuery(api.plans.queries.getPlanSummary, { planId });

  return (
    <div className="flex h-full min-h-0 flex-col lg:overflow-hidden">
      <div className="grid min-h-0 grid-cols-1 lg:h-full lg:flex-1 md:grid-cols-12 lg:overflow-hidden">
        <div className="hidden w-full overflow-hidden md:col-span-5 lg:col-span-4 md:flex md:h-full lg:min-h-0">
          <PlanWorkspaceAssistant plan={plan} />
        </div>

        <section className="flex min-h-0 min-w-0 flex-col md:col-span-7 lg:col-span-8 lg:h-full lg:min-h-0 lg:overflow-hidden relative ">
          <StripedPattern className="text-muted/70" width={10} height={10} />

          <div className="z-20 absolute right-8 top-2 hidden md:block">
            <PlanWorkspacePreview plan={plan} />
          </div>

          <div className="flex-1 overflow-y-auto z-10">
            <PlanOutline plan={plan} />
          </div>
        </section>
      </div>

      <div className="flex flex-col gap-4 md:hidden">
        <MobileWorkspaceSection title="AI assistant">
          <PlanWorkspaceAssistant plan={plan} layout="card" />
        </MobileWorkspaceSection>

        <MobileWorkspaceSection title="Plan preview">
          <PlanWorkspacePreviewContentWrapper plan={plan} />
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
