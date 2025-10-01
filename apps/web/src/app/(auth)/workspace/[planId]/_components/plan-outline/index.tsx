"use client";

import type { FunctionReturnType } from "convex/server";
import { ExternalLink, Lightbulb, Sparkles } from "lucide-react";
import type { api } from "@/convex/_generated/api";
import { OutlineSelectionProvider } from "./outline-selection-context";
import { PlanOutcomes } from "./plan-outcomes";

export type PlanOutlineProps = {
  plan?: FunctionReturnType<typeof api.plans.queries.getPlanSummary>;
};

type PlanSummary = FunctionReturnType<typeof api.plans.queries.getPlanSummary>;

export function PlanOutline({ plan }: PlanOutlineProps) {
  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] py-8 px-4">
        <div className="relative mb-4">
          <span className="absolute inset-0 rounded-full blur-2xl bg-primary/20 animate-pulse" />
          <span className="relative inline-flex items-center justify-center size-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/30 shadow-lg">
            <Sparkles className="size-8 text-primary animate-spin-slow" />
          </span>
        </div>
        <div className="text-center space-y-1">
          <div className="text-base sm:text-lg font-semibold text-primary">
            Loading your plan...
          </div>
          <div className="text-sm text-muted-foreground">
            We’re prepping your workspace and fetching your plan details.
          </div>
        </div>
      </div>
    );
  }

  if (plan.status === "scraping" || plan.status === "generating") {
    return <PlanGeneratingLoader plan={plan} />;
  }

  return (
    <OutlineSelectionProvider>
      <PlanOutlineContent plan={plan} />
    </OutlineSelectionProvider>
  );
}

function PlanGeneratingLoader({ plan }: { plan: PlanSummary }) {
  const isScraping = plan.status === "scraping";
  const insights = plan.researchInsights ?? [];
  const headline = isScraping ? "Gathering reference launches..." : "Crafting your plan...";
  const subcopy = isScraping
    ? "Scanning live products and posts that mirror your mission."
    : "AI is structuring your idea into outcomes, deliverables, and actionable steps.";

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[60vh] h-full overflow-hidden px-6 py-12">
      <div className="pointer-events-none absolute -left-24 top-12 h-72 w-72 rounded-xl bg-primary/20 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -right-16 bottom-8 h-64 w-64 rounded-xl bg-muted/40 blur-3xl animate-pulse [animation-delay:700ms]" />

      <div className="relative z-10 flex flex-col items-center gap-6 max-w-xl text-center">
        <div className="relative mb-2">
          <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full animate-pulse" />
          <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-8 rounded-2xl border border-primary/20 shadow-lg">
            <Sparkles className="size-14 text-primary animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight">{headline}</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-md">
            {subcopy}
          </p>
        </div>

        <div className="mt-2 w-full max-w-lg rounded-2xl border border-border/60 bg-background/90 p-5 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="rounded-lg bg-primary/10 p-2">
                <Lightbulb className="size-4 text-primary" />
              </div>
            </div>
            <div className="flex-1 text-left">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                Your idea
              </p>
              <p className="text-sm text-foreground/90 leading-relaxed break-words">{plan.idea}</p>
            </div>
          </div>
        </div>

        <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-background/90 p-5 shadow-lg">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              <div className="rounded-lg bg-primary/10 p-2">
                <ExternalLink className="size-4 text-primary" />
              </div>
            </div>
            <div className="flex-1 text-left space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Research sources
                </p>
                {insights.length > 0 ? (
                  <span className="text-[11px] text-muted-foreground/80 whitespace-nowrap">
                    {insights.length} found
                  </span>
                ) : null}
              </div>

              {insights.length > 0 ? (
                <ul className="space-y-2 text-sm text-foreground/90 max-h-56 overflow-y-auto">
                  {insights.slice(0, 4).map((insight, index) => (
                    <li key={insight.url} className="group flex items-start gap-2">
                      <a
                        href={insight.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex min-w-0 flex-1 flex-col gap-1 text-left leading-snug text-primary transition hover:text-primary/80"
                      >
                        <span className="font-medium text-sm line-clamp-1 break-words">
                          {insight.title}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-2 break-words">
                          {insight.snippet}
                        </span>
                      </a>
                    </li>
                  ))}
                  {insights.length > 4 ? (
                    <li className="text-xs text-muted-foreground">
                      + {insights.length - 4} more sources
                    </li>
                  ) : null}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {isScraping
                    ? "Collecting live examples to ground the plan."
                    : "No external references were found. The plan will rely on your idea alone."}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-1.5 mt-4">
          <div className="size-2 rounded-full bg-primary/70 animate-bounce" />
          <div className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:150ms]" />
          <div className="size-2 rounded-full bg-primary/70 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </section>
  );
}

type PlanOutlineContentProps = {
  plan: PlanSummary;
};

function PlanOutlineContent({ plan }: PlanOutlineContentProps) {
  return (
    <div className="flex flex-col pt-2">
      <PlanOutcomes planId={plan.id} />
    </div>
  );
}
