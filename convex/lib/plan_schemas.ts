import { z } from "zod";

export const clarifyingQuestionSchema = z.object({
  question: z.string(),
  rationale: z.string().optional(),
});

export const planDraftSchema = z.object({
  idea: z.string(),
  mission: z.string(),
  milestones: z
    .array(
      z.object({
        title: z.string(),
        goal: z.string(),
        tasks: z.array(z.string()).min(1).max(6),
      }),
    )
    .min(1)
    .max(5),
  nextSteps: z.array(z.string()).max(5).default([]),
});

export type PlanDraft = z.infer<typeof planDraftSchema>;
