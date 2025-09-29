"use client";

import { useQuery } from "convex/react";
import { Copy, Download, Eye, EyeOff, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type PlanSummary = NonNullable<
  (typeof api.plans.queries.getPlanSummary)["_returnType"]
>;

type PlanPreviewData = NonNullable<
  (typeof api.plans.queries.getPlanPreview)["_returnType"]
>;

type PlanWorkspacePreviewContentProps = {
  plan: PlanSummary;
  className?: string;
};

export function PlanWorkspacePreviewContent({
  plan,
  className,
}: PlanWorkspacePreviewContentProps) {
  const previewData = useQuery(api.plans.queries.getPlanPreview, {
    planId: plan.id,
  });

  const isLoading = previewData === undefined;
  const hierarchy: PlanPreviewData | null = previewData ?? null;

  const totalOutcomes = hierarchy?.outcomes.length ?? 0;
  const totalDeliverables = hierarchy
    ? hierarchy.outcomes.reduce(
        (count, outcome) => count + outcome.deliverables.length,
        0,
      )
    : 0;
  const totalActions = hierarchy
    ? hierarchy.outcomes.reduce(
        (actionTotal, outcome) =>
          actionTotal +
          outcome.deliverables.reduce(
            (deliverableTotal, deliverable) =>
              deliverableTotal + deliverable.actions.length,
            0,
          ),
        0,
      )
    : 0;

  const summaryLine = `${totalOutcomes} outcomes • ${totalDeliverables} deliverables • ${totalActions} actions`;

  return (
    <Tabs className={cn("flex h-full min-h-0 flex-col gap-4", className)}>
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Plan preview
          </span>
          <h2 className="text-2xl font-semibold text-foreground">
            {plan.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="outline">
            <Copy className="mr-2 size-4" /> Copy markdown
          </Button>
          <Button type="button" size="sm" variant="outline">
            <Download className="mr-2 size-4" /> Export .md
          </Button>
        </div>

        <TabsList className="w-fit">
          <TabsTrigger value="preview">
            <Eye className="size-4" />
            Preview
          </TabsTrigger>
          <TabsTrigger value="markdown">
            <FileText className="size-4" />
            Markdown
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border bg-background/70">
        <div className="flex h-full flex-col overflow-y-auto p-4 text-sm">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading plan overview…
            </div>
          ) : hierarchy ? (
            <>
              <TabsContent
                value="preview"
                className="space-y-3 text-muted-foreground"
              >
                <p>Rendered preview placeholder coming soon.</p>
              </TabsContent>

              <TabsContent
                value="markdown"
                className="space-y-3 text-muted-foreground"
              >
                <p>Markdown output placeholder coming soon.</p>
              </TabsContent>

              <div className="mt-auto pt-4 text-xs text-muted-foreground">
                {summaryLine}
              </div>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <EyeOff className="size-5" />
              <p className="text-sm">Preview unavailable for this plan.</p>
            </div>
          )}
        </div>
      </div>
    </Tabs>
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
        "flex h-full min-h-0 w-full flex-col gap-4 overflow-hidden rounded-lg border bg-card p-4",
        className,
      )}
    >
      <PlanWorkspacePreviewContent plan={plan} />
    </aside>
  );
}
