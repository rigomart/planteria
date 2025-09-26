type DraftPlanPromptInput = {
  idea: string;
};

export function buildPlanDraftPrompt({ idea }: DraftPlanPromptInput) {
  return `You are an AI planning copilot turning a product idea into an actionable execution plan.
- Start with a mission sentence that anchors the plan.
- Produce 2-4 outcomes. For each outcome provide:
  * title — 3-80 characters, concrete and specific.
  * summary — up to 160 characters describing the value unlocked.
  * status — always "todo" for new plans.
- For every outcome, map 1-3 deliverables. Each deliverable must include:
  * title — 3-80 characters describing the tangible result.
  * doneWhen — one sentence (10-160 chars) defining "done".
  * status — always "todo" initially.
  * notes — short note (≤160 chars) only when you see something that needs attention, otherwise null.
  * actions — 0-5 plain-sentence action titles (3-80 chars, no bullet characters) that help complete the deliverable. Each action also needs a status of "todo".

Return structured JSON only with fields: idea, mission, outcomes[]. No additional commentary.

Idea: """${idea}"""`;
}
