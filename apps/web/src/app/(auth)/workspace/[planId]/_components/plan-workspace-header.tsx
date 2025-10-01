"use client";

import type { FunctionReturnType } from "convex/server";
import { ArrowLeft, Info, NotebookText } from "lucide-react";
import Link from "next/link";
import { UserMenu } from "@/app/(auth)/_components/user-menu";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { PlanWorkspacePreview } from "./plan-workspace-preview";

type PlanSummary = FunctionReturnType<typeof api.plans.queries.getPlanSummary>;

type PlanWorkspaceHeaderProps = {
  plan?: PlanSummary;
  className?: string;
};

export function PlanWorkspaceHeader({ plan, className }: PlanWorkspaceHeaderProps) {
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
        {/* Left: identity with plan details */}
        <div className="flex min-w-0 items-center gap-2 md:gap-3">
          {/* Back button */}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/workspace">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>

          <div className="rounded-lg bg-primary/10 p-1.5">
            <NotebookText className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex items-center gap-2">
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

            {/* Plan details popover */}
            {plan && (
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="size-7 text-muted-foreground">
                    <Info className="size-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80" align="start">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                        Original Idea
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed">{plan.idea}</p>
                    </div>
                    {plan.summary && (
                      <div>
                        <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-1.5">
                          Summary
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {plan.summary}
                        </p>
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2">
          <div className="hidden md:block">
            <PlanWorkspacePreview plan={plan} />
          </div>
          <UserMenu />
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

function getPlanStatusStyle(status: PlanSummary["status"] | "generating" | "ready" | "error") {
  switch (status) {
    case "ready":
      return {
        label: "Ready",
        badge: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300",
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
