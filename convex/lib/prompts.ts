type DraftPlanPromptInput = {
  idea: string;
};

export function buildPlanDraftPrompt({ idea }: DraftPlanPromptInput) {
  return `You are an AI planning copilot tasked with turning a product idea into a concise execution plan.
- Produce a mission statement in one sentence.
- Suggest 2-4 milestones. Each milestone needs a short goal sentence and 3-5 concrete tasks (plain sentences, no hyphens).
- Suggest up to 3 immediate next steps to validate momentum.

Idea: """${idea}"""
`;
}
