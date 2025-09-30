"use client";

import type { FunctionReturnType } from "convex/server";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

type PlanSummary = FunctionReturnType<typeof api.plans.queries.getPlanSummary>;

type AssistantLayout = "sidebar" | "card";

type PlanWorkspaceAssistantProps = {
  plan?: PlanSummary;
  layout?: AssistantLayout;
  className?: string;
};

export function PlanWorkspaceAssistant({
  plan,
  layout = "sidebar",
  className,
}: PlanWorkspaceAssistantProps) {
  return (
    <div className={cn(containerClassName(layout), className)}>
      <AssistantHeader plan={plan} />
      <AssistantHistoryPlaceholder />
      <AssistantComposer layout={layout} />
    </div>
  );
}

function AssistantHeader({ plan }: { plan?: PlanSummary }) {
  const title = plan?.title?.trim() || plan?.idea?.trim() || "Plan adjustments";

  return (
    <header className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold uppercase text-muted-foreground">
          Plan AI
        </h2>
        <span className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-background px-2.5 py-1 text-[11px] font-medium text-foreground/80">
          Whole plan
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-base font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">
          Apply guided adjustments across outcomes, deliverables, and actions.
        </p>
      </div>
    </header>
  );
}

function AssistantHistoryPlaceholder() {
  return (
    <section className="flex flex-col gap-2 rounded-lg border border-dashed border-border/60 bg-background/80 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">
          Recent adjustments
        </h3>
        <span className="text-[11px] text-muted-foreground">
          No entries yet
        </span>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Adjustments you run will appear here with status, summary, and timing.
      </p>
    </section>
  );
}

function AssistantComposer({ layout }: { layout: AssistantLayout }) {
  return (
    <section
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border/60 bg-background/90 p-4",
        layout === "sidebar" ? "mt-auto" : null,
      )}
    >
      <div className="space-y-1">
        <h3 className="text-sm font-semibold text-foreground">
          New instruction
        </h3>
        <p className="text-xs text-muted-foreground">
          Share what needs to shift. We’ll update the full plan. Wiring coming
          soon.
        </p>
      </div>
      <textarea
        placeholder="Ex: Tighten release milestones and balance QA coverage across outcomes."
        disabled
        className="h-28 w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-0"
      />
      <Button type="button" disabled>
        <Sparkles className="size-3.5" />
        Adjust plan
      </Button>
    </section>
  );
}

function containerClassName(layout: AssistantLayout) {
  if (layout === "card") {
    return "flex flex-col gap-5 rounded-xl border border-border/60 bg-card/80 p-4 shadow-sm";
  }

  return "flex h-full min-h-0 w-full flex-col gap-5 overflow-y-auto border border-border/60 bg-card/70 p-4";
}
