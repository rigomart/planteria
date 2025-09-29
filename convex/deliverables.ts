import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireOutcomeOwnership } from "./lib/ownership";
import { status } from "./schema";

/**
 * Add a new deliverable to an outcome
 */
export const addDeliverable = mutation({
  args: {
    outcomeId: v.id("outcomes"),
    title: v.string(),
    doneWhen: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Verify the outcome exists and user owns the plan
    const { outcome } = await requireOutcomeOwnership(
      ctx,
      args.outcomeId,
      identity.subject,
    );

    // Get the current max order for deliverables in this outcome
    const existingDeliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_outcome", (q) => q.eq("outcomeId", args.outcomeId))
      .collect();

    const maxOrder =
      existingDeliverables.length > 0
        ? Math.max(...existingDeliverables.map((d) => d.order))
        : -1;

    const timestamp = Date.now();
    const deliverableId = await ctx.db.insert("deliverables", {
      outcomeId: args.outcomeId,
      title: args.title,
      doneWhen: args.doneWhen,
      notes: null,
      status: "todo",
      order: maxOrder + 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Update plan's updatedAt
    await ctx.db.patch(outcome.planId, { updatedAt: timestamp });

    return { deliverableId };
  },
});

/**
 * Update a deliverable's title or doneWhen
 */
export const updateDeliverable = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    title: v.optional(v.string()),
    doneWhen: v.optional(v.string()),
    notes: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get the deliverable and verify ownership through plan
    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) {
      throw new Error("Deliverable not found");
    }

    const { outcome } = await requireOutcomeOwnership(
      ctx,
      deliverable.outcomeId,
      identity.subject,
    );

    const updates: Partial<typeof deliverable> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title;
    }
    if (args.doneWhen !== undefined) {
      updates.doneWhen = args.doneWhen;
    }
    if (args.notes !== undefined) {
      updates.notes = args.notes;
    }

    await ctx.db.patch(args.deliverableId, updates);

    // Update plan's updatedAt
    await ctx.db.patch(outcome.planId, { updatedAt: Date.now() });

    return { success: true };
  },
});

/**
 * Update the status for a deliverable
 */
export const updateDeliverableStatus = mutation({
  args: {
    deliverableId: v.id("deliverables"),
    status,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) {
      throw new Error("Deliverable not found");
    }

    const { outcome } = await requireOutcomeOwnership(
      ctx,
      deliverable.outcomeId,
      identity.subject,
    );

    const timestamp = Date.now();

    await ctx.db.patch(args.deliverableId, {
      status: args.status,
      updatedAt: timestamp,
    });

    await ctx.db.patch(outcome.planId, { updatedAt: timestamp });

    return { success: true };
  },
});

/**
 * Delete a deliverable and rebalance orders
 */
export const deleteDeliverable = mutation({
  args: {
    deliverableId: v.id("deliverables"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get the deliverable and verify ownership
    const deliverable = await ctx.db.get(args.deliverableId);
    if (!deliverable) {
      throw new Error("Deliverable not found");
    }

    const { outcome } = await requireOutcomeOwnership(
      ctx,
      deliverable.outcomeId,
      identity.subject,
    );

    // Delete all actions under this deliverable
    const actions = await ctx.db
      .query("actions")
      .withIndex("by_deliverable", (q) =>
        q.eq("deliverableId", args.deliverableId),
      )
      .collect();

    for (const action of actions) {
      await ctx.db.delete(action._id);
    }

    // Delete the deliverable
    await ctx.db.delete(args.deliverableId);

    // Rebalance orders for remaining deliverables in this outcome
    const remainingDeliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_outcome_order", (q) => q.eq("outcomeId", outcome._id))
      .collect();

    remainingDeliverables.sort((a, b) => a.order - b.order);

    for (let i = 0; i < remainingDeliverables.length; i++) {
      if (remainingDeliverables[i].order !== i) {
        await ctx.db.patch(remainingDeliverables[i]._id, { order: i });
      }
    }

    // Update plan's updatedAt
    await ctx.db.patch(outcome.planId, { updatedAt: Date.now() });

    return { success: true };
  },
});
