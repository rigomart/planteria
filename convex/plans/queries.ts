import { v } from "convex/values";

import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";
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
 * Query that loads a single plan plus nested structure with an authorization check.
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

    return loadPlanWithStructure(ctx, plan._id);
  },
});

/**
 * Aggregate the plan document with its ordered outcomes, deliverables, and actions.
 */
async function loadPlanWithStructure(
  ctx: QueryCtx | MutationCtx,
  planId: Id<"plans">,
) {
  const plan = await ctx.db.get(planId);
  if (!plan) {
    return null;
  }

  const outcomes = await ctx.db
    .query("outcomes")
    .withIndex("by_plan_order", (q) => q.eq("planId", planId))
    .collect();

  const outcomePayload = [];
  for (const outcome of outcomes) {
    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_outcome_order", (q) => q.eq("outcomeId", outcome._id))
      .collect();

    const deliverablePayload = [];
    for (const deliverable of deliverables) {
      const actions = await ctx.db
        .query("actions")
        .withIndex("by_deliverable_order", (q) =>
          q.eq("deliverableId", deliverable._id),
        )
        .collect();

      deliverablePayload.push({
        id: deliverable._id,
        title: deliverable.title,
        doneWhen: deliverable.doneWhen,
        notes: deliverable.notes ?? null,
        status: deliverable.status,
        order: deliverable.order,
        actions: actions.map((actionDoc) => ({
          id: actionDoc._id,
          title: actionDoc.title,
          status: actionDoc.status,
          order: actionDoc.order,
        })),
      });
    }

    outcomePayload.push({
      id: outcome._id,
      title: outcome.title,
      summary: outcome.summary,
      status: outcome.status,
      order: outcome.order,
      deliverables: deliverablePayload,
    });
  }

  return {
    id: plan._id,
    idea: plan.idea,
    title: plan.title ?? plan.idea,
    summary: plan.summary,
    status: plan.status,
    generationError: plan.generationError ?? null,
    outcomes: outcomePayload,
  };
}
