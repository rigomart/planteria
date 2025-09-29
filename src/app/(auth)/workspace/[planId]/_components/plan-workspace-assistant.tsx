"use client";

import type { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type PlanSummary = NonNullable<
  (typeof api.plans.queries.getPlanSummary)["_returnType"]
>;

type PlanWorkspaceAssistantContentProps = {
  plan: PlanSummary;
  className?: string;
};

export function PlanWorkspaceAssistantContent({
  plan,
  className,
}: PlanWorkspaceAssistantContentProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="text-2xl font-semibold">{plan.title}</div>

      <p className="text-sm text-muted-foreground">
        Assistant workspace placeholder
      </p>
    </div>
  );
}

type PlanWorkspaceAssistantProps = {
  plan: PlanSummary;
  className?: string;
};

export function PlanWorkspaceAssistant({
  plan,
  className,
}: PlanWorkspaceAssistantProps) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col gap-4 overflow-y-auto rounded-lg border bg-card p-4",
        className,
      )}
    >
      <PlanWorkspaceAssistantContent plan={plan} />
    </aside>
  );
}
