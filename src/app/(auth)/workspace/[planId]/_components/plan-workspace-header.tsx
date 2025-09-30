"use client";

import type { FunctionReturnType } from "convex/server";
import { NotebookText } from "lucide-react";
import type { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { PlanWorkspacePreview } from "./plan-workspace-preview";

type PlanSummary = FunctionReturnType<typeof api.plans.queries.getPlanSummary>;

type PlanWorkspaceHeaderProps = {
  plan?: PlanSummary;
  className?: string;
};

export function PlanWorkspaceHeader({
  plan,
  className,
}: PlanWorkspaceHeaderProps) {
  const title = plan?.title?.trim() || plan?.idea?.trim() || "Plan";
  const status = plan?.status ?? "generating";

  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
        className,
      )}
    >
      <div className="mx-auto flex max-w-none items-center justify-between gap-3 px-3 py-2 md:px-6">
        {/* Left: identity */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-1.5">
            <NotebookText className="size-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold leading-6 text-foreground md:text-base">
              {title}
            </h1>
            <div className="mt-0.5 flex items-center gap-2">
              <PlanStatus status={status} />
              {plan ? (
                <span className="hidden text-[11px] text-muted-foreground/80 sm:inline">
                  Updated {new Date(plan.updatedAt).toLocaleString()}
                </span>
              ) : (
                <span className="hidden text-[11px] text-muted-foreground/80 sm:inline">
                  Loading…
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: actions (desktop) */}
        <div className="hidden md:block">
          <PlanWorkspacePreview plan={plan} />
        </div>
      </div>
    </header>
  );
}

function PlanStatus({
  status,
}: {
  status: PlanSummary["status"] | "generating" | "ready" | "error";
}) {
  const style = getPlanStatusStyle(status);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        style.badge,
      )}
    >
      <span className={cn("size-1.5 rounded-full", style.dot)} />
      {style.label}
    </span>
  );
}

function getPlanStatusStyle(
  status: PlanSummary["status"] | "generating" | "ready" | "error",
) {
  switch (status) {
    case "ready":
      return {
        label: "Ready",
        badge:
          "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300",
        dot: "bg-green-500",
      } as const;
    case "error":
      return {
        label: "Error",
        badge: "border-destructive/30 bg-destructive/10 text-destructive",
        dot: "bg-destructive",
      } as const;
    default:
      return {
        label: "Generating",
        badge: "border-primary/40 bg-primary/10 text-primary",
        dot: "bg-primary",
      } as const;
  }
}
