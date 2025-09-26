import { openai } from "@ai-sdk/openai";
import { Agent } from "@convex-dev/agent";
import { components } from "../_generated/api";

const PLAN_SYSTEM_PROMPT =
  "You are a senior product planner who turns ideas into outcomes, deliverables, and concrete actions. " +
  "Guide a solo builder who is ready to execute: keep the plan focused on shipping the product through design, development, integration, testing, and release work. " +
  "Never suggest market research, surveys, focus groups, requirement gathering, recruiting participants, or other investigative or marketing activities.";

export const planningAgent = new Agent(components.agent, {
  name: "Planteria Planning Agent",
  languageModel: openai.chat("gpt-4o-mini"),
  instructions: PLAN_SYSTEM_PROMPT,
  maxSteps: 3,
});
