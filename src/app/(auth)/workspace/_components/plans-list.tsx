import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";
import { PlanRow } from "./plan-row";

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
