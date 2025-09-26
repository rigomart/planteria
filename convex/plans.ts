import { createThread } from "@convex-dev/agent";
import { v } from "convex/values";
import { components, internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import {
  action,
  internalAction,
  internalMutation,
  query,
} from "./_generated/server";
import { planningAgent } from "./agents/planning";
import type { PlanDraft } from "./lib/plan_schemas";
import { planDraftSchema, STATUS_VALUES } from "./lib/plan_schemas";
import { buildPlanDraftPrompt } from "./lib/prompts";

type StatusValue = (typeof STATUS_VALUES)[number];

const GENERATING_SUMMARY = "Hang tight while we generate your plan.";
const PLACEHOLDER_TITLE_FALLBACK = "New plan";
const MAX_PLAN_TITLE_LENGTH = 80;
const MAX_GENERATION_ERROR_LENGTH = 240;

function derivePlaceholderTitle(idea: string) {
  const trimmed = idea.trim();

  if (trimmed.length >= 3 && trimmed.length <= MAX_PLAN_TITLE_LENGTH) {
    return trimmed;
  }

  if (trimmed.length > MAX_PLAN_TITLE_LENGTH) {
    return `${trimmed.slice(0, MAX_PLAN_TITLE_LENGTH - 3).trimEnd()}...`;
  }

  return PLACEHOLDER_TITLE_FALLBACK;
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}

function truncateError(message: string) {
  if (message.length <= MAX_GENERATION_ERROR_LENGTH) {
    return message;
  }

  return `${message.slice(0, MAX_GENERATION_ERROR_LENGTH - 3)}...`;
}

export const generatePlan = action({
  args: {
    idea: v.string(),
  },
  handler: async (ctx, args): Promise<{ planId: Id<"plans"> }> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { planId } = await ctx.runMutation(internal.plans.createPlanShell, {
      idea: args.idea,
      userId: identity.subject,
    });

    await ctx.scheduler.runAfter(0, internal.plans.generatePlanInBackground, {
      idea: args.idea,
      planId,
      userId: identity.subject,
    });

    return { planId };
  },
});

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
      title: derivePlaceholderTitle(args.idea),
      summary: GENERATING_SUMMARY,
      status: "generating",
      generationError: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    return { planId };
  },
});

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

      await ctx.runMutation(internal.plans.applyPlanDraft, {
        plan: parsedPlan,
        planId: args.planId,
      });
    } catch (error) {
      await ctx.runMutation(internal.plans.markPlanGenerationFailed, {
        error: errorMessage(error),
        planId: args.planId,
      });

      throw error;
    }
  },
});

export const applyPlanDraft = internalMutation({
  args: {
    plan: v.any(),
    planId: v.id("plans"),
  },
  handler: async (ctx, args) => {
    const parsed = planDraftSchema.parse(args.plan);
    await replacePlanInternal(ctx, args.planId, parsed);
    return { planId: args.planId };
  },
});

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

async function clearExistingStructure(ctx: MutationCtx, planId: Id<"plans">) {
  const outcomes = await ctx.db
    .query("outcomes")
    .withIndex("by_plan", (q) => q.eq("planId", planId))
    .collect();

  for (const outcome of outcomes) {
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
}

async function insertStructure(
  ctx: MutationCtx,
  planId: Id<"plans">,
  plan: PlanDraft,
  timestamp: number,
) {
  for (const [outcomeIndex, outcome] of plan.outcomes.entries()) {
    const outcomeId = await ctx.db.insert("outcomes", {
      planId,
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
}

function ensureStatus(value: string | undefined): StatusValue {
  if (!value) {
    return STATUS_VALUES[0];
  }

  if ((STATUS_VALUES as readonly string[]).includes(value)) {
    return value as StatusValue;
  }

  return STATUS_VALUES[0];
}

async function replacePlanInternal(
  ctx: MutationCtx,
  planId: Id<"plans">,
  plan: PlanDraft,
) {
  const timestamp = Date.now();

  await ctx.db.patch(planId, {
    idea: plan.idea,
    title: plan.title,
    summary: plan.summary,
    status: "ready",
    generationError: null,
    updatedAt: timestamp,
  });

  await clearExistingStructure(ctx, planId);
  await insertStructure(ctx, planId, plan, timestamp);
}

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
