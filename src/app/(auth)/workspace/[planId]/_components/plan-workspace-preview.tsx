"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Copy, Download, Eye, EyeOff, FileText, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type PlanSummary = NonNullable<
  FunctionReturnType<typeof api.plans.queries.getPlanSummary>
>;

type PlanPreviewData = NonNullable<
  FunctionReturnType<typeof api.plans.queries.getPlanPreview>
>;

type PreviewMode = "preview" | "markdown";

type PlanWorkspacePreviewContentProps = {
  plan: PlanSummary;
  className?: string;
};

export function PlanWorkspacePreviewContent({
  plan,
  className,
}: PlanWorkspacePreviewContentProps) {
  const [mode, setMode] = useState<PreviewMode>("preview");
  const previewData = useQuery(api.plans.queries.getPlanPreview, {
    planId: plan.id,
  });

  const isLoading = previewData === undefined;
  const hierarchy = previewData ?? null;

  const { markdown } = useMemo(() => {
    if (!hierarchy) {
      return {
        markdown: null as string | null,
        totals: { outcomes: 0, deliverables: 0, actions: 0 },
      };
    }

    return {
      markdown: buildPlanMarkdown(hierarchy),
    };
  }, [hierarchy]);

  const hasContent = Boolean(markdown && markdown.trim().length > 0);
  const markdownText = markdown ?? "";
  const emptyMessage = "Add outcomes and deliverables to see the plan preview.";

  return (
    <Tabs
      value={mode}
      onValueChange={(value) => setMode(value as PreviewMode)}
      className={cn("flex h-full min-h-0 flex-col gap-4", className)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Plan preview
          </span>
          <h2 className="text-2xl font-semibold text-foreground">
            {plan.title}
          </h2>
        </div>

        <div className="flex items-center justify-between">
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
          <div className="flex flex-wrap items-center gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              title="Copy markdown"
            >
              <Copy className="size-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              title="Export .md"
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-lg border bg-background/70">
        <div className="flex h-full flex-col p-4 text-sm">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading plan overview…
            </div>
          ) : hierarchy ? (
            <>
              <TabsContent
                value="preview"
                className="flex-1 overflow-auto text-foreground cursor-text"
              >
                {hasContent ? (
                  <ReactMarkdown>{markdownText}</ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground">{emptyMessage}</p>
                )}
              </TabsContent>

              <TabsContent value="markdown" className="flex-1 overflow-auto">
                {hasContent ? (
                  <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">
                    {markdownText}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">{emptyMessage}</p>
                )}
              </TabsContent>
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

function buildPlanMarkdown(preview: PlanPreviewData): string {
  const { plan, outcomes } = preview;
  const segments: string[] = [];

  const planTitle = plan.title?.trim() || "Untitled plan";
  segments.push(`# ${planTitle}`);

  const summary = plan.summary?.trim();
  if (summary) {
    segments.push(summary);
  }

  const idea = plan.idea?.trim();
  if (idea) {
    segments.push(`> ${idea}`);
  }

  if (outcomes.length === 0) {
    segments.push("_This plan does not include any outcomes yet._");
    return segments.join("\n\n");
  }

  outcomes.forEach((outcome, outcomeIndex) => {
    const title = outcome.title?.trim() || `Outcome ${outcomeIndex + 1}`;
    segments.push(`## Outcome ${outcomeIndex + 1}: ${title}`);

    const outcomeSummary = outcome.summary?.trim();
    if (outcomeSummary) {
      segments.push(outcomeSummary);
    }

    segments.push(`_Status: ${formatStatus(outcome.status)}_`);

    if (outcome.deliverables.length === 0) {
      segments.push("- _No deliverables yet._");
      return;
    }

    const deliverableBlocks = outcome.deliverables.map(
      (deliverable, deliverableIndex) => {
        const deliverableTitle =
          deliverable.title?.trim() || `Deliverable ${deliverableIndex + 1}`;
        const header = `- **Deliverable ${deliverableIndex + 1}: ${deliverableTitle}** (_${formatStatus(deliverable.status)}_)`;
        const details: string[] = [];

        const doneWhen = deliverable.doneWhen?.trim();
        if (doneWhen) {
          details.push(`  - Done when: ${doneWhen}`);
        }

        const notes = deliverable.notes?.trim();
        if (notes) {
          details.push(`  - Notes: ${notes}`);
        }

        if (deliverable.actions.length === 0) {
          details.push("  - No actions yet.");
        } else {
          deliverable.actions.forEach((action, actionIndex) => {
            const actionTitle =
              action.title?.trim() || `Action ${actionIndex + 1}`;
            details.push(
              `  - ${checkboxForStatus(action.status)} ${actionTitle}`,
            );
          });
        }

        return [header, ...details].join("\n");
      },
    );

    segments.push(deliverableBlocks.join("\n"));
  });

  return segments.join("\n\n");
}

function formatStatus(status: string): string {
  switch (status.trim().toLowerCase()) {
    case "done":
      return "Done";
    case "doing":
      return "In progress";
    default:
      return "To do";
  }
}

function checkboxForStatus(status: string): string {
  switch (status.trim().toLowerCase()) {
    case "done":
      return "[x]";
    case "doing":
      return "[-]";
    default:
      return "[ ]";
  }
}
