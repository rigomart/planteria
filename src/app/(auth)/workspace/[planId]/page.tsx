import { preloadQuery } from "convex/nextjs";
import { notFound } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { PlanWorkspaceContent } from "./_components/plan-workspace-content";

export default async function PlanWorkspacePage({
  params,
}: {
  params: Promise<{ planId: Id<"plans"> }>;
}) {
  const token = await getToken();

  if (!token) {
    throw new Error("Authentication token missing");
  }

  const { planId } = await params;

  const preloadedPlan = await preloadQuery(
    api.plans.queries.getPlanSummary,
    { planId },
    { token },
  );

  if (!preloadedPlan) {
    notFound();
  }

  return <PlanWorkspaceContent preloadedPlan={preloadedPlan} />;
}
