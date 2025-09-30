import type { PlanDraft } from "./plan_schemas";

type DraftPlanPromptInput = {
  idea: string;
};

export function buildPlanDraftPrompt({ idea }: DraftPlanPromptInput) {
  return `You are an AI planning copilot turning a product idea into an actionable execution plan.
- Provide a concise plan title (3-80 chars) that captures what will be built.
- Write a 1-2 sentence summary (20-240 chars) that explains the product outcome and value. Make it practical and informative.
- The builder is ready to ship; focus outcomes, deliverables, and actions on designing, building, integrating, testing, and launching the product. Do not include work about market research, surveys, focus groups, recruitment, requirement gathering, or generic investigations.
- Produce 1-7 outcomes. For each outcome include:
  * order — integer index for the outcome's position (0 for the first outcome, then increment).
  * title — 3-80 characters, concrete and specific.
  * summary — up to 160 characters describing the value unlocked.
  * status — one of "todo", "doing", "done" (use "todo" for new plans).
- For every outcome, map 1-9 deliverables. Each deliverable must include:
  * order — integer index for its position within the outcome (start at 0).
  * title — 3-80 characters describing the tangible result.
  * doneWhen — one sentence (10-160 chars) defining "done".
  * status — one of "todo", "doing", "done" (use "todo" initially).
  * notes — short note (≤160 chars) only when attention is needed; use null otherwise.
  * actions — 0-7 plain-sentence action objects that help complete the deliverable. Keep them hands-on and execution oriented (coding, design, implementation, QA, release). For each action include:
    - order — integer index for its position within the deliverable (start at 0).
    - title — 3-80 characters with no bullet characters.
    - status — one of "todo", "doing", "done" (use "todo" for new items).

Return structured JSON only with fields: title, idea, summary, outcomes[]. The provided idea field must echo the original idea text. No additional commentary.

Idea: """${idea}"""`;
}

type AdjustmentPromptInput = PlanDraft & {
  instruction: string;
};

export function buildPlanAdjustmentPrompt({
  instruction,
  ...plan
}: AdjustmentPromptInput) {
  const serialized = JSON.stringify(plan, null, 2);

  return `You are updating an existing execution plan for a solo builder. Apply the user's instruction while preserving the idea focus and returning a full plan structure.
- Keep the same JSON schema as the existing plan with fields: title, idea, summary, outcomes[].
- Outcomes, deliverables, and actions must stay ordered starting from 0 with consecutive integers.
- Preserve any work that still aligns with the mission; replace or expand details only where the instruction calls for it.
- Ensure every deliverable includes a concrete doneWhen and only include notes when essential.
- Use status values "todo", "doing", or "done" only.
- The response must be valid JSON matching the schema, no extra commentary.

Existing plan:
${serialized}

Instruction: """${instruction.trim()}"""`;
}
