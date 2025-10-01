import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type PlanHierarchy = {
  plan: Doc<"plans">;
};

type OutcomeHierarchy = PlanHierarchy & {
  outcome: Doc<"outcomes">;
};

type DeliverableHierarchy = OutcomeHierarchy & {
  deliverable: Doc<"deliverables">;
};

type ActionHierarchy = DeliverableHierarchy & {
  action: Doc<"actions">;
};

/**
 * Verify that the user owns the plan and return the plan document
 */
export const requirePlanOwnership = async (
  ctx: QueryCtx | MutationCtx,
  planId: Id<"plans">,
  userId: string,
): Promise<PlanHierarchy> => {
  const plan = await ctx.db.get(planId);
  if (!plan || plan.userId !== userId) {
    throw new Error("Access denied");
  }

  return { plan };
};

/**
 * Verify that the user owns the outcome through the plan hierarchy
 */
export const requireOutcomeOwnership = async (
  ctx: QueryCtx | MutationCtx,
  outcomeId: Id<"outcomes">,
  userId: string,
): Promise<OutcomeHierarchy> => {
  const outcome = await ctx.db.get(outcomeId);
  if (!outcome) {
    throw new Error("Outcome not found");
  }

  const hierarchy = await requirePlanOwnership(ctx, outcome.planId, userId);

  return { ...hierarchy, outcome };
};

/**
 * Verify that the user owns the deliverable through the plan hierarchy
 */
export const requireDeliverableOwnership = async (
  ctx: QueryCtx | MutationCtx,
  deliverableId: Id<"deliverables">,
  userId: string,
): Promise<DeliverableHierarchy> => {
  const deliverable = await ctx.db.get(deliverableId);
  if (!deliverable) {
    throw new Error("Deliverable not found");
  }

  const hierarchy = await requireOutcomeOwnership(ctx, deliverable.outcomeId, userId);

  return { ...hierarchy, deliverable };
};

/**
 * Verify that the user owns the action through the plan hierarchy
 */
export const requireActionOwnership = async (
  ctx: QueryCtx | MutationCtx,
  actionId: Id<"actions">,
  userId: string,
): Promise<ActionHierarchy> => {
  const action = await ctx.db.get(actionId);
  if (!action) {
    throw new Error("Action not found");
  }

  const hierarchy = await requireDeliverableOwnership(ctx, action.deliverableId, userId);

  return { ...hierarchy, action };
};
