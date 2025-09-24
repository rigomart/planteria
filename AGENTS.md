# Repository Guidelines

## Project Overview
- Planteria helps solo builders break fuzzy ideas into structured plans—ideas, outcomes, slices, and tasks—with AI guardrails enforcing clarity and scope.
- The app pairs a Next.js frontend with Convex for realtime persistence so plans stay in sync across sessions and collaborators.

## Project Structure & Module Organization
- Next.js App Router code lives in `src/app` (`layout.tsx`, `page.tsx`, shared providers) with global styles in `src/app/globals.css`.
- Reusable UI primitives sit in `src/components/ui`; domain helpers belong in `src/lib`.
- Convex backend functions are in `convex/`, with generated APIs under `convex/_generated`; update both when adding queries or mutations.
- Static assets go in `public/`; workspace configuration resides in files like `biome.json`, `next.config.ts`, and `tsconfig.json`.

## Build, Test, and Development Commands
- `pnpm install` — install dependencies (pnpm is required; keep the lockfile committed).
- `pnpm dev` — run the Next.js dev server with Turbopack at `http://localhost:3000`; pair it with `npx convex dev` when testing Convex interactions.
- `pnpm build` / `pnpm start` — create a production build and serve it locally.
- `pnpm lint` and `pnpm format` — apply Biome’s linting and formatting rules; run lint before every PR.

## Coding Style & Naming Conventions
- Biome enforces 2-space indentation, trailing commas where safe, and import ordering; never bypass `pnpm lint` in CI.
- Use TypeScript throughout; components and hooks in PascalCase (`PlanSummaryCard`), utilities in camelCase, env constants in SCREAMING_SNAKE_CASE.
- Prefer Tailwind utility classes defined in `globals.css`; keep custom styles colocated with components where practical.

## Testing Guidelines
- No automated test runner ships yet; document manual verification steps in your PR.
- When introducing tests, use `.test.ts(x)` files colocated with the feature (e.g. `src/lib/foo.test.ts`), and add an accompanying `pnpm test` script so CI can invoke it.
- Exercise Convex flows against a populated dev database before merging changes that hit `convex/`.

## Commit & Pull Request Guidelines
- Follow the existing Conventional Commit style (`feat:`, `chore:`, `fix:`) visible in `git log`.
- Each PR should include a short summary, linked issue or task, screenshots/GIFs for UI changes, and a checklist of manual/automated tests run.
- Highlight any required env updates (`NEXT_PUBLIC_CONVEX_URL`) and schema migrations for reviewers.

## Configuration & Environment
- Local runs need `NEXT_PUBLIC_CONVEX_URL` defined; `ConvexClientProvider` throws if it is missing.
- Keep secrets in `.env.local` (never commit). Regenerate Convex types with `npx convex codegen` after editing schema or functions.
