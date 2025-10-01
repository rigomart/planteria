import type { PlanDraft } from "./plan_schemas";

type DraftPlanPromptInput = {
  idea: string;
};

export function buildPlanDraftPrompt({ idea }: DraftPlanPromptInput) {
  return `
* Provide a concise title and summary expressing the user-visible outcome and value.
* Create outcomes → deliverables → actions that result in working, demoable increments. Avoid layer-only splits; each item should be end-to-end across client/server as needed.
* DO NOT include mockups, wireframes, research, or requirement-gathering tasks unless explicitly requested.
* DO NOT include testing/QA tasks unless explicitly requested.
* Keep the plan implementation-agnostic (no stacks, libraries, code).
* Use "todo" for new statuses; keep text lean; acceptance criteria as a single "done when" line.

Return the plan as JSON only per the provided schema.

This is the idea the user provided:
  
"""${idea}"""`;
}

type AdjustmentPromptInput = PlanDraft & {
  instruction: string;
};

export function buildPlanAdjustmentPrompt({ instruction, ...plan }: AdjustmentPromptInput) {
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
