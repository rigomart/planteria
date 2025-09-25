import { v } from "convex/values";
import { action } from "./_generated/server";
import { generateStructuredObject } from "./lib/llm";
import {
  type IdeaClarification,
  ideaClarificationSchema,
  type PlanDraft,
  planDraftSchema,
} from "./lib/plan_schemas";
import { buildClarifyIdeaPrompt, buildPlanDraftPrompt } from "./lib/prompts";

const CLARIFY_SYSTEM_PROMPT =
  "You are a pragmatic product coach who specializes in keeping ideas concise, scoped, and actionable.";

const PLAN_SYSTEM_PROMPT =
  "You are a senior product planner who breaks big missions into outcomes, slices, and tightly scoped tasks.";

export const clarifyIdea = action({
  args: {
    idea: v.string(),
  },
  handler: async (ctx, args): Promise<IdeaClarification> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const prompt = buildClarifyIdeaPrompt({ idea: args.idea });

    return generateStructuredObject({
      schema: ideaClarificationSchema,
      system: CLARIFY_SYSTEM_PROMPT,
      prompt,
      temperature: 0.2,
    });
  },
});

export const draftPlan = action({
  args: {
    idea: v.string(),
    clarification: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<PlanDraft> => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const prompt = buildPlanDraftPrompt({
      idea: args.idea,
      clarification: args.clarification,
    });

    return generateStructuredObject({
      schema: planDraftSchema,
      system: PLAN_SYSTEM_PROMPT,
      prompt,
      temperature: 0.35,
    });
  },
});
