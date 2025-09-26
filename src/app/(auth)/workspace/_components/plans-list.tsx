import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { cn } from "@/lib/utils";

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

  const plans = await fetchQuery(api.plans.listPlans, {}, { token });

  if (!plans.length) {
    return (
      <div className="rounded-xl border border-dashed p-8 text-center">
        <p className="text-sm">
          No plans yet. Start a new plan to see it listed here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {plans.map((plan) => (
        <PlanRow key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function PlanRow({ plan }: { plan: ListedPlan }) {
  const updated = new Date(plan.updatedAt).toLocaleString();

  return (
    <Link
      href={`/workspace/${plan.id}`}
      className={cn(
        "flex items-center justify-between rounded-xl border bg-card p-5 shadow-sm transition hover:shadow-md",
      )}
    >
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{plan.title}</h2>
        <p className="text-sm line-clamp-2">{plan.summary || plan.idea}</p>
      </div>
      <p className="text-xs uppercase tracking-wide">Updated {updated}</p>
    </Link>
  );
}
