## Planteria

**Planteria** is an AI-powered planning tool designed to help **solo builders** quickly turn fuzzy ideas into clear, shippable plans. It treats plans as structured data—moving from **ideas → outcomes → deliverables → actions**—with strict guardrails to ensure clarity, demoability, and focus on the minimum shippable path.

The tool emphasizes:

* **Simplicity first**: No technical specs, no UI design, no overcomplexity.
* **Fast value**: Users go from idea to validated plan in minutes.
* **Structured editing**: Supports both node-level (rename, split/merge, move, prune) and plan-level operations (rescope, reprioritize, audit).
* **Guardrails**: Enforces validity rules (e.g., outcomes capped at 7, deliverables at 9 each, actions at 7 each, no orphaned items, demoable `doneWhen` statements).
* **Phased growth**: Starts lean with auto-accepted edits and no integrations, then gradually adds exports, MCP agent access, approval workflows, grounding with evidence, and eventually branching/advanced prioritization.

At its core, Planteria is about **maximizing user speed and clarity** while keeping complexity low, with AI acting as a copilot for structured planning.

### Core Product Intent

- Audience: indie developers who come with a concrete idea they want to ship.
- Input expectation: the user types a specific build mission, not a vague prompt or brainstorming request. Treat that mission as the source of truth.
- Output: a structured plan of outcomes → deliverables → actions with crisp `doneWhen` criteria aimed at the smallest shippable slice.
- Copy and examples: anywhere the repo shows “example prompts,” they should model specificity and product outcomes. Prefer templates like “Build [capability] that [effect] when [signal]” over generic tasks.

### Workspace entry experience

Indie builders land in the workspace hero and type a concrete product idea or job-to-be-done statement (e.g. "Detect production–schema drift and generate safe migration PRs instantly"). Every generated plan assumes the input already describes a specific build target, so sample prompts in the UI should model that level of specificity.

### Environment configuration

- `NEXT_PUBLIC_CONVEX_URL` – public Convex deployment URL (required by the client provider).
