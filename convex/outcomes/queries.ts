import { v } from "convex/values";
import { query } from "../_generated/server";
import { requirePlanOwnership } from "../lib/ownership";

/**
 * Query returning ordered outcomes for a specific plan.
 */
export const listByPlan = query({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Verify plan ownership
    await requirePlanOwnership(ctx, args.planId, identity.subject);

    const outcomes = await ctx.db
      .query("outcomes")
      .withIndex("by_plan_order", (q) => q.eq("planId", args.planId))
      .collect();

    return outcomes.map((outcome) => ({
      id: outcome._id,
      title: outcome.title,
      summary: outcome.summary,
      status: outcome.status,
      order: outcome.order,
      createdAt: outcome.createdAt,
      updatedAt: outcome.updatedAt,
    }));
  },
});
