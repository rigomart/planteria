"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Copy, Download, Eye, EyeOff, FileText, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";
import ReactMarkdown, {
  type Components as MarkdownComponents,
} from "react-markdown";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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

  const { markdown, totals } = useMemo(() => {
    if (!hierarchy) {
      return {
        markdown: null as string | null,
        totals: { outcomes: 0, deliverables: 0, actions: 0 },
      };
    }

    let deliverableCount = 0;
    let actionCount = 0;

    for (const outcome of hierarchy.outcomes) {
      deliverableCount += outcome.deliverables.length;
      for (const deliverable of outcome.deliverables) {
        actionCount += deliverable.actions.length;
      }
    }

    return {
      markdown: buildPlanMarkdown(hierarchy),
      totals: {
        outcomes: hierarchy.outcomes.length,
        deliverables: deliverableCount,
        actions: actionCount,
      },
    };
  }, [hierarchy]);

  const hasContent = Boolean(markdown && markdown.trim().length > 0);
  const markdownText = markdown ?? "";
  const emptyMessage = "Add outcomes and deliverables to see the plan preview.";
  const summaryLine = `${totals.outcomes} outcomes • ${totals.deliverables} deliverables • ${totals.actions} actions`;

  return (
    <Tabs
      value={mode}
      onValueChange={(value) => setMode(value as PreviewMode)}
      className={cn("flex flex-col gap-4 h-full min-h-0", className)}
    >
      <div className="flex flex-col gap-3">
        <div className="text-lg font-semibold uppercase tracking-wider text-muted-foreground">
          Plan preview
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <TabsList className="w-fit shadow-sm">
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
              disabled={!hasContent || isLoading}
              onClick={() => handleCopy(markdownText, hasContent)}
            >
              <Copy className="size-4" />
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              title="Export .md"
              disabled={!hasContent || isLoading}
              onClick={() => handleExport(markdownText, plan.title)}
            >
              <Download className="size-4" />
            </Button>
          </div>
        </div>
      </div>

      <div
        className={cn("overflow-hidden rounded-lg border bg-background flex-1")}
      >
        <div className="flex h-full flex-col">
          {isLoading ? (
            <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin" /> Loading plan overview…
            </div>
          ) : hierarchy ? (
            <>
              <TabsContent
                value="preview"
                className="flex-1 overflow-auto px-6 pb-10 pt-6 text-foreground"
              >
                {hasContent ? (
                  <ReactMarkdown components={markdownComponents}>
                    {markdownText}
                  </ReactMarkdown>
                ) : (
                  <p className="text-muted-foreground">{emptyMessage}</p>
                )}
              </TabsContent>

              <TabsContent
                value="markdown"
                className="flex-1 overflow-auto px-6 pb-10 pt-6"
              >
                {hasContent ? (
                  <pre className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-muted-foreground">
                    {markdownText}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">{emptyMessage}</p>
                )}
              </TabsContent>

              <div className="border-t px-6 py-3 text-xs text-muted-foreground">
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
    <div className={cn("flex items-center", className)}>
      <Sheet>
        <SheetTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="shadow-sm"
          >
            <Eye className="size-5" />
            <span className="sr-only">Open plan preview</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="gap-0 p-0 sm:max-w-xl">
          <SheetHeader className="sr-only">
            <SheetTitle>Plan preview</SheetTitle>
          </SheetHeader>
          <div className="flex h-full flex-col overflow-hidden">
            <PlanWorkspacePreviewContent plan={plan} className="h-full" />
          </div>
        </SheetContent>
      </Sheet>
    </div>
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
    segments.push("This plan does not include any outcomes yet.");
    return segments.join("\n\n");
  }

  outcomes.forEach((outcome, outcomeIndex) => {
    const title = outcome.title?.trim() || `Outcome ${outcomeIndex + 1}`;
    segments.push(`## Outcome ${outcomeIndex + 1}: ${title}`);

    const outcomeSummary = outcome.summary?.trim();
    if (outcomeSummary) {
      segments.push(outcomeSummary);
    }

    segments.push(`Status: ${formatStatus(outcome.status)}`);

    if (outcome.deliverables.length === 0) {
      segments.push("- No deliverables yet.");
      return;
    }

    const deliverableBlocks = outcome.deliverables.map(
      (deliverable, deliverableIndex) => {
        const deliverableTitle =
          deliverable.title?.trim() || `Deliverable ${deliverableIndex + 1}`;
        const header = `- **Deliverable ${deliverableIndex + 1}: ${deliverableTitle}** (${formatStatus(deliverable.status)})`;
        const details: string[] = [];

        const doneWhen = deliverable.doneWhen?.trim();
        if (doneWhen) {
          details.push(`\n  Done when: ${doneWhen}`);
        }

        const notes = deliverable.notes?.trim();
        if (notes) {
          details.push(`  - Notes: ${notes}`);
        }

        if (deliverable.actions.length === 0) {
          details.push("  No actions yet.");
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

function handleCopy(markdown: string, hasContent: boolean) {
  if (!hasContent) {
    return;
  }

  if (!navigator?.clipboard) {
    toast.error("Clipboard API unavailable in this browser.");
    return;
  }

  navigator.clipboard
    .writeText(markdown)
    .then(() => {
      toast.success("Plan markdown copied to clipboard.");
    })
    .catch(() => {
      toast.error("Failed to copy markdown.");
    });
}

function handleExport(markdown: string, planTitle: string) {
  if (!markdown.trim()) {
    return;
  }

  try {
    const filename = `${slugify(planTitle || "plan")}.md`;
    const blob = new Blob([markdown], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast.success("Plan markdown exported.");
  } catch (error) {
    console.error("Failed to export markdown", error);
    toast.error("Failed to export markdown.");
  }
}

function slugify(input: string): string {
  const base = input.trim().toLowerCase();
  const slug = base.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return slug || "plan";
}

const markdownComponents: MarkdownComponents = {
  h1: ({ className, ...props }) => (
    <h1
      className={cn(
        "text-3xl font-semibold tracking-tight text-foreground",
        className,
      )}
      {...props}
    />
  ),
  h2: ({ className, ...props }) => (
    <h2
      className={cn(
        "mt-8 text-2xl font-semibold text-foreground first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  h3: ({ className, ...props }) => (
    <h3
      className={cn(
        "mt-6 text-xl font-medium text-foreground first:mt-0",
        className,
      )}
      {...props}
    />
  ),
  p: ({ className, ...props }) => (
    <p
      className={cn("leading-7 text-muted-foreground", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }) => (
    <ul className={cn("ml-5 list-disc space-y-2", className)} {...props} />
  ),
  ol: ({ className, ...props }) => (
    <ol className={cn("ml-5 list-decimal space-y-2", className)} {...props} />
  ),
  li: ({ className, ...props }) => (
    <li
      className={cn("leading-6 text-muted-foreground", className)}
      {...props}
    />
  ),
  blockquote: ({ className, ...props }) => (
    <blockquote
      className={cn(
        "border-l-2 border-muted-foreground/40 pl-3 italic text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  code: ({ className, ...props }) => (
    <code
      className={cn(
        "rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground",
        className,
      )}
      {...props}
    />
  ),
};
