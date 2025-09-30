import { v } from "convex/values";

import { query } from "./_generated/server";
import { requirePlanOwnership } from "./lib/ownership";

export const list = query({
  args: {
    planId: v.id("plans"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    await requirePlanOwnership(ctx, args.planId, identity.subject);

    const events = await ctx.db
      .query("plan_ai_events")
      .withIndex("by_plan_createdAt", (q) => q.eq("planId", args.planId))
      .collect();

    events.sort((a, b) => b.createdAt - a.createdAt);

    const limit = args.limit ?? 20;

    return events.slice(0, limit).map((event) => ({
      id: event._id,
      status: event.status,
      prompt: event.prompt,
      summary: event.summary ?? null,
      error: event.error ?? null,
      appliedAt: event.appliedAt ?? null,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      threadId: event.threadId,
      latencyMs: event.latencyMs ?? null,
    }));
  },
});
