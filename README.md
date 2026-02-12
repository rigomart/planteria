# Planteria

AI-powered planning tool that turns fuzzy ideas into structured, shippable plans in minutes. [Live app](https://planteria-web.vercel.app/)

## Tech Stack

- **Framework** — Next.js 15 (App Router, Turbopack) + React 19
- **Backend** — Convex (realtime database, serverless functions, scheduled jobs)
- **Auth** — Better Auth with GitHub & Google OAuth, backed by Convex
- **AI** — OpenAI GPT-5 via `@ai-sdk/openai`, Firecrawl for web research
- **Styling** — Tailwind CSS 4, Radix UI primitives, class-variance-authority
- **MCP** — Standalone Model Context Protocol server for external AI tool access
- **Monorepo** — Turborepo + pnpm workspaces
- **Code Quality** — Biome (lint + format), TypeScript strict mode

## How It Works

A user types a build idea (e.g. "offline-first recipe manager with meal planning"). From there, Planteria runs a three-stage pipeline:

1. **Research** — Firecrawl searches the web for the idea, scrapes the top results, and extracts snippets (title, URL, up to 900 chars each). These become `researchInsights` stored on the plan.

2. **Generation** — A Convex scheduled action feeds the research context plus the user's idea to an OpenAI agent (`@convex-dev/agent` wrapping GPT-5). The agent is prompted to return JSON only — a hierarchy of Outcomes (max 7), Deliverables (max 9 each), and Actions (max 7 each), all with crisp `doneWhen` criteria. The output is validated against Zod schemas before anything is persisted.

3. **Persistence** — The validated structure is written to Convex in one transaction: plan shell, outcomes, deliverables, and actions. Because Convex queries are reactive, the frontend picks up the change instantly — the plan flips from `generating` to `ready` without polling.

The user can then edit the plan inline (rename, reorder via drag-and-drop, split/merge nodes, change status) or ask the AI to adjust the whole plan with a natural-language instruction. Adjustments replace the full hierarchy and are capped at 3 per plan to keep things intentional.

External AI tools (Claude, ChatGPT, etc.) can read plans via the MCP server, which exposes three endpoints authenticated with user-generated API keys: `list-plans`, `get-pending-work`, and `get-plan-details`.

## Project Structure

```
planteria/
├── apps/web/                     # Next.js application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/           # Auth-gated routes — workspace and settings
│   │   │   ├── (unauth)/         # Public routes — sign-in, sign-up
│   │   │   ├── api/auth/         # Better Auth catch-all route handler
│   │   │   └── _components/      # Landing page sections (hero, features, flow)
│   │   ├── components/ui/        # Shadcn-style primitives built on Radix
│   │   ├── hooks/                # Shared React hooks (e.g. use-mobile)
│   │   └── lib/                  # Auth client/server setup, cn utility
│   └── convex/                   # All backend logic lives here
│       ├── schema.ts             # Single source of truth for the data model
│       ├── agents/               # LLM agent config (model, system prompt)
│       ├── plans/                # Plan CRUD + the generation pipeline
│       ├── lib/                  # Prompts, Zod schemas, rate limits, ownership checks
│       ├── http/                 # HTTP routes for MCP endpoints
│       └── *.ts                  # Domain modules (outcomes, deliverables, actions, auth, keys)
├── packages/mcp/                 # Standalone MCP server, published as @mirdor/planteria-mcp
│   └── src/main.ts               # Stdio transport, 3 tools, Bearer auth against Convex HTTP
├── turbo.json                    # Task pipeline — build depends on ^build, dev is persistent
└── pnpm-workspace.yaml           # apps/* and packages/*
```

Frontend uses Next.js route groups to split auth/unauth layouts. Convex colocates backend logic with the web app (`apps/web/convex/`) since it's the only consumer — no need for a separate package. The MCP server is a separate package because it ships as a standalone CLI binary.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`corepack enable`)
- A [Convex](https://convex.dev) account

### Setup

```bash
git clone https://github.com/rigos/planteria.git
cd planteria
pnpm install
```

Create `apps/web/.env.local`:

```env
NEXT_PUBLIC_CONVEX_URL=<your-convex-deployment-url>
SITE_URL=http://localhost:3000

# OAuth (optional — email/password works without these)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Set these in your Convex dashboard:

```
OPENAI_API_KEY       # fallback key — users can also provide their own in Settings
FIRECRAWL_API_KEY    # powers web research during plan generation
SITE_URL             # your deployment URL
```

### Run

```bash
# Terminal 1 — Next.js dev server
pnpm dev

# Terminal 2 — Convex backend
cd apps/web && npx convex dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

From the repo root (via Turborepo):

| Command | What it does |
|---------|-------------|
| `pnpm dev` | Start Next.js dev server with Turbopack |
| `pnpm build` | Production build (Next.js + MCP) |
| `pnpm lint` | Lint and auto-fix with Biome |
| `pnpm check-types` | TypeScript type checking across all packages |
| `pnpm test` | Run tests |

Inside `apps/web/`:

| Command | What it does |
|---------|-------------|
| `pnpm format` | Auto-format with Biome |
| `npx convex dev` | Start Convex dev backend with hot reload |
| `npx convex deploy` | Deploy Convex functions to production |

## License

MIT
