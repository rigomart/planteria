import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { requireOutcomeOwnership, requirePlanOwnership } from "./lib/ownership";
import { status } from "./schema";

/**
 * Add a new outcome to a plan
 */
export const addOutcome = mutation({
  args: {
    planId: v.id("plans"),
    title: v.string(),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Verify the plan belongs to the user
    await requirePlanOwnership(ctx, args.planId, identity.subject);

    // Get the current max order for outcomes in this plan
    const existingOutcomes = await ctx.db
      .query("outcomes")
      .withIndex("by_plan", (q) => q.eq("planId", args.planId))
      .collect();

    const maxOrder =
      existingOutcomes.length > 0 ? Math.max(...existingOutcomes.map((o) => o.order)) : -1;

    const timestamp = Date.now();
    const outcomeId = await ctx.db.insert("outcomes", {
      planId: args.planId,
      title: args.title,
      summary: args.summary,
      status: "todo",
      order: maxOrder + 1,
      createdAt: timestamp,
      updatedAt: timestamp,
    });

    // Update plan's updatedAt
    await ctx.db.patch(args.planId, { updatedAt: timestamp });

    return { outcomeId };
  },
});

/**
 * Update an outcome's title or summary
 */
export const updateOutcome = mutation({
  args: {
    outcomeId: v.id("outcomes"),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    status: v.optional(status),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get the outcome and verify ownership through plan
    const { outcome } = await requireOutcomeOwnership(ctx, args.outcomeId, identity.subject);

    const updates: Partial<typeof outcome> = {
      updatedAt: Date.now(),
    };

    if (args.title !== undefined) {
      updates.title = args.title;
    }
    if (args.summary !== undefined) {
      updates.summary = args.summary;
    }
    if (args.status !== undefined) {
      updates.status = args.status;
    }

    await ctx.db.patch(args.outcomeId, updates);

    // If marking the outcome as done, cascade to all deliverables and actions
    if (args.status === "done") {
      const deliverables = await ctx.db
        .query("deliverables")
        .withIndex("by_outcome", (q) => q.eq("outcomeId", args.outcomeId))
        .collect();

      const timestamp = Date.now();
      for (const deliverable of deliverables) {
        if (deliverable.status !== "done") {
          await ctx.db.patch(deliverable._id, {
            status: "done",
            updatedAt: timestamp,
          });
        }

        const actions = await ctx.db
          .query("actions")
          .withIndex("by_deliverable", (q) => q.eq("deliverableId", deliverable._id))
          .collect();

        for (const action of actions) {
          if (action.status !== "done") {
            await ctx.db.patch(action._id, {
              status: "done",
              updatedAt: timestamp,
            });
          }
        }
      }
    }

    // Update plan's updatedAt
    await ctx.db.patch(outcome.planId, { updatedAt: Date.now() });

    return { success: true };
  },
});

/**
 * Delete an outcome and rebalance orders
 */
export const deleteOutcome = mutation({
  args: {
    outcomeId: v.id("outcomes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Unauthorized");
    }

    // Get the outcome and verify ownership
    const { outcome } = await requireOutcomeOwnership(ctx, args.outcomeId, identity.subject);

    // Delete all deliverables and actions under this outcome first
    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_outcome", (q) => q.eq("outcomeId", args.outcomeId))
      .collect();

    for (const deliverable of deliverables) {
      const actions = await ctx.db
        .query("actions")
        .withIndex("by_deliverable", (q) => q.eq("deliverableId", deliverable._id))
        .collect();

      // Delete actions
      for (const action of actions) {
        await ctx.db.delete(action._id);
      }

      // Delete deliverable
      await ctx.db.delete(deliverable._id);
    }

    // Delete the outcome
    await ctx.db.delete(args.outcomeId);

    // Rebalance orders for remaining outcomes
    const remainingOutcomes = await ctx.db
      .query("outcomes")
      .withIndex("by_plan_order", (q) => q.eq("planId", outcome.planId))
      .collect();

    remainingOutcomes.sort((a, b) => a.order - b.order);

    for (let i = 0; i < remainingOutcomes.length; i++) {
      if (remainingOutcomes[i].order !== i) {
        await ctx.db.patch(remainingOutcomes[i]._id, { order: i });
      }
    }

    // Update plan's updatedAt
    await ctx.db.patch(outcome.planId, { updatedAt: Date.now() });

    return { success: true };
  },
});
