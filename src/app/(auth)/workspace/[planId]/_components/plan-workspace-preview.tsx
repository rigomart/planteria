"use client";

import type { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type PlanSummary = NonNullable<
  (typeof api.plans.queries.getPlanSummary)["_returnType"]
>;

type PlanWorkspacePreviewContentProps = {
  plan: PlanSummary;
  className?: string;
};

export function PlanWorkspacePreviewContent({
  plan,
  className,
}: PlanWorkspacePreviewContentProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="text-2xl font-semibold">{plan.title}</div>

      <p className="text-sm text-muted-foreground">
        Plan preview placeholder
      </p>
    </div>
  );
}

type PlanWorkspacePreviewProps = {
  plan: PlanSummary;
  className?: string;
};

export function PlanWorkspacePreview({
  plan,
  className,
}: PlanWorkspacePreviewProps) {
  return (
    <aside
      className={cn(
        "flex h-full min-h-0 w-full flex-col gap-4 overflow-y-auto rounded-lg border bg-card p-4",
        className,
      )}
    >
      <PlanWorkspacePreviewContent plan={plan} />
    </aside>
  );
}
