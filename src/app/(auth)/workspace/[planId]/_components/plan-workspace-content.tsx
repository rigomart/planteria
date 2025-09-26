"use client";

import { type Preloaded, usePreloadedQuery } from "convex/react";
import { AlertTriangle, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { api } from "@/convex/_generated/api";
import { PlanOutline } from "./plan-outline";

type PlanWorkspaceContentProps = {
  preloadedPlan: Preloaded<typeof api.plans.getPlan>;
};

export function PlanWorkspaceContent({
  preloadedPlan,
}: PlanWorkspaceContentProps) {
  const plan = usePreloadedQuery(preloadedPlan);

  if (plan === undefined) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold">Loading plan</h1>
            <p className="text-sm text-muted-foreground">
              Setting up your workspace and subscribing to live updates.
            </p>
          </div>
          <Button asChild variant="secondary" disabled>
            <Link href="/workspace">Back to plans</Link>
          </Button>
        </div>
        <section className="flex items-center gap-3 rounded-xl border bg-card p-6 text-sm text-muted-foreground shadow-sm">
          <Loader2 className="size-5 animate-spin" />
          Loading...
        </section>
      </div>
    );
  }

  if (plan === null) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold">Plan missing</h1>
            <p className="text-sm text-muted-foreground">
              We couldn’t load this plan. Try returning to your workspace.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/workspace">Back to plans</Link>
          </Button>
        </header>
      </div>
    );
  }

  if (plan.status !== "ready") {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold">{plan.title}</h1>
            <p className="text-sm text-muted-foreground">{plan.idea}</p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/workspace">Back to plans</Link>
          </Button>
        </header>

        <section className="rounded-xl border bg-card p-6 shadow-sm">
          {plan.status === "generating" && (
            <GeneratingPlanView idea={plan.idea} />
          )}
          {plan.status === "error" && (
            <PlanErrorView error={plan.generationError} />
          )}
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-4">
      <div className="flex flex-col gap-4">
        <Button asChild variant="secondary" size="sm" className="self-start">
          <Link href="/workspace">
            <ArrowLeft className="size-4" />
            Back to plans
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-semibold">
              {plan.title}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="max-w-2xl text-sm text-muted-foreground">
              {plan.summary}
            </p>

            <div className="flex flex-col gap-1 rounded-lg border p-3 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">Initial idea</span>
              <span className="text-muted-foreground/90">{plan.idea}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <PlanOutline plan={plan} />
    </div>
  );
}

function GeneratingPlanView({ idea }: { idea: string }) {
  return (
    <div className="flex flex-col items-start gap-4">
      <div className="flex items-center gap-3">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
        <h2 className="text-lg font-semibold">Drafting your plan</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        We’re turning your idea into outcomes, deliverables, and actions. This
        usually takes less than a minute.
      </p>
      <div className="rounded-md bg-muted p-3 text-xs">
        <p className="font-semibold text-muted-foreground">Idea</p>
        <p>{idea}</p>
      </div>
    </div>
  );
}

function PlanErrorView({ error }: { error: string | null }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 text-destructive">
        <AlertTriangle className="size-5" />
        <h2 className="text-lg font-semibold">Plan generation failed</h2>
      </div>
      <p className="text-sm text-muted-foreground">
        Something went wrong while asking the planning agent for a draft. You
        can return to the workspace and try again.
      </p>
      {error ? (
        <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive">
          {error}
        </div>
      ) : null}
    </div>
  );
}
