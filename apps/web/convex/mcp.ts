import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { internalQuery } from "./_generated/server";

type PlanDoc = Doc<"plans">;
type DeliverableDoc = Doc<"deliverables">;
type ActionDoc = Doc<"actions">;

type PlanSummary = Pick<
  PlanDoc,
  "_id" | "title" | "idea" | "summary" | "status" | "generationError" | "createdAt" | "updatedAt"
>;

function summarizePlan(plan: PlanDoc): PlanSummary & { title: string } {
  return {
    _id: plan._id,
    title: plan.title ?? plan.idea,
    idea: plan.idea,
    summary: plan.summary,
    status: plan.status,
    generationError: plan.generationError ?? null,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
  };
}

export const latestPlansForUser = internalQuery({
  args: {
    userId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 5, 10));

    const plans = await ctx.db
      .query("plans")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    plans.sort((a, b) => b.updatedAt - a.updatedAt);

    return {
      plans: plans.slice(0, limit).map((plan) => {
        const summary = summarizePlan(plan);
        return {
          id: summary._id,
          title: summary.title,
          idea: summary.idea,
          summary: summary.summary,
          status: summary.status,
          generationError: summary.generationError,
          createdAt: summary.createdAt,
          updatedAt: summary.updatedAt,
        };
      }),
    } as const;
  },
});

type PendingDeliverable = {
  id: DeliverableDoc["_id"];
  title: string;
  doneWhen: string;
  notes: string | null;
  status: DeliverableDoc["status"];
  order: number;
  actions: {
    id: ActionDoc["_id"];
    title: string;
    status: ActionDoc["status"];
    order: number;
  }[];
};

export const pendingWorkForPlan = internalQuery({
  args: {
    userId: v.string(),
    planId: v.string(),
  },
  handler: async (ctx, args) => {
    const planId = ctx.db.normalizeId("plans", args.planId);
    if (!planId) {
      const invalidIdError = new Error("invalid_plan_id");
      invalidIdError.name = "InvalidPlanId";
      throw invalidIdError;
    }

    const plan = await ctx.db.get(planId);

    if (!plan || plan.userId !== args.userId) {
      return null;
    }

    const outcomes = await ctx.db
      .query("outcomes")
      .withIndex("by_plan_order", (q) => q.eq("planId", planId))
      .collect();

    outcomes.sort((a, b) => a.order - b.order);

    const firstIncomplete = outcomes.find((outcome) => outcome.status !== "done") ?? null;

    if (!firstIncomplete) {
      const summary = summarizePlan(plan);
      return {
        plan: {
          id: summary._id,
          title: summary.title,
          status: summary.status,
        },
        done: true,
        outcome: null,
        deliverables: [] as PendingDeliverable[],
      } as const;
    }

    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_outcome_order", (q) => q.eq("outcomeId", firstIncomplete._id))
      .collect();

    deliverables.sort((a, b) => a.order - b.order);

    const pendingDeliverables: PendingDeliverable[] = [];

    for (const deliverable of deliverables) {
      if (deliverable.status === "done") {
        continue;
      }

      const actions = await ctx.db
        .query("actions")
        .withIndex("by_deliverable_order", (q) => q.eq("deliverableId", deliverable._id))
        .collect();

      actions.sort((a, b) => a.order - b.order);

      const pendingActions = actions
        .filter((action) => action.status !== "done")
        .map((action) => ({
          id: action._id,
          title: action.title,
          status: action.status,
          order: action.order,
        }));

      pendingDeliverables.push({
        id: deliverable._id,
        title: deliverable.title,
        doneWhen: deliverable.doneWhen,
        notes: deliverable.notes ?? null,
        status: deliverable.status,
        order: deliverable.order,
        actions: pendingActions,
      });
    }

    const summary = summarizePlan(plan);

    return {
      plan: {
        id: summary._id,
        title: summary.title,
        status: summary.status,
      },
      done: false,
      outcome: {
        id: firstIncomplete._id,
        title: firstIncomplete.title,
        summary: firstIncomplete.summary,
        status: firstIncomplete.status,
        order: firstIncomplete.order,
      },
      deliverables: pendingDeliverables,
    } as const;
  },
});
