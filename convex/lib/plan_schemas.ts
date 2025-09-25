import { z } from "zod";

export const clarifyingQuestionSchema = z.object({
  question: z.string(),
  rationale: z.string().optional(),
});

export const ideaClarificationSchema = z.object({
  ideaSummary: z.string(),
  clarityScore: z
    .number("A value between 0 and 1 representing idea clarity")
    .min(0)
    .max(1),
  questions: z.array(clarifyingQuestionSchema).max(5),
  risks: z.array(z.string()).default([]),
  nextSteps: z.array(z.string()).default([]),
});

export const planTaskSchema = z.object({
  title: z.string(),
  outcome: z.string().optional(),
  description: z.string().optional(),
  effort: z.string().optional(),
});

export const planSliceSchema = z.object({
  name: z.string(),
  objective: z.string(),
  duration: z.string().optional(),
  tasks: z.array(planTaskSchema).min(1),
});

export const planOutcomeSchema = z.object({
  name: z.string(),
  successCriteria: z.string(),
  slices: z.array(planSliceSchema).min(1).max(8),
});

export const planDraftSchema = z.object({
  idea: z.string(),
  mission: z.string(),
  outcomes: z.array(planOutcomeSchema).min(1).max(5),
  summary: z.string(),
});

export type IdeaClarification = z.infer<typeof ideaClarificationSchema>;
export type PlanDraft = z.infer<typeof planDraftSchema>;
