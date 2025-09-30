"use client";

import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { AlertTriangle, Loader2, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

dayjs.extend(relativeTime);

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
      <AssistantHeader />
      <AssistanHistoryWrapper plan={plan} layout={layout} />
      <AssistantComposer layout={layout} />
    </div>
  );
}

function AssistantHeader() {
  return (
    <header className="flex items-center gap-2 pb-1">
      <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-1.5">
        <Wand2 className="size-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-sm font-semibold text-foreground">Plan AI</h2>
        <p className="text-xs text-muted-foreground truncate">
          Guided plan adjustments
        </p>
      </div>
    </header>
  );
}

function AssistanHistoryWrapper({
  plan,
  layout,
}: {
  plan?: PlanSummary;
  layout: AssistantLayout;
}) {
  if (!plan) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  return <AssistantHistory plan={plan} layout={layout} />;
}

type HistoryEntry = FunctionReturnType<typeof api.planAiHistory.list>[number];

function AssistantHistory({
  plan,
  layout,
}: {
  plan: PlanSummary;
  layout: AssistantLayout;
}) {
  const history = useQuery(api.planAiHistory.list, {
    planId: plan.id,
    limit: layout === "sidebar" ? 25 : 10,
  });

  if (history === undefined) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (!history || history.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/40 bg-muted/20 px-4 py-8 text-center">
        <p className="text-sm text-muted-foreground">
          Adjustments will appear here
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Recent changes
        </h3>
        <span className="text-xs text-muted-foreground/70">
          {history.length}
        </span>
      </div>

      <div className="relative flex flex-col">
        {/* Timeline vertical line */}
        <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/60" />

        {/* Timeline entries */}
        <div className="flex flex-col">
          {history.map((entry) => (
            <HistoryRow key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HistoryRow({ entry }: { entry: HistoryEntry }) {
  const { status, prompt, summary, error, createdAt } = entry;
  const timestamp = dayjs(createdAt).fromNow();

  return (
    <article className="group relative flex gap-3 pb-4 last:pb-0">
      {/* Timeline bullet point */}
      <div className="relative z-10 flex-shrink-0">
        <TimelineBullet status={status} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="space-y-1">
          <p className="text-sm text-foreground/90 leading-relaxed">
            {summary?.trim() || prompt.trim()}
          </p>
          <p className="text-xs text-muted-foreground">{timestamp}</p>
          {error && (
            <p className="flex items-center gap-1 text-xs text-destructive mt-1.5">
              <AlertTriangle className="size-3" />
              {error}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function TimelineBullet({ status }: { status: HistoryEntry["status"] }) {
  switch (status) {
    case "pending":
      return (
        <div className="flex size-4 items-center justify-center rounded-full bg-primary/20 ring-2 ring-background">
          <Loader2 className="size-2.5 text-primary animate-spin" />
        </div>
      );
    case "error":
      return (
        <div className="flex size-4 items-center justify-center rounded-full bg-destructive/20 ring-2 ring-background">
          <div className="size-2 rounded-full bg-destructive" />
        </div>
      );
    default:
      return (
        <div className="flex size-4 items-center justify-center rounded-full bg-primary/20 ring-2 ring-background">
          <div className="size-2 rounded-full bg-primary" />
        </div>
      );
  }
}

function AssistantComposer({ layout }: { layout: AssistantLayout }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl border border-border/60 bg-background/90 p-4 shadow-sm",
        layout === "sidebar" ? "mt-auto" : null,
      )}
    >
      <textarea
        placeholder="Describe what needs to change..."
        disabled
        className="h-24 w-full resize-none rounded-xl border border-border/40 bg-muted/30 px-3 py-2.5 text-sm placeholder:text-muted-foreground/60 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
      />
      <Button type="button" disabled className="w-full">
        <Sparkles className="size-3.5" />
        Adjust plan
      </Button>
      <p className="text-center text-xs text-muted-foreground/70">
        Coming soon
      </p>
    </div>
  );
}

function containerClassName(layout: AssistantLayout) {
  if (layout === "card") {
    return "flex flex-col gap-4 rounded-2xl border border-border/60 bg-card/80 p-5 shadow-sm";
  }

  return "flex h-full min-h-0 w-full flex-col gap-4 overflow-y-auto border border-border/60 bg-card/70 p-5";
}
