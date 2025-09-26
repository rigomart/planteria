import { v } from "convex/values";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import { action, internalMutation, mutation, query } from "./_generated/server";
import { generateStructuredObject } from "./lib/llm";
import type { PlanDraft } from "./lib/plan_schemas";
import { planDraftSchema, STATUS_VALUES } from "./lib/plan_schemas";
import { buildPlanDraftPrompt } from "./lib/prompts";

type StatusValue = (typeof STATUS_VALUES)[number];

const PLAN_SYSTEM_PROMPT =
  "You are a senior product planner who turns ideas into outcomes, deliverables, and concrete actions.";

export const generatePlan = action({
  args: {
    idea: v.string(),
  },
  handler: async (ctx, args): Promise<{ planId: Id<"plans"> }> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      throw new Error("Unauthorized");
    }

    const prompt = buildPlanDraftPrompt({
      idea: args.idea,
    });

    const aiResponseObject = await generateStructuredObject({
      schema: planDraftSchema,
      system: PLAN_SYSTEM_PROMPT,
      prompt,
    });

    const data = await ctx.runMutation(internal.plans.createPlan, {
      plan: aiResponseObject,
      userId: identity.subject,
    });

    return { planId: data.planId };
  },
});

export const createPlan = internalMutation({
  args: {
    plan: v.any(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const parsed = planDraftSchema.parse(args.plan);

    const planId = await createPlanInternal(ctx, args.userId, parsed);

    return { planId };
  },
});

export const replacePlan = mutation({
  args: {
    planId: v.id("plans"),
    plan: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const parsed = planDraftSchema.parse(args.plan);
    const planDoc = await ctx.db.get(args.planId);

    if (!planDoc || planDoc.userId !== identity.subject) {
      throw new Error("Plan not found");
    }

    await replacePlanInternal(ctx, args.planId, parsed);

    return { planId: args.planId };
  },
});

export const saveDraft = mutation({
  args: {
    plan: v.any(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const parsed = planDraftSchema.parse(args.plan);
    const existingPlan = await ctx.db
      .query("plans")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!existingPlan) {
      const planId = await createPlanInternal(ctx, identity.subject, parsed);
      return { planId };
    }

    await replacePlanInternal(ctx, existingPlan._id, parsed);
    return { planId: existingPlan._id };
  },
});

export const getCurrentPlan = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    const plan = await ctx.db
      .query("plans")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (!plan) {
      return null;
    }

    return loadPlanWithStructure(ctx, plan._id);
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
        idea: plan.idea,
        mission: plan.mission,
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
      summary: outcome.summary ?? undefined,
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

async function createPlanInternal(
  ctx: MutationCtx,
  userId: string,
  plan: PlanDraft,
) {
  const timestamp = Date.now();
  const planId = await ctx.db.insert("plans", {
    userId,
    idea: plan.idea,
    mission: plan.mission,
    createdAt: timestamp,
    updatedAt: timestamp,
  });

  await insertStructure(ctx, planId, plan, timestamp);
  return planId;
}

async function replacePlanInternal(
  ctx: MutationCtx,
  planId: Id<"plans">,
  plan: PlanDraft,
) {
  const timestamp = Date.now();

  await ctx.db.patch(planId, {
    idea: plan.idea,
    mission: plan.mission,
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
      summary: outcome.summary ?? null,
      status: outcome.status,
      order: outcome.order,
      deliverables: deliverablePayload,
    });
  }

  return {
    id: plan._id,
    idea: plan.idea,
    mission: plan.mission,
    outcomes: outcomePayload,
  };
}
