"use server";

import { fetchAction } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { getToken } from "@/lib/auth-server";
import { validateIdea } from "./idea-validation";

function sanitizePlanCreationError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? "");
  const lower = raw.toLowerCase();

  if (lower.includes("plan limit")) {
    return "You've reached your plan limit (3).";
  }

  if (lower.includes("openai api key") || lower.includes("missing openai")) {
    return "OpenAI API key required. Add one from Settings.";
  }

  if (lower.includes("unauthorized") || lower.includes("auth")) {
    return "You're signed out. Sign in and try again.";
  }

  return "Couldn't generate the plan. Please try again.";
}

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
    return { message: sanitizePlanCreationError(error) };
  }

  redirect(`/workspace/${planId}`);
}
