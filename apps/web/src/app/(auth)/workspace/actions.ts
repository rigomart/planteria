"use server";

import { fetchAction } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { validateIdea } from "./idea-validation";

export async function createPlanForIdea(_initialState: unknown, formData: FormData) {
  const token = await getToken();

  if (!token) {
    throw new Error("Authentication token missing");
  }

  const entries = Object.fromEntries(formData);
  const ideaInput = typeof entries.idea === "string" ? entries.idea : "";
  const validationError = validateIdea(ideaInput);

  if (validationError) {
    return { message: validationError };
  }

  let planId: Id<"plans">;

  try {
    const { planId: generatedPlanId } = await fetchAction(
      api.plans.generation.generatePlan,
      { idea: ideaInput.trim() },
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
