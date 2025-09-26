import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const status = v.union(
  v.literal("todo"),
  v.literal("doing"),
  v.literal("done"),
);

export default defineSchema({
  plans: defineTable({
    userId: v.string(),
    idea: v.string(),
    mission: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  outcomes: defineTable({
    planId: v.id("plans"),
    title: v.string(),
    summary: v.optional(v.string()),
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
});
