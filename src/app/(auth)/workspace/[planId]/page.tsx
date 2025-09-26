import { fetchQuery } from "convex/nextjs";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";

export default async function PlanWorkspacePage({
  params,
}: {
  params: { planId: string };
}) {
  const token = await getToken();

  if (!token) {
    throw new Error("Authentication token missing");
  }

  const plan = await fetchQuery(
    api.plans.getPlan,
    { planId: params.planId as Id<"plans"> },
    { token },
  );

  if (!plan) {
    notFound();
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide">Plan overview</p>
          <h1 className="text-3xl font-semibold">{plan.mission}</h1>
          <p className="text-sm">{plan.idea}</p>
        </div>
        <Button asChild variant="secondary">
          <Link href="/workspace">Back to plans</Link>
        </Button>
      </header>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Stored plan JSON</h2>
        <p className="text-sm">
          Temporary view until the full editor is wired. Data is already stored
          in Convex.
        </p>
        <pre className="mt-4 max-h-[32rem] overflow-y-auto whitespace-pre-wrap rounded border px-4 py-3 text-xs">
          {JSON.stringify(plan, null, 2)}
        </pre>
      </section>
    </div>
  );
}
