import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const status = v.union(v.literal("todo"), v.literal("doing"), v.literal("done"));

const planLifecycleStatus = v.union(
  v.literal("scraping"),
  v.literal("generating"),
  v.literal("ready"),
  v.literal("error"),
);

const planAiEventStatus = v.union(v.literal("pending"), v.literal("applied"), v.literal("error"));

export default defineSchema({
  plans: defineTable({
    userId: v.string(),
    idea: v.string(),
    title: v.string(),
    summary: v.string(),
    mission: v.optional(v.string()),
    status: planLifecycleStatus,
    aiAdjustmentsUsed: v.optional(v.number()),
    researchInsights: v.optional(
      v.array(
        v.object({
          title: v.string(),
          url: v.string(),
          snippet: v.string(),
        }),
      ),
    ),
    generationError: v.optional(v.union(v.string(), v.null())),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  outcomes: defineTable({
    planId: v.id("plans"),
    title: v.string(),
    summary: v.string(),
    status,
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_plan", ["planId"])
    .index("by_plan_order", ["planId", "order"]),

  deliverables: defineTable({
    outcomeId: v.id("outcomes"),
    title: v.string(),
    doneWhen: v.string(),
    notes: v.optional(v.union(v.string(), v.null())),
    status,
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_outcome", ["outcomeId"])
    .index("by_outcome_order", ["outcomeId", "order"]),

  actions: defineTable({
    deliverableId: v.id("deliverables"),
    title: v.string(),
    status,
    order: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_deliverable", ["deliverableId"])
    .index("by_deliverable_order", ["deliverableId", "order"]),

  plan_threads: defineTable({
    planId: v.id("plans"),
    threadId: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_plan", ["planId"]),

  plan_ai_events: defineTable({
    planId: v.id("plans"),
    userId: v.string(),
    threadId: v.string(),
    prompt: v.string(),
    summary: v.optional(v.union(v.string(), v.null())),
    status: planAiEventStatus,
    error: v.optional(v.union(v.string(), v.null())),
    appliedAt: v.optional(v.union(v.number(), v.null())),
    latencyMs: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_plan_createdAt", ["planId", "createdAt"]),

  user_api_keys: defineTable({
    userId: v.string(),
    provider: v.string(),
    ciphertext: v.optional(v.string()),
    hash: v.optional(v.string()),
    salt: v.optional(v.string()),
    lastFour: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user_provider", ["userId", "provider"])
    .index("by_provider", ["provider"]),

  user_ai_usage: defineTable({
    userId: v.string(),
    plansGenerated: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),
});
