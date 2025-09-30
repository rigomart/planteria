import { v } from "convex/values";

import { query } from "../_generated/server";
import { requirePlanOwnership } from "../lib/ownership";

/**
 * Query returning the authenticated user's plans, newest first, for the workspace list view.
 */
export const listPlans = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
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
      throw new Error("User not authenticated");
    }

    const plan = await ctx.db.get(args.planId);
    if (!plan || plan.userId !== identity.subject) {
      throw new Error("Plan not found");
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
 * Query returning the full plan hierarchy for preview/export experiences.
 */
export const getPlanPreview = query({
  args: {
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const { plan } = await requirePlanOwnership(
      ctx,
      args.planId,
      identity.subject,
    );

    const outcomes = await ctx.db
      .query("outcomes")
      .withIndex("by_plan_order", (q) => q.eq("planId", args.planId))
      .collect();

    const outcomesWithChildren = await Promise.all(
      outcomes.map(async (outcome) => {
        const deliverables = await ctx.db
          .query("deliverables")
          .withIndex("by_outcome_order", (q) => q.eq("outcomeId", outcome._id))
          .collect();

        const deliverablesWithActions = await Promise.all(
          deliverables.map(async (deliverable) => {
            const actions = await ctx.db
              .query("actions")
              .withIndex("by_deliverable_order", (q) =>
                q.eq("deliverableId", deliverable._id),
              )
              .collect();

            return {
              id: deliverable._id,
              outcomeId: deliverable.outcomeId,
              title: deliverable.title,
              doneWhen: deliverable.doneWhen,
              notes: deliverable.notes ?? null,
              status: deliverable.status,
              order: deliverable.order,
              createdAt: deliverable.createdAt,
              updatedAt: deliverable.updatedAt,
              actions: actions.map((action) => ({
                id: action._id,
                deliverableId: action.deliverableId,
                title: action.title,
                status: action.status,
                order: action.order,
                createdAt: action.createdAt,
                updatedAt: action.updatedAt,
              })),
            };
          }),
        );

        return {
          id: outcome._id,
          planId: outcome.planId,
          title: outcome.title,
          summary: outcome.summary,
          status: outcome.status,
          order: outcome.order,
          createdAt: outcome.createdAt,
          updatedAt: outcome.updatedAt,
          deliverables: deliverablesWithActions,
        };
      }),
    );

    return {
      plan: {
        id: plan._id,
        title: plan.title ?? plan.idea,
        idea: plan.idea,
        summary: plan.summary,
        status: plan.status,
        generationError: plan.generationError ?? null,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      },
      outcomes: outcomesWithChildren,
    };
  },
});
