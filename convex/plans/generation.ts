import { createThread } from "@convex-dev/agent";
import { v } from "convex/values";
import { components, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import { action, internalAction, internalMutation } from "../_generated/server";
import { planningAgent } from "../agents/planning";
import { planDraftSchema, STATUS_VALUES } from "../lib/plan_schemas";
import { buildPlanDraftPrompt } from "../lib/prompts";

const GENERATING_SUMMARY = "Hang tight while we generate your plan.";
const MAX_GENERATION_ERROR_LENGTH = 240;

/**
 * Convert unknown errors into a user-readable string so we can surface failures safely.
 */
function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}

/**
 * Clamp error text to a reasonable length before persisting it on the plan document.
 */
function truncateError(message: string) {
  if (message.length <= MAX_GENERATION_ERROR_LENGTH) {
    return message;
  }

  return `${message.slice(0, MAX_GENERATION_ERROR_LENGTH - 3)}...`;
}

/**
 * Public entrypoint that creates a placeholder plan and schedules asynchronous generation.
 */
export const generatePlan = action({
  args: {
    idea: v.string(),
  },
  handler: async (ctx, args): Promise<{ planId: Id<"plans"> }> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { planId } = await ctx.runMutation(
      internal.plans.generation.createPlanShell,
      {
        idea: args.idea,
        userId: identity.subject,
      },
    );

    await ctx.scheduler.runAfter(
      0,
      internal.plans.generation.generatePlanInBackground,
      {
        idea: args.idea,
        planId,
        userId: identity.subject,
      },
    );

    return { planId };
  },
});

/**
 * Internal helper that provisions the initial plan row with placeholder metadata.
 */
export const createPlanShell = internalMutation({
  args: {
    idea: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();
    const planId = await ctx.db.insert("plans", {
      userId: args.userId,
      idea: args.idea,
      title: "New plan",
      summary: GENERATING_SUMMARY,
      status: "generating",
      generationError: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return { planId };
  },
});

/**
 * Internal action that drives the LLM workflow and persists the resulting draft structure.
 */
export const generatePlanInBackground = internalAction({
  args: {
    idea: v.string(),
    planId: v.id("plans"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const threadId = await createThread(ctx, components.agent, {
        userId: args.userId,
        title: "Plan generation",
        summary: "Generating plan draft",
      });

      await ctx.runMutation(internal.planThreads.savePlanThread, {
        planId: args.planId,
        userId: args.userId,
        threadId,
      });

      const aiResponse = await planningAgent.generateObject(
        ctx,
        { threadId },
        {
          schema: planDraftSchema,
          prompt: buildPlanDraftPrompt({
            idea: args.idea,
          }),
        },
      );

      const parsedPlan = planDraftSchema.parse(aiResponse.object);

      await ctx.runMutation(internal.plans.generation.initializePlan, {
        plan: parsedPlan,
        planId: args.planId,
      });
    } catch (error) {
      await ctx.runMutation(
        internal.plans.generation.markPlanGenerationFailed,
        {
          error: errorMessage(error),
          planId: args.planId,
        },
      );

      throw error;
    }
  },
});

/**
 * Internal mutation invoked after generation to populate the plan and its child records.
 */
export const initializePlan = internalMutation({
  args: {
    plan: v.any(),
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const timestamp = Date.now();

    await ctx.db.patch(args.planId, {
      idea: args.plan.idea,
      title: args.plan.title,
      summary: args.plan.summary,
      status: "ready",
      generationError: null,
      updatedAt: timestamp,
    });

    for (const [outcomeIndex, outcome] of args.plan.outcomes.entries()) {
      const outcomeId = await ctx.db.insert("outcomes", {
        planId: args.planId,
        title: outcome.title,
        summary: outcome.summary,
        status: ensureStatus(outcome.status),
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
          notes: deliverable.notes ?? null,
          status: ensureStatus(deliverable.status),
          order: deliverableIndex,
          createdAt: timestamp,
          updatedAt: timestamp,
        });

        for (const [actionIndex, actionItem] of deliverable.actions.entries()) {
          await ctx.db.insert("actions", {
            deliverableId,
            title: actionItem.title,
            status: ensureStatus(actionItem.status),
            order: actionIndex,
            createdAt: timestamp,
            updatedAt: timestamp,
          });
        }
      }
    }
  },
});

/**
 * Internal mutation that records generation failures on the plan for UI surfacing.
 */
export const markPlanGenerationFailed = internalMutation({
  args: {
    error: v.string(),
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.planId, {
      status: "error",
      generationError: truncateError(args.error),
      updatedAt: Date.now(),
    });
  },
});

type StatusValue = (typeof STATUS_VALUES)[number];

/**
 * Fall back to a known status value if the incoming string is missing or invalid.
 */
function ensureStatus(value: string | undefined): StatusValue {
  if (!value) {
    return STATUS_VALUES[0];
  }

  if ((STATUS_VALUES as readonly string[]).includes(value)) {
    return value as StatusValue;
  }

  return STATUS_VALUES[0];
}
