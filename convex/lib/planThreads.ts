import { createThread } from "@convex-dev/agent";

import { components, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import type { ActionCtx } from "../_generated/server";

const THREAD_TITLE = "Plan adjustments";
const THREAD_SUMMARY = "Thread for plan-level AI adjustments.";

type PlanThreadArgs = {
  planId: Id<"plans">;
  userId: string;
};

export async function getOrCreatePlanThread(
  ctx: ActionCtx,
  { planId, userId }: PlanThreadArgs,
): Promise<string> {
  const existing = await ctx.runQuery(internal.planThreads.getPlanThread, {
    planId,
    userId,
  });

  if (existing) {
    return existing.threadId;
  }

  const threadId = await createThread(ctx, components.agent, {
    userId,
    title: THREAD_TITLE,
    summary: THREAD_SUMMARY,
  });

  await ctx.runMutation(internal.planThreads.savePlanThread, {
    planId,
    userId,
    threadId,
  });

  return threadId;
}
