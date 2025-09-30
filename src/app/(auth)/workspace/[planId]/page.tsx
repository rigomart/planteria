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

  return <PlanWorkspaceContent planId={planId} />;
}
