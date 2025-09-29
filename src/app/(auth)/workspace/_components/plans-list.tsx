import { fetchQuery } from "convex/nextjs";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";

type ListedPlan = {
  id: Id<"plans">;
  title: string;
  idea: string;
  summary: string;
  createdAt: number;
  updatedAt: number;
};

export async function PlansList() {
  const token = await getToken();

  if (!token) {
    throw new Error("Authentication token missing");
  }

  const plans = await fetchQuery(api.plans.queries.listPlans, {}, { token });

  if (!plans.length) {
    return (
      <div className="rounded-3xl border border-dashed border-border/60 bg-muted/10 px-6 py-12 text-center">
        <h3 className="text-base font-semibold">No plans yet</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Start by describing an idea above. Your generated plans will show up
          here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <PlanRow key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function PlanRow({ plan }: { plan: ListedPlan }) {
  const updated = new Date(plan.updatedAt);
  const updatedLabel = updated.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  return (
    <Link
      href={`/workspace/${plan.id}`}
      className="group flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card/70 px-5 py-4 shadow-sm transition hover:-translate-y-1  hover:bg-card hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight transition group-hover:text-primary">
          {plan.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {plan.summary || plan.idea}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-3 text-right text-xs text-muted-foreground">
        <span className="rounded-full border border-border/60 px-3 py-1 uppercase tracking-wide">
          Updated {updatedLabel}
        </span>
        <ArrowUpRight className="size-4 text-muted-foreground transition group-hover:text-primary" />
      </div>
    </Link>
  );
}
