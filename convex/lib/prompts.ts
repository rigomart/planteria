type ClarifyIdeaPromptInput = {
  idea: string;
};

type DraftPlanPromptInput = {
  idea: string;
  clarification?: string;
};

export function buildClarifyIdeaPrompt({ idea }: ClarifyIdeaPromptInput) {
  return `You are an expert product strategist helping a solo builder describe their idea with precision.
- Read the idea and determine how clear it is on a 0-1 scale.
- Produce up to five clarifying questions that would unblock execution.
- Surface concrete risks only if they are evident.
- Suggest immediate next steps to validate momentum.

Idea: """${idea}"""
`;
}

export function buildPlanDraftPrompt({
  idea,
  clarification,
}: DraftPlanPromptInput) {
  const context = clarification?.trim()
    ? `Clarification from the builder:
${clarification.trim()}
`
    : "";

  return `You are an AI planning copilot tasked with turning a product idea into a concise execution plan.
- Produce 2-5 outcomes that describe milestone achievements.
- For each outcome, map 2-4 slices representing meaningful checkpoints (2-5 day scope).
- For each slice, list 3-6 tasks that take 30-90 minutes each and move the slice forward.
- Highlight mission and summary in plain language for non-technical stakeholders.

Idea: """${idea}"""
${context}
`;
}
