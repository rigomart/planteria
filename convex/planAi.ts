import type { FunctionReturnType } from "convex/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { action } from "./_generated/server";
import { planningAgent } from "./agents/planning";
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

    return {
      proposal,
      threadId,
    } satisfies {
      proposal: PlanDraft;
      threadId: string;
    };
  },
});
