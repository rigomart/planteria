import { v } from "convex/values";

import { internalMutation } from "./_generated/server";
import { requirePlanOwnership } from "./lib/ownership";

const MAX_ERROR_LENGTH = 240;

function truncate(message: string) {
  if (message.length <= MAX_ERROR_LENGTH) {
    return message;
  }

  return `${message.slice(0, MAX_ERROR_LENGTH - 3)}...`;
}

export const logEvent = internalMutation({
  args: {
    planId: v.id("plans"),
    userId: v.string(),
    threadId: v.string(),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePlanOwnership(ctx, args.planId, args.userId);

    const now = Date.now();
    const eventId = await ctx.db.insert("plan_ai_events", {
      planId: args.planId,
      userId: args.userId,
      threadId: args.threadId,
      prompt: args.prompt,
      summary: null,
      status: "pending",
      error: null,
      appliedAt: null,
      createdAt: now,
      updatedAt: now,
    });

    return { eventId };
  },
});

export const markEventApplied = internalMutation({
  args: {
    eventId: v.id("plan_ai_events"),
    summary: v.string(),
    appliedAt: v.number(),
    latencyMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    const patch: Record<string, unknown> = {
      status: "applied",
      summary: args.summary,
      appliedAt: args.appliedAt,
      error: null,
      updatedAt: Date.now(),
    };

    if (args.latencyMs !== undefined) {
      patch.latencyMs = args.latencyMs;
    }

    await ctx.db.patch(args.eventId, patch);
  },
});

export const markEventFailed = internalMutation({
  args: {
    eventId: v.id("plan_ai_events"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    await ctx.db.patch(args.eventId, {
      status: "error",
      error: truncate(args.error),
      updatedAt: Date.now(),
    });
  },
});
