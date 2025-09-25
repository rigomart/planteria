# Phase 1 — Core Planning + Minimal Pre-Check

## Goal
Deliver a demoable flow that turns a solo builder's rough idea into a validated, shippable plan within minutes, while keeping friction low and guardrails visible.

## Scope & Non-Goals
- In scope: Google-authenticated access, lightweight idea intake, AI-assisted plan draft, baseline validators, essential node edits, basic plan health cues, and undo support.
- Out of scope: non-Google auth providers, advanced prioritization, branching, export channels, deep analytics, multi-agent workflows, or long-running human approval queues.

## Stack Baseline & Dependencies
- **Authentication**: Convex 1.25+ with Better Auth (`better-auth@1.3.8`, `@convex-dev/better-auth`) and the Google OAuth provider. Sessions flow through Convex tables via the Better Auth adapter and surface client-side with `ConvexBetterAuthProvider`.
- **LLM Services**: Vercel AI SDK (`ai`, `@ai-sdk/openai`) invoked from Convex actions for both intake clarifications and plan creation. Use `generateObject` with Zod schemas to ensure validators receive structured JSON.
- **Shared Tooling**: `zod` for schema validation, Convex codegen for typed APIs, shadcn/ui already present.

## Platform Requirements
- Install packages: `pnpm add better-auth@1.3.8 @convex-dev/better-auth ai @ai-sdk/openai zod`.
- Update `convex.config.ts` to `app.use(betterAuth)` via `@convex-dev/better-auth/convex.config` and register the HTTP routes with `httpRouter` + `nextJsHandler`.
- Configure Better Auth providers: keep email/password enabled for local verification, then re-enable the Google OAuth provider with client ID/secret and redirect URIs once credentials are ready.
- Populate environment variables:
  - Convex: `BETTER_AUTH_SECRET`, `SITE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `CONVEX_DEPLOYMENT` (dev), `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL` via `npx convex env set`.
  - Next.js: mirror `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`, `NEXT_PUBLIC_SITE_URL`, and `BETTER_AUTH_URL` if required by Better Auth client helpers.
  - LLM: `OPENAI_API_KEY` (or equivalent) stored server-side only.
- Wrap the frontend in `ConvexBetterAuthProvider` with an authenticated `ConvexReactClient` and expose helpers (`getToken`, `authClient`) for server/client fetching.

## Workstreams

### 1. Authentication & Platform Setup
- Better Auth + Convex wiring now runs with email/password while Google OAuth credentials are staged for reactivation after smoke-testing.
- Implementation checkpoints:
  - Added Better Auth/Convex dependencies, registered the component in `convex/convex.config.ts`, and exposed routes through `convex/http.ts` plus Next.js `/api/auth/[...route]`.
  - Created `convex/auth.ts` with `createClient`/`createAuth`, enabled the Convex plugin, scaffolding `getCurrentUser`, and wrapped the frontend with `ConvexBetterAuthProvider` via `src/app/convex-client-provider.tsx`, `src/lib/auth-client.ts`, and `src/lib/auth-server.ts`.
  - Configured the Convex client with `expectAuth: true`, documented required env vars (`BETTER_AUTH_SECRET`, `SITE_URL`, `NEXT_PUBLIC_CONVEX_URL`, `NEXT_PUBLIC_CONVEX_SITE_URL`), and deferred Google provider settings until credentials land.
- Next steps: layer the minimal sign-in UI (Google button + sign-out), gate plan mutations with `authComponent.getAuthUser`, and add telemetry plus manual smoke tests covering OAuth, session issuance, and Convex access controls.

### 2. LLM Services & Tooling (Vercel AI SDK)
- Create a shared Convex action utility that wraps `generateObject`/`generateText` from `ai`, targets `openai('gpt-4o-mini')` (or chosen model), handles retries, and redacts logs.
- Define Zod schemas that map to the plan structure (idea analysis, clarifying questions, outcomes/slices/tasks) and validate AI responses before returning to callers.
- Centralize rate limiting and token accounting per user to guard against abuse; capture metrics for latency and fallback usage.

### 3. Idea Intake & Pre-Check
- Design the submission UI with error copy and clarifying follow-up slots gated behind Google-authenticated sessions.
- Implement client heuristics (minimum length, stopword detection) and call the Convex action to fetch LLM-generated clarity ratings, questions, and goal-conflict warnings.
- Surface inline messaging, track when questions are answered, and persist idea metadata for auditability.

### 4. AI Plan Draft Generation
- Define prompt templates and Zod schema for outcome → slice → task JSON with non-technical wording and duration hints.
- Build a Convex mutation that invokes the LLM wrapper, enforces caps (≤8 slices, ≤40 tasks, 2–5 day slices, ≤90 minute tasks), and persists the validated plan.
- Implement retry + fallback stub plan logic so users always land in an editable state.

### 5. Guardrails & Validators
- Centralize validators (caps, demoable phrasing, orphan/cycle detection, non-goal compliance) reusable by initial generation and edits.
- Normalize error payloads for UI consumption and log validator outcomes for future tuning.

### 6. Essential Editing Experience
- Create a tree-style editor supporting rename/rephrase, split, merge, move/defer, and delete across outcomes/slices/tasks.
- Implement Convex mutations per action, using the LLM helper only when users request AI rephrasing/splitting, and gate optimistic updates behind validator results.
- Ensure UI surfaces rejection reasons clearly and maintains realtime sync through Convex subscriptions.

### 7. Plan Health Basics
- Flag vague or oversized nodes using heuristics plus optional one-shot Vercel AI suggestions; annotate guards via badges/tooltips.
- Highlight the minimum shippable path with an AI-generated rationale and ensure it respects validator constraints.

### 8. History & Undo
- Store a capped list of edit diffs (with timestamps/authors) in Convex, accessible via authenticated queries.
- Provide undo/redo controls that replay diffs only after validators pass, preventing invalid rewinds and syncing across collaborators.

### 9. Demo Readiness & Ops
- Run manual smoke-tests covering: email/password sign-up/in/out, Google sign-in once reinstated, idea flows (clean/vague/conflicting), invalid edit rejection, undo/redo happy path.
- Instrument analytics on LLM usage (clarifying question rate, validator failure counts, fallback frequency) and auth drop-off points.
- Update README/docs with Phase 1 behavior, environment setup (Google OAuth console, Convex env, LLM keys), manual test checklist, and guardrail rationale.

## Milestones
- **M0**: Better Auth + Google OAuth wired through Convex, client provider in place, env vars documented.
- **M1**: Idea intake UI + LLM clarity questions operating end-to-end for authenticated users.
- **M2**: AI plan draft mutation persisting plans with validator enforcement and retry safety nets.
- **M3**: Essential editing actions gated by guardrails in the live UI with realtime sync.
- **M4**: Plan health signals, undo, analytics, and demo checklist validated.

## Readiness Criteria
- Google-authenticated users can submit ideas, receive clarifications if needed, and see generated plans that satisfy guardrails without manual intervention.
- Each edit either applies instantly or returns a clear validator reason; undo rewinds safely while respecting auth boundaries.
- The team can demo the full flow with seeded data, explain AI/Better Auth touchpoints, and cite manual test results plus required environment configuration.
