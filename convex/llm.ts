import { v } from "convex/values";
import { action } from "./_generated/server";
import { generateStructuredObject } from "./lib/llm";
import { type PlanDraft, planDraftSchema } from "./lib/plan_schemas";
import { buildPlanDraftPrompt } from "./lib/prompts";

const PLAN_SYSTEM_PROMPT =
  "You are a senior product planner who breaks big missions into outcomes, slices, and tightly scoped tasks.";

export const draftPlan = action({
  args: {
    idea: v.string(),
  },
  handler: async (ctx, args): Promise<PlanDraft> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const prompt = buildPlanDraftPrompt({
      idea: args.idea,
    });

    return generateStructuredObject({
      schema: planDraftSchema,
      system: PLAN_SYSTEM_PROMPT,
      prompt,
    });
  },
});
