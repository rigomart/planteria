import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import {
  requireActionOwnership,
  requireDeliverableOwnership,
} from "./lib/ownership";

/**
 * Add a new action to a deliverable
 */
export const addAction = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Verify the deliverable exists and user owns the plan
    const { deliverable, outcome } = await requireDeliverableOwnership(
      ctx,
      args.deliverableId,
      identity.subject,
    );

    // Get the current max order for actions in this deliverable
    const existingActions = await ctx.db
      .query("actions")
      .withIndex("by_deliverable", (q) =>
        q.eq("deliverableId", deliverable._id),
      )
      .collect();

    const maxOrder =
      existingActions.length > 0
        ? Math.max(...existingActions.map((a) => a.order))
        : -1;

    const timestamp = Date.now();
    const actionId = await ctx.db.insert("actions", {
      deliverableId: deliverable._id,
      title: args.title,
      status: "todo",
      order: maxOrder + 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Update plan's updatedAt
    await ctx.db.patch(outcome.planId, { updatedAt: timestamp });

    return { actionId };
  },
});

/**
 * Update an action's title
 */
export const updateAction = mutation({
  args: {
    actionId: v.id("actions"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get the action and verify ownership through plan
    const { action, outcome } = await requireActionOwnership(
      ctx,
      args.actionId,
      identity.subject,
    );

    await ctx.db.patch(action._id, {
      title: args.title,
      updatedAt: Date.now(),
    });

    // Update plan's updatedAt
    await ctx.db.patch(outcome.planId, { updatedAt: Date.now() });

    return { success: true };
  },
});

/**
 * Delete an action and rebalance orders
 */
export const deleteAction = mutation({
  args: {
    actionId: v.id("actions"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const { action, deliverable, outcome } = await requireActionOwnership(
      ctx,
      args.actionId,
      identity.subject,
    );

    // Delete the action
    await ctx.db.delete(action._id);

    // Rebalance orders for remaining actions in this deliverable
    const remainingActions = await ctx.db
      .query("actions")
      .withIndex("by_deliverable_order", (q) =>
        q.eq("deliverableId", deliverable._id),
      )
      .collect();

    remainingActions.sort((a, b) => a.order - b.order);

    for (let i = 0; i < remainingActions.length; i++) {
      if (remainingActions[i].order !== i) {
        await ctx.db.patch(remainingActions[i]._id, { order: i });
      }
    }

    // Update plan's updatedAt
    await ctx.db.patch(outcome.planId, { updatedAt: Date.now() });

    return { success: true };
  },
});

/**
 * Query returning ordered actions for a specific deliverable.
 */
export const listByDeliverable = query({
  args: {
    deliverableId: v.id("deliverables"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get the deliverable to verify ownership
    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) {
      return [];
    }

    // Verify plan ownership through the deliverable
    await requireDeliverableOwnership(
      ctx,
      args.deliverableId,
      identity.subject,
    );

    const actions = await ctx.db
      .query("actions")
      .withIndex("by_deliverable_order", (q) =>
        q.eq("deliverableId", args.deliverableId),
      )
      .collect();

    return actions.map((action) => ({
      id: action._id,
      title: action.title,
      status: action.status,
      order: action.order,
      createdAt: action.createdAt,
      updatedAt: action.updatedAt,
    }));
  },
});
