import { v } from "convex/values";

import type { Doc } from "./_generated/dataModel";
import { internalQuery } from "./_generated/server";

type PlanDoc = Doc<"plans">;
type DeliverableDoc = Doc<"deliverables">;
type ActionDoc = Doc<"actions">;

type PlanSummary = {
  _id: PlanDoc["_id"];
  title: string;
  summary: string;
};

function summarizePlan(plan: PlanDoc): PlanSummary {
  const title = (plan.title ?? plan.idea).trim();
  const summary = (plan.summary?.trim() ?? plan.idea).trim();
  return {
    _id: plan._id,
    title: title || plan.idea,
    summary: summary || plan.idea,
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
          summary: summary.summary,
        };
      }),
    } as const;
  },
});

type PendingDeliverable = {
  title: string;
  doneWhen: string;
  notes: string | null;
  actions: {
    title: string;
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

    const summaryLines: string[] = [];
    const planSummary = summarizePlan(plan);
    summaryLines.push(`Plan: ${planSummary.title} (${planSummary._id})`);

    if (!firstIncomplete) {
      summaryLines.push("All outcomes are complete.");
      return {
        plan: {
          id: planSummary._id,
          title: planSummary.title,
        },
        done: true,
        outcome: null,
        deliverables: [] as PendingDeliverable[],
        summary: {
          lines: summaryLines,
        },
      } as const;
    }

    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_outcome_order", (q) => q.eq("outcomeId", firstIncomplete._id))
      .collect();

    deliverables.sort((a, b) => a.order - b.order);

    const pendingDeliverables: PendingDeliverable[] = [];

    summaryLines.push("Pending work remains.");
    summaryLines.push(`Outcome → ${firstIncomplete.title}`);

    const firstPendingDeliverable =
      deliverables.find((deliverable) => deliverable.status !== "done") ?? null;

    if (!firstPendingDeliverable) {
      summaryLines.push("No outstanding deliverables in this outcome.");
      return {
        plan: {
          id: planSummary._id,
          title: planSummary.title,
        },
        done: false,
        outcome: {
          title: firstIncomplete.title,
          summary: firstIncomplete.summary,
        },
        deliverables: [] as PendingDeliverable[],
        summary: {
          lines: summaryLines,
        },
      } as const;
    }

    const actions = await ctx.db
      .query("actions")
      .withIndex("by_deliverable_order", (q) => q.eq("deliverableId", firstPendingDeliverable._id))
      .collect();

    actions.sort((a, b) => a.order - b.order);

    const pendingActions = actions
      .filter((action) => action.status !== "done")
      .map((action) => ({
        title: action.title,
      }));

    summaryLines.push("Deliverables:");
    summaryLines.push(`- ${firstPendingDeliverable.title}`);
    for (const action of pendingActions) {
      summaryLines.push(`  • ${action.title}`);
    }

    pendingDeliverables.push({
      title: firstPendingDeliverable.title,
      doneWhen: firstPendingDeliverable.doneWhen,
      notes: firstPendingDeliverable.notes ?? null,
      actions: pendingActions,
    });

    return {
      plan: {
        id: planSummary._id,
        title: planSummary.title,
      },
      done: false,
      outcome: {
        title: firstIncomplete.title,
        summary: firstIncomplete.summary,
      },
      deliverables: pendingDeliverables,
      summary: {
        lines: summaryLines,
      },
    } as const;
  },
});

type FullPlanDeliverable = {
  title: string;
  doneWhen: string;
  notes: string | null;
  actions: {
    title: string;
  }[];
};

type FullPlanOutcome = {
  title: string;
  summary: string;
  deliverables: FullPlanDeliverable[];
};

export const planDetailsForUser = internalQuery({
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

    const planSummary = summarizePlan(plan);

    const outcomes = await ctx.db
      .query("outcomes")
      .withIndex("by_plan_order", (q) => q.eq("planId", planId))
      .collect();

    outcomes.sort((a, b) => a.order - b.order);

    const detailedOutcomes: FullPlanOutcome[] = [];

    for (const outcome of outcomes) {
      const deliverables = await ctx.db
        .query("deliverables")
        .withIndex("by_outcome_order", (q) => q.eq("outcomeId", outcome._id))
        .collect();

      deliverables.sort((a, b) => a.order - b.order);

      const detailedDeliverables: FullPlanDeliverable[] = [];

      for (const deliverable of deliverables) {
        const actions = await ctx.db
          .query("actions")
          .withIndex("by_deliverable_order", (q) => q.eq("deliverableId", deliverable._id))
          .collect();

        actions.sort((a, b) => a.order - b.order);

        detailedDeliverables.push({
          title: deliverable.title,
          doneWhen: deliverable.doneWhen,
          notes: deliverable.notes ?? null,
          actions: actions.map((action) => ({
            title: action.title,
          })),
        });
      }

      detailedOutcomes.push({
        title: outcome.title,
        summary: outcome.summary,
        deliverables: detailedDeliverables,
      });
    }

    return {
      plan: {
        id: planSummary._id,
        title: planSummary.title,
        summary: planSummary.summary,
      },
      outcomes: detailedOutcomes,
    } as const;
  },
});
