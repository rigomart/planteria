import { v } from "convex/values";

import { query } from "../_generated/server";

/**
 * Query returning the authenticated user's plans, newest first, for the workspace list view.
 */
export const listPlans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const plans = await ctx.db
      .query("plans")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();

    return plans
      .map((plan) => ({
        id: plan._id,
        title: plan.title ?? plan.idea,
        idea: plan.idea,
        summary: plan.summary,
        status: plan.status,
        generationError: plan.generationError ?? null,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

/**
 * Query returning basic plan metadata (title, idea, summary, status) for a single plan.
 */
export const getPlanSummary = query({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== identity.subject) {
      return null;
    }

    return {
      id: plan._id,
      idea: plan.idea,
      title: plan.title ?? plan.idea,
      summary: plan.summary,
      status: plan.status,
      generationError: plan.generationError ?? null,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  },
});

/**
 * Query that loads a single plan plus nested structure with an authorization check.
 * @deprecated Use getPlanSummary along with slice-level queries (listByPlan, listByOutcome, listByDeliverable) instead
 */
export const getPlan = query({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== identity.subject) {
      return null;
    }

    // For now, just return the plan summary since we've moved to slice-level queries
    return {
      id: plan._id,
      idea: plan.idea,
      title: plan.title ?? plan.idea,
      summary: plan.summary,
      status: plan.status,
      generationError: plan.generationError ?? null,
      outcomes: [], // Empty since we're using slice-level queries now
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  },
});
