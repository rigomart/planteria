"use client";

import type { FunctionReturnType } from "convex/server";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import type { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type PlanSummary = NonNullable<
  FunctionReturnType<typeof api.plans.queries.getPlanSummary>
>;

type PlanWorkspaceAssistantContentProps = {
  plan: PlanSummary;
  className?: string;
};

type AdjustmentExample = {
  id: string;
  prompt: string;
  summary: string;
  timestamp: string;
};

const adjustmentExamples: AdjustmentExample[] = [
  {
    id: "adj-1",
    prompt: "Make the plan emphasize a crisp release narrative",
    summary: "Summary refreshed and outcomes reordered",
    timestamp: "Sep 28 • 2:12 PM",
  },
  {
    id: "adj-2",
    prompt: "Ensure timeline balances design and engineering effort",
    summary: "Suggested redistributing outcome workload",
    timestamp: "Sep 27 • 4:46 PM",
  },
  {
    id: "adj-3",
    prompt: "Tighten deliverables to remove marketing tasks",
    summary: "No marketing deliverables detected",
    timestamp: "Sep 26 • 11:18 AM",
  },
];

function ScopeBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80">
      Whole plan
    </span>
  );
}

function AdjustmentExampleCard({
  adjustment,
}: {
  adjustment: AdjustmentExample;
}) {
  return (
    <article className="rounded-lg border border-border/60 bg-card/60 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground/90">
          {adjustment.summary}
        </p>
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
      <div className="flex flex-col gap-2">
        <span className="text-sm font-semibold uppercase text-muted-foreground">
          AI Assistant
        </span>
        <p className="text-xs text-muted-foreground">
          Write instructions and let Planteria adjust the plan for you.
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
          <span>Target:</span>
          <ScopeBadge />
        </div>
      </div>

      <Separator />

      <section className="flex flex-col gap-2 flex-1">
        <h3 className="text-sm font-semibold text-foreground">
          Recent changes
        </h3>

        <div className="flex flex-col gap-2">
          {adjustmentExamples.map((adjustment) => (
            <AdjustmentExampleCard
              key={adjustment.id}
              adjustment={adjustment}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-border/60 bg-background/90 shadow-lg">
        <Textarea
          placeholder="Ex: Highlight quality assurance and tighten release milestones across outcomes."
          onChange={() => {
            console.log("Textarea change – wiring coming soon");
          }}
          className="min-h-24 max-h-32 text-sm rounded-2xl border-0 bg-transparent"
        />
        <div className="flex justify-end">
          <Button
            type="button"
            onClick={() => {
              console.log("Generate plan adjustment");
            }}
          >
            <Sparkles className="size-3.5" />
            Adjust
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
        "flex h-full min-h-0 w-full flex-col gap-4 overflow-y-auto border p-3",
        className,
      )}
    >
      <PlanWorkspaceAssistantContent plan={plan} />
    </aside>
  );
}
