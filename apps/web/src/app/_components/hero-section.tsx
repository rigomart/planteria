import { ArrowRight, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StripedPattern } from "@/components/ui/striped-pattern";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function HeroSection() {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-border/70 bg-card/80 px-4 py-6 grid grid-cols-12 justify-center gap-8">
      <StripedPattern direction="right" className="text-primary/20" width={10} height={10} />

      <div className="flex flex-col gap-3 lg:text-left justify-center z-10 col-span-12 lg:col-span-4">
        <Badge
          variant="outline"
          className="mx-auto w-fit text-xs lg:mx-0 rounded-full border-primary/50"
        >
          MVP-first planning for developers
        </Badge>
        <div className="flex flex-col gap-5 items-center lg:items-start">
          <h1 className="text-balance font-semibold tracking-tight text-4xl text-center lg:text-left lg:text-5xl max-w-2xl">
            Turn your idea into a shippable plan
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Outcomes → Deliverables → Actions. Guardrails keep scope tight so you ship the smallest
            viable slice.
          </p>

          <Button asChild size="lg">
            <Link href="/sign-up" className="flex items-center gap-2">
              Create your plan
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>

          <McpCallout />
        </div>
      </div>

      <HeroWorkspacePreview />
    </section>
  );
}

function McpCallout() {
  const clientConfigs = [
    {
      id: "cursor",
      client: "Cursor",
      config: `"Planteria": {
    "command": "npx",
    "args": ["-y", "@mirdor/planteria-mcp@latest"],
    "env": {
      "PLANTERIA_API_KEY": "<YOUR_PLANTERIA_API_KEY>"
    }
}`,
    },
    {
      id: "codex",
      client: "Codex",
      config: `[mcp_servers.planteria]
  command = "npx"
  args = ["-y", "@mirdor/planteria-mcp@latest"]
  env = {"PLANTERIA_API_KEY" = "<YOUR_PLANTERIA_API_KEY>"}`,
    },
  ];

  return (
    <div className="w-full rounded-xl border border-primary/20 bg-background/50 p-4 text-sm text-muted-foreground ">
      <div className="flex flex-col gap-3">
        <div>
          <p className="font-semibold tracking-wide text-primary">Connect the MCP everywhere</p>
          <p className="text-sm text-foreground">Use it with your favorite AI Tool</p>
        </div>

        <Tabs defaultValue={clientConfigs[0]?.id} className="w-full">
          <TabsList className="w-full flex-wrap justify-start bg-background">
            {clientConfigs.map(({ id, client }) => (
              <TabsTrigger key={id} value={id} className="px-3 py-1.5 text-sm">
                {client}
              </TabsTrigger>
            ))}
          </TabsList>

          {clientConfigs.map(({ id, config }) => (
            <TabsContent key={id} value={id}>
              <pre className="rounded-md border border-border/60 bg-background/80 p-3 text-xs leading-relaxed text-foreground overflow-x-auto w-full h-44">
                <code>{config}</code>
              </pre>
              <p className="mt-2 text-xs text-muted-foreground">
                Replace <span className="text-foreground">&lt;YOUR_PLANTERIA_API_KEY&gt;</span> with
                an API key from settings.
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function HeroWorkspacePreview() {
  const recentChanges = [
    { description: "Add monetization deliverable", time: "2 min ago" },
    { description: "Tighten scope on telemetry", time: "5 min ago" },
    { description: "Summarize AI adjustments", time: "8 min ago" },
    { description: "Link preview to workspace layout", time: "12 min ago" },
  ];

  const outcomes = [
    "Feature flags retire without manual intervention within 24h of success criteria.",
    "Teams receive rollup notes with links to completed experiments.",
  ];

  const deliverables = [
    {
      title: "Feature flag scheduler with automated expiry",
      doneWhen: "Done when telemetry hits success metric for 24h",
    },
    {
      title: "Rollup digest pushed to Launchpad",
      doneWhen: "Done when digest includes rollout links",
    },
    {
      title: "Audit log export for compliance",
      doneWhen: "Done when export schedules weekly to shared drive",
    },
  ];

  const nextActions = [
    "Instrument usage telemetry in Linehaul service.",
    "Wire MCP bridge to feature-flag scheduler.",
    "Ship dashboard toast with acceptance proof.",
  ];

  return (
    <div className="relative mx-auto max-w-4xl w-full overflow-hidden rounded-xl border border-border/50 bg-background shadow-lg shadow-primary/10 p-4 z-10 col-span-12 lg:col-span-8">
      <div className="flex items-center justify-between pb-4">
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
          Workspace preview
        </span>
      </div>
      <div className="grid gap-3 md:grid-cols-12 select-none">
        {/* AI Assistant Panel (left) */}
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card/70 p-3 md:col-span-5">
          <header className="flex items-center gap-2">
            <div className="flex-shrink-0 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10 p-1.5">
              <Wand2 className="size-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">Plan AI</h3>
              <p className="truncate text-xs text-muted-foreground">Guided plan adjustments</p>
            </div>
          </header>

          {/* History Timeline */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <h4 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Recent changes
              </h4>
              <span className="text-xs text-muted-foreground/70">{recentChanges.length}</span>
            </div>
            <div className="relative flex flex-col">
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/60" />
              <div className="flex flex-col gap-3">
                {recentChanges.map((change) => (
                  <article key={change.description} className="relative flex gap-2">
                    <div className="relative z-10 flex-shrink-0">
                      <div className="flex size-4 items-center justify-center rounded-full bg-primary/20 ring-2 ring-card">
                        <div className="size-2 rounded-full bg-primary" />
                      </div>
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="text-xs text-foreground/80">{change.description}</p>
                      <p className="text-[11px] text-muted-foreground">{change.time}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          {/* Composer */}
          <div className="mt-auto flex flex-col gap-2 rounded-xl border border-border/60 bg-background/90 p-2.5">
            <textarea
              placeholder="e.g. Add MCP integration for telemetry sync"
              disabled
              className="h-20 w-full resize-none rounded-lg border border-border/40 bg-muted/30 px-2.5 py-2 text-xs placeholder:text-muted-foreground/60"
            />
            <Button className="h-7 gap-1.5 text-xs" disabled>
              <Sparkles className="size-3" />
              Adjust plan
            </Button>
          </div>
        </div>

        {/* Plan Outline Panel (right) */}
        <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-background p-3 md:col-span-7 select-none">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Idea
              </p>
              <p className="text-sm font-medium text-foreground">
                Auto-expire beta feature flags once telemetry shows usage goals are met.
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px] uppercase">
              Ready
            </Badge>
          </div>

          <div className="grid gap-2.5">
            {/* Outcomes */}
            <section className="rounded-lg border border-border/60 bg-card/50 p-2.5 select-none">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Outcomes
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                {outcomes.map((outcome) => (
                  <li key={outcome} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-primary/70" aria-hidden />
                    {outcome}
                  </li>
                ))}
              </ul>
            </section>

            {/* Deliverables */}
            <section className="rounded-lg border border-border/60 bg-card/50 p-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Deliverables
              </p>
              <div className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                {deliverables.map((deliverable) => (
                  <div key={deliverable.title} className="rounded-md bg-muted/40 p-2">
                    <p className="font-medium text-foreground/90">{deliverable.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground/80">
                      {deliverable.doneWhen}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Next actions */}
            <section className="rounded-lg border border-border/60 bg-card/50 p-2.5">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Next actions
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-muted-foreground">
                {nextActions.map((action) => (
                  <li key={action} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 rounded-full bg-primary/50" aria-hidden />
                    {action}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
