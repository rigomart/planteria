# Planteria

**Planteria** is an AI-powered planning tool designed to help **developers** quickly turn fuzzy ideas into clear, shippable plans. It treats plans as structured data—moving from **ideas → outcomes → deliverables → actions**—with strict guardrails to ensure clarity, demoability, and focus on the minimum shippable path.

The tool emphasizes:

* **Simplicity first**: No technical specs, no UI design, no overcomplexity.
* **Fast value**: Users go from idea to validated plan in minutes.
* **Structured editing**: Supports both node-level (rename, split/merge, move, prune) and plan-level operations (rescope, reprioritize, audit).
* **AI guardrails**: Enforces validity rules (e.g., outcomes capped at 7, deliverables at 9 each, actions at 7 each, no orphaned items, demoable `doneWhen` statements).
* **Phased growth**: Starts lean with auto-accepted edits and no integrations, then gradually adds exports, MCP agent access, approval workflows, grounding with evidence, and eventually branching/advanced prioritization.

At its core, Planteria is about **maximizing user speed and clarity** while keeping complexity low, with AI acting as a copilot for structured planning.

## Architecture

Planteria is built as a modern web application with the following components:

- **Frontend**: Next.js 15 with App Router, React 19, and Tailwind CSS
- **Backend**: Convex for realtime database and serverless functions
- **AI Integration**: OpenAI SDK for plan generation and adjustments
- **MCP Server**: Model Context Protocol server for external tool integrations
- **Authentication**: Better Auth integration
- **Build System**: Turborepo monorepo with pnpm

## Project Structure

```
planteria/
├── apps/web/                 # Main Next.js application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # Reusable UI components
│   │   └── lib/             # Utility functions
│   ├── convex/              # Convex backend functions
│   └── public/              # Static assets
├── packages/mcp/            # MCP server package
└── packages/                # Future packages
```

## Core Product Intent

- **Audience**: Indie developers who come with a concrete idea they want to ship
- **Input expectation**: Users type a specific build mission, not a vague prompt or brainstorming request
- **Output**: A structured plan of outcomes → deliverables → actions with crisp `doneWhen` criteria aimed at the smallest shippable slice
- **Voice and UX**: Action-first, opinionated guardrails, crisp copy

### Example Mission Patterns

- "Build [specific capability] that [measurable effect] when [signal/trigger]"
- "Turn [input type] into [artifact] with [constraints] to achieve [outcome]"
- "Detect [problem] and auto-[remediation] so [user/business benefit]"

## Getting Started

### Prerequisites

- **Node.js**: Version 18 or later
- **pnpm**: Package manager (required)
- **Convex Account**: For backend services

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rigos/planteria.git
   cd planteria
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in `apps/web/` with:
   ```env
   NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
   ```

4. **Start the development servers**

   ```bash
   # Start the web application
   pnpm dev

   # In another terminal, start Convex dev server
   cd apps/web && npx convex dev
   ```

5. **Open your browser**

   Navigate to `http://localhost:3000` to see the application.

## Development

### Available Scripts

- `pnpm dev` - Start development servers
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run linting and formatting
- `pnpm check-types` - Type checking

### Development Workflow

1. **Code Changes**: Make changes in the respective packages
2. **Linting**: Run `pnpm lint` to ensure code quality
3. **Type Checking**: Run `pnpm check-types` to verify TypeScript
4. **Testing**: Manual testing with `pnpm dev` and Convex dev server

### MCP Server

The MCP server provides external tool access to Planteria data:

```bash
cd packages/mcp
node src/server.ts --api-key your_planteria_api_key
```

Available MCP tools:
- `list-plans` - Get the latest five plans
- `get-pending-work` - Get incomplete work for a plan
- `get-plan-details` - Get full plan details

## Data Model

The core data structure follows a hierarchical planning model:

- **Plans**: Top-level containers with mission statements
- **Outcomes**: High-level results (max 7 per plan)
- **Deliverables**: Concrete work items with `doneWhen` criteria (max 9 per outcome)
- **Actions**: Specific tasks to complete deliverables (max 7 per deliverable)

All entities support status tracking (`todo`, `doing`, `done`) and maintain creation/update timestamps.

## Authentication & Security

- **Authentication**: Better Auth with Convex integration
- **API Keys**: User-managed API keys for external access
- **Authorization**: Row-level security via Convex auth

## Deployment

### Web Application

1. **Build the application**
   ```bash
   pnpm build
   ```

2. **Deploy to Vercel/Netlify** or your preferred platform

### Convex Backend

1. **Deploy Convex functions**
   ```bash
   cd apps/web
   npx convex deploy
   ```

2. **Update environment variables** in your deployment platform


## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for developers who want to ship faster.
