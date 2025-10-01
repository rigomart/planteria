"use server";

import { fetchAction } from "convex/nextjs";
import { redirect } from "next/navigation";
import { z } from "zod/v3";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";

const schema = z.object({
  idea: z.string().min(1),
});

export async function createPlanForIdea(_initialState: unknown, formData: FormData) {
  const token = await getToken();

  if (!token) {
    throw new Error("Authentication token missing");
  }

  const validatedFields = schema.safeParse(Object.fromEntries(formData));

  if (!validatedFields.success) {
    return { message: validatedFields.error.message };
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
