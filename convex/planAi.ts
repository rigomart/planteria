import type { FunctionReturnType } from "convex/server";
import { v } from "convex/values";

import { api } from "./_generated/api";
import { action, mutation } from "./_generated/server";
import { planningAgent } from "./agents/planning";
import { requirePlanOwnership } from "./lib/ownership";
import { type PlanDraft, planDraftSchema } from "./lib/plan_schemas";
import { getOrCreatePlanThread } from "./lib/planThreads";
import { buildPlanAdjustmentPrompt } from "./lib/prompts";

type PlanPreview = NonNullable<
  Awaited<FunctionReturnType<typeof api.plans.queries.getPlanPreview>>
>;

function toAdjustmentInput(plan: PlanPreview): PlanDraft {
  const { plan: planMeta, outcomes } = plan;

  return {
    idea: planMeta.idea,
    title: planMeta.title,
    summary: planMeta.summary,
    outcomes: outcomes.map((outcome) => ({
      order: outcome.order,
      title: outcome.title,
      summary: outcome.summary,
      status: outcome.status,
      deliverables: outcome.deliverables.map((deliverable) => ({
        order: deliverable.order,
        title: deliverable.title,
        doneWhen: deliverable.doneWhen,
        notes: deliverable.notes,
        status: deliverable.status,
        actions: deliverable.actions.map((action) => ({
          order: action.order,
          title: action.title,
          status: action.status,
        })),
      })),
    })),
  };
}

export const adjustPlan = action({
  args: {
    planId: v.id("plans"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const plan = await ctx.runQuery(api.plans.queries.getPlanPreview, {
      planId: args.planId,
    });

    if (!plan) {
      throw new Error("Plan not found");
    }

    const threadId = await getOrCreatePlanThread(ctx, {
      planId: args.planId,
      userId: identity.subject,
    });

    const currentPlan = toAdjustmentInput(plan as PlanPreview);

    const prompt = buildPlanAdjustmentPrompt({
      ...currentPlan,
      instruction: args.prompt,
    });

    const aiResponse = await planningAgent.generateObject(
      ctx,
      { threadId },
      {
        schema: planDraftSchema,
        prompt,
      },
    );

    const proposal = planDraftSchema.parse(aiResponse.object);

    await ctx.runMutation(api.planAi.applyPlanAdjustment, {
      planId: args.planId,
      proposal,
    });

    return {
      plan: proposal,
    } satisfies {
      plan: PlanDraft;
    };
  },
});

export const applyPlanAdjustment = mutation({
  args: {
    planId: v.id("plans"),
    proposal: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const proposal = planDraftSchema.parse(args.proposal);

    const { plan } = await requirePlanOwnership(
      ctx,
      args.planId,
      identity.subject,
    );

    if (plan.idea !== proposal.idea) {
      throw new Error("Plan idea mismatch");
    }

    const timestamp = Date.now();

    await ctx.db.patch(args.planId, {
      title: proposal.title,
      summary: proposal.summary,
      status: "ready",
      updatedAt: timestamp,
    });

    const existingOutcomes = await ctx.db
      .query("outcomes")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .collect();

    for (const outcome of existingOutcomes) {
      const deliverables = await ctx.db
        .query("deliverables")
        .withIndex("by_outcome", (q) => q.eq("outcomeId", outcome._id))
        .collect();

      for (const deliverable of deliverables) {
        const actions = await ctx.db
          .query("actions")
          .withIndex("by_deliverable", (q) =>
            q.eq("deliverableId", deliverable._id),
          )
          .collect();

        for (const actionDoc of actions) {
          await ctx.db.delete(actionDoc._id);
        }

        await ctx.db.delete(deliverable._id);
      }

      await ctx.db.delete(outcome._id);
    }

    for (const [outcomeIndex, outcome] of proposal.outcomes.entries()) {
      const outcomeId = await ctx.db.insert("outcomes", {
        planId: args.planId,
        title: outcome.title,
        summary: outcome.summary,
        status: outcome.status,
        order: outcomeIndex,
        createdAt: timestamp,
        updatedAt: timestamp,
      });

      for (const [
        deliverableIndex,
        deliverable,
      ] of outcome.deliverables.entries()) {
        const deliverableId = await ctx.db.insert("deliverables", {
          outcomeId,
          title: deliverable.title,
          doneWhen: deliverable.doneWhen,
          notes: deliverable.notes,
          status: deliverable.status,
          order: deliverableIndex,
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        for (const [actionIndex, actionItem] of deliverable.actions.entries()) {
          await ctx.db.insert("actions", {
            deliverableId,
            title: actionItem.title,
            status: actionItem.status,
            order: actionIndex,
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        }
      }
    }

    return { success: true };
  },
});
