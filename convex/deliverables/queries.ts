import { v } from "convex/values";
import { query } from "../_generated/server";
import { requireOutcomeOwnership } from "../lib/ownership";

/**
 * Query returning deliverables with metadata for a specific outcome.
 */
export const listByOutcome = query({
  args: {
    outcomeId: v.id("outcomes"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    // Get the outcome to verify ownership
    const outcome = await ctx.db.get(args.outcomeId);
    if (!outcome) {
      return [];
    }

    // Verify plan ownership through the outcome
    await requireOutcomeOwnership(ctx, args.outcomeId, identity.subject);

    const deliverables = await ctx.db
      .query("deliverables")
      .withIndex("by_outcome_order", (q) => q.eq("outcomeId", args.outcomeId))
      .collect();

    return deliverables.map((deliverable) => ({
      id: deliverable._id,
      title: deliverable.title,
      doneWhen: deliverable.doneWhen,
      notes: deliverable.notes ?? null,
      status: deliverable.status,
      order: deliverable.order,
      createdAt: deliverable.createdAt,
      updatedAt: deliverable.updatedAt,
    }));
  },
});
