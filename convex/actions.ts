import { v } from "convex/values";
import { mutation } from "./_generated/server";

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
    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) {
      throw new Error("Deliverable not found");
    }

    const outcome = await ctx.db.get(deliverable.outcomeId);
    if (!outcome) {
      throw new Error("Outcome not found");
    }

    const plan = await ctx.db.get(outcome.planId);
    if (!plan || plan.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    // Get the current max order for actions in this deliverable
    const existingActions = await ctx.db
      .query("actions")
      .withIndex("by_deliverable", (q) =>
        q.eq("deliverableId", args.deliverableId),
      )
      .collect();

    const maxOrder =
      existingActions.length > 0
        ? Math.max(...existingActions.map((a) => a.order))
        : -1;

    const timestamp = Date.now();
    const actionId = await ctx.db.insert("actions", {
      deliverableId: args.deliverableId,
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
    const action = await ctx.db.get(args.actionId);
    if (!action) {
      throw new Error("Action not found");
    }

    const deliverable = await ctx.db.get(action.deliverableId);
    if (!deliverable) {
      throw new Error("Deliverable not found");
    }

    const outcome = await ctx.db.get(deliverable.outcomeId);
    if (!outcome) {
      throw new Error("Outcome not found");
    }

    const plan = await ctx.db.get(outcome.planId);
    if (!plan || plan.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    await ctx.db.patch(args.actionId, {
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

    // Get the action and verify ownership
    const action = await ctx.db.get(args.actionId);
    if (!action) {
      throw new Error("Action not found");
    }

    const deliverable = await ctx.db.get(action.deliverableId);
    if (!deliverable) {
      throw new Error("Deliverable not found");
    }

    const outcome = await ctx.db.get(deliverable.outcomeId);
    if (!outcome) {
      throw new Error("Outcome not found");
    }

    const plan = await ctx.db.get(outcome.planId);
    if (!plan || plan.userId !== identity.subject) {
      throw new Error("Access denied");
    }

    // Delete the action
    await ctx.db.delete(args.actionId);

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
