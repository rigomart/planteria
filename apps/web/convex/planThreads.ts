import { v } from "convex/values";

import { internalMutation, internalQuery } from "./_generated/server";
import { requirePlanOwnership } from "./lib/ownership";

export const getPlanThread = internalQuery({
  args: {
    planId: v.id("plans"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePlanOwnership(ctx, args.planId, args.userId);

    const [planThread] = await ctx.db
      .query("plan_threads")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .collect();

    return planThread ?? null;
  },
});

export const savePlanThread = internalMutation({
  args: {
    planId: v.id("plans"),
    userId: v.string(),
    threadId: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePlanOwnership(ctx, args.planId, args.userId);

    const now = Date.now();
    const [planThread] = await ctx.db
      .query("plan_threads")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .collect();

    if (planThread) {
      await ctx.db.patch(planThread._id, {
        threadId: args.threadId,
        updatedAt: now,
      });

      return { threadId: args.threadId };
    }

    await ctx.db.insert("plan_threads", {
      planId: args.planId,
      threadId: args.threadId,
      createdAt: now,
      updatedAt: now,
    });

    return { threadId: args.threadId };
  },
});
