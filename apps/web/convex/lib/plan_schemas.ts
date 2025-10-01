import { z } from "zod/v3";

export const STATUS_VALUES = ["todo", "doing", "done"] as const;

export const statusSchema = z.enum(STATUS_VALUES);

export const PLAN_LIFECYCLE_STATUS_VALUES = ["generating", "ready", "error"] as const;

export type PlanLifecycleStatus = (typeof PLAN_LIFECYCLE_STATUS_VALUES)[number];

export const planActionSchema = z.object({
  title: z.string().min(3).max(80).describe("Concise action label (3-80 chars)"),
  status: statusSchema.default("todo").describe("Action status (todo/doing/done)"),
  order: z.number().int().min(0).describe("Position index within deliverable"),
});

export const planDeliverableSchema = z.object({
  title: z.string().min(3).max(80).describe("Deliverable title (3-80 chars)"),
  doneWhen: z.string().min(10).max(160).describe("Definition of done sentence (10-160 chars)"),
  status: statusSchema.default("todo").describe("Deliverable status"),
  order: z.number().int().min(0).describe("Position index within outcome"),
  notes: z.string().max(160).nullable().describe("Short AI note when attention is needed"),
  actions: z
    .array(planActionSchema)
    .max(7)
    .default([])
    .describe("Child actions supporting this deliverable"),
});

export const planOutcomeSchema = z.object({
  title: z.string().min(3).max(80).describe("Outcome title (3-80 chars)"),
  summary: z.string().max(160).describe("Short description of the value unlocked"),
  status: statusSchema.default("todo").describe("Outcome status"),
  order: z.number().int().min(0).describe("Position index within plan"),
  deliverables: z
    .array(planDeliverableSchema)
    .min(1)
    .max(9)
    .describe("Deliverables that roll up to this outcome"),
});

export const planDraftSchema = z.object({
  title: z.string().min(3).max(80).describe("Short plan title (3-80 chars)"),
  idea: z.string().describe("Original idea text"),
  summary: z.string().min(20).max(240).describe("Concise plan overview (20-240 chars)"),
  outcomes: z.array(planOutcomeSchema).min(1).max(7).describe("Ordered list of outcomes"),
});

export type PlanDraft = z.infer<typeof planDraftSchema>;
