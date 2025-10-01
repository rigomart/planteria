"use server";

import { fetchAction } from "convex/nextjs";
import { redirect } from "next/navigation";
import { z } from "zod/v3";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";

const MIN_IDEA_LENGTH = 20;
const MAX_IDEA_LENGTH = 240;

const schema = z.object({
  idea: z
    .string()
    .trim()
    .min(MIN_IDEA_LENGTH, {
      message: `Describe your build mission in at least ${MIN_IDEA_LENGTH} characters.`,
    })
    .max(MAX_IDEA_LENGTH, {
      message: `Keep it under ${MAX_IDEA_LENGTH} characters so we can stay focused.`,
    }),
});

export async function createPlanForIdea(_initialState: unknown, formData: FormData) {
  const token = await getToken();

  if (!token) {
    throw new Error("Authentication token missing");
  }

  const validatedFields = schema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    const message = validatedFields.error.errors[0]?.message ?? "Please refine your idea.";
    return { message };
  }

  let planId: Id<"plans">;

  try {
    const { planId: generatedPlanId } = await fetchAction(
      api.plans.generation.generatePlan,
      { idea: validatedFields.data.idea },
      { token },
    );
    planId = generatedPlanId;
  } catch (error) {
    console.error("Failed to generate plan", error);
    const message = error instanceof Error ? error.message : "Failed to generate plan.";

    return { message };
  }

  redirect(`/workspace/${planId}`);
}
