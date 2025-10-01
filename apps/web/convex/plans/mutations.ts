import { v } from "convex/values";

import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { mutation } from "../_generated/server";
import { requirePlanOwnership } from "../lib/ownership";

export const deletePlan = mutation({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { plan } = await requirePlanOwnership(ctx, args.planId, identity.subject);

    await deletePlanHierarchy(ctx, args.planId, plan.userId);

    return { success: true };
  },
});

async function deletePlanHierarchy(ctx: MutationCtx, planId: Id<"plans">, userId: string) {
  const outcomes = await ctx.db
    .query("outcomes")
    .withIndex("by_plan", (q) => q.eq("planId", planId))
    .collect();

  for (const outcome of outcomes) {
    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_outcome", (q) => q.eq("outcomeId", outcome._id))
      .collect();

    for (const deliverable of deliverables) {
      const actions = await ctx.db
        .query("actions")
        .withIndex("by_deliverable", (q) => q.eq("deliverableId", deliverable._id))
        .collect();

      for (const action of actions) {
        await ctx.db.delete(action._id);
      }

      await ctx.db.delete(deliverable._id);
    }

    await ctx.db.delete(outcome._id);
  }

  const planThreads = await ctx.db
    .query("plan_threads")
    .withIndex("by_plan", (q) => q.eq("planId", planId))
    .collect();

  for (const thread of planThreads) {
    await ctx.db.delete(thread._id);
  }

  const planEvents = await ctx.db
    .query("plan_ai_events")
    .withIndex("by_plan_createdAt", (q) => q.eq("planId", planId))
    .collect();

  for (const event of planEvents) {
    await ctx.db.delete(event._id);
  }

  await ctx.db.delete(planId);

  const usage = await ctx.db
    .query("user_ai_usage")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();

  if (usage) {
    const nextCount = Math.max(0, usage.plansGenerated - 1);
    await ctx.db.patch(usage._id, {
      plansGenerated: nextCount,
      updatedAt: Date.now(),
    });
  }
}
