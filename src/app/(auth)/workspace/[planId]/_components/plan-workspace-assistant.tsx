"use client";

import { AlertCircle, CheckCircle2, Clock, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type PlanSummary = NonNullable<
  (typeof api.plans.queries.getPlanSummary)["_returnType"]
>;

type PlanWorkspaceAssistantContentProps = {
  plan: PlanSummary;
  className?: string;
};

type AdjustmentStatus = "applied" | "pending" | "error";

type AdjustmentExample = {
  id: string;
  prompt: string;
  summary: string;
  status: AdjustmentStatus;
  timestamp: string;
};

const adjustmentExamples: AdjustmentExample[] = [
  {
    id: "adj-1",
    prompt: "Make the plan emphasize a crisp release narrative",
    summary: "Summary refreshed and outcomes reordered",
    status: "applied",
    timestamp: "Sep 28 • 2:12 PM",
  },
  {
    id: "adj-2",
    prompt: "Ensure timeline balances design and engineering effort",
    summary: "Suggested redistributing outcome workload",
    status: "pending",
    timestamp: "Sep 27 • 4:46 PM",
  },
  {
    id: "adj-3",
    prompt: "Tighten deliverables to remove marketing tasks",
    summary: "No marketing deliverables detected",
    status: "error",
    timestamp: "Sep 26 • 11:18 AM",
  },
];

function AdjustmentStatusBadge({ status }: { status: AdjustmentStatus }) {
  const styles: Record<AdjustmentStatus, string> = {
    applied:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
    pending:
      "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
    error: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
  };

  const icons: Record<AdjustmentStatus, React.ReactNode> = {
    applied: <CheckCircle2 className="size-3.5" />,
    pending: <Clock className="size-3.5" />,
    error: <AlertCircle className="size-3.5" />,
  };

  const labels: Record<AdjustmentStatus, string> = {
    applied: "Applied",
    pending: "Review",
    error: "Needs attention",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-medium",
        styles[status],
      )}
    >
      {icons[status]}
      {labels[status]}
    </span>
  );
}

function ScopeBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80">
      <Sparkles className="size-3" /> Whole plan
    </span>
  );
}

function AdjustmentExampleCard({
  adjustment,
}: {
  adjustment: AdjustmentExample;
}) {
  return (
    <article className="rounded-md border border-border/60 bg-card/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground/90">
          {adjustment.summary}
        </p>
        <AdjustmentStatusBadge status={adjustment.status} />
      </div>
      <p className="mt-1 text-xs text-muted-foreground/80">
        {adjustment.prompt}
      </p>
      <p className="mt-2 text-[11px] text-muted-foreground/70">
        {adjustment.timestamp}
      </p>
    </article>
  );
}

export function PlanWorkspaceAssistantContent({
  plan: _plan,
  className,
}: PlanWorkspaceAssistantContentProps) {
  return (
    <div className={cn("flex h-full flex-col gap-4", className)}>
      <header className="flex flex-col gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-muted-foreground">
          Assistant
        </span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
          <span>Target:</span>
          <ScopeBadge />
        </div>
        <p className="text-xs text-muted-foreground/80">
          Share one instruction to adjust the plan; you can review changes in
          the list below.
        </p>
      </header>

      <Separator />

      <section className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">
            Recent adjustments
          </h3>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-3"
            onClick={() => {
              console.log("Open full adjustment history");
            }}
          >
            See all
          </Button>
        </div>
        <div className="flex flex-col gap-2">
          {adjustmentExamples.map((adjustment) => (
            <AdjustmentExampleCard
              key={adjustment.id}
              adjustment={adjustment}
            />
          ))}
        </div>
      </section>

      <Separator />

      <section className="flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/10 p-3">
        <h3 className="text-sm font-semibold text-foreground">
          New adjustment
        </h3>
        <Textarea
          placeholder="Ex: Highlight quality assurance and tighten release milestones across outcomes."
          onChange={() => {
            console.log("Textarea change – wiring coming soon");
          }}
          className="min-h-24 text-sm"
        />
        <div className="flex justify-end">
          <Button
            type="button"
            size="sm"
            onClick={() => {
              console.log("Generate plan adjustment");
            }}
          >
            Generate adjustment
          </Button>
        </div>
      </section>
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
        "flex h-full min-h-0 w-full flex-col gap-4 overflow-y-auto rounded-lg border bg-card p-5",
        className,
      )}
    >
      <PlanWorkspaceAssistantContent plan={plan} />
    </aside>
  );
}
