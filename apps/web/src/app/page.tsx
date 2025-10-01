import { fetchQuery } from "convex/nextjs";
import { ArrowRight, MessageSquare, ServerCog, Sparkles, Wand2 } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { LogoWithText } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { getToken } from "@/lib/auth-server";

export default async function Home() {
  const token = await getToken();

  if (token) {
    const currentUser = await fetchQuery(api.users.getCurrentUser, {}, { token }).catch(() => null);

    if (currentUser) {
      redirect("/workspace");
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-foreground transition-colors hover:text-primary"
        >
          <LogoWithText size={36} />
        </Link>
        <nav className="flex items-center gap-3">
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="https://github.com/rigos/planteria" target="_blank" rel="noreferrer">
              GitHub
            </Link>
          </Button>
          <Button asChild variant="ghost" className="text-sm">
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button asChild className="text-sm">
            <Link href="/sign-up" className="flex items-center gap-1">
              Sign up
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </Button>
        </nav>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 pb-14 pt-6 sm:px-8 lg:gap-14 lg:pt-10">
        <section className="relative isolate grid items-center gap-10 overflow-hidden rounded-3xl border border-border/70 bg-card/80 px-6 py-10 shadow-[0_40px_120px_-60px_rgba(12,106,84,0.45)] sm:px-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.35fr)]">
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(114,219,179,0.18),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(46,112,90,0.35),_transparent_65%)]" />
          <div className="flex flex-col gap-3 text-center lg:items-start lg:text-left">
            <Badge variant="secondary" className="mx-auto w-fit text-[11px] lg:mx-0">
              Action-first planning for solo builders
            </Badge>
            <div className="flex max-w-lg flex-col gap-2">
              <h1 className="text-balance text-[1.95rem] font-semibold tracking-tight sm:text-[2.2rem] lg:text-[2.3rem]">
                Ship focused product plans with AI guardrails
              </h1>
              <p className="text-balance text-sm text-muted-foreground sm:text-base">
                Turn your mission into outcomes, deliverables, and crisp `doneWhen` signals in
                minutes.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Button asChild size="lg" className="text-sm sm:text-base">
                <Link href="/sign-up" className="flex items-center gap-2">
                  Start planning
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-sm sm:text-base">
                <Link href="https://github.com/rigos/planteria" target="_blank" rel="noreferrer">
                  View the repo
                </Link>
              </Button>
            </div>
            <p className="max-w-md text-xs text-muted-foreground sm:text-sm lg:text-left">
              Scope stays tight, revisions stay traceable, and every handoff has proof.
            </p>
          </div>
          <div className="relative mx-auto w-full max-w-[760px] overflow-hidden rounded-3xl border border-border/50 bg-card shadow-lg shadow-primary/10 sm:p-8">
            <div className="flex items-center justify-between pb-5">
              <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Workspace preview
              </span>
              <Badge
                variant="outline"
                className="border-primary/50 text-[10px] uppercase text-primary"
              >
                Live synced
              </Badge>
            </div>
            <HeroWorkspacePreview />
          </div>
        </section>

        <section className="rounded-3xl border border-border/60 bg-card px-6 py-7 shadow-md shadow-primary/5 dark:bg-card/45">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-xl space-y-2.5">
              <h2 className="text-xl font-semibold tracking-tight sm:text-[1.65rem]">
                From idea to done in one structured flow
              </h2>
              <p className="text-sm text-muted-foreground sm:text-base">
                Start with your mission, then let Planteria map outcomes, deliverables, and
                acceptance signals. Every revision stays synced across collaborators via Convex and
                MCP.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground sm:text-sm">
              <span className="rounded-lg bg-muted px-3 py-1 text-muted-foreground/90">
                Mission → Outcomes
              </span>
              <span className="rounded-lg bg-muted px-3 py-1 text-muted-foreground/90">
                Deliverables &amp; `doneWhen`
              </span>
              <span className="rounded-lg bg-muted px-3 py-1 text-muted-foreground/90">
                AI co-pilot on tap
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FeatureCard
            icon={<Sparkles className="size-6" aria-hidden />}
            title="Opinionated AI plan generation"
            description="Drop in a specific product mission and receive a structured plan that enforces crisp outcomes, deliverables, and `doneWhen` criteria."
          />
          <FeatureCard
            icon={<Wand2 className="size-6" aria-hidden />}
            title="Adjustments on demand"
            description="Iterate live with AI suggestions that refine scope, tighten acceptance, and keep every change in sync across the workspace."
          />
          <FeatureCard
            icon={<ServerCog className="size-6" aria-hidden />}
            title="MCP-native connections"
            description="Connect Planteria to your MCP servers to pull telemetry, trigger automations, and keep planning data tied to real signals."
          />
        </section>

        <section className="rounded-3xl border border-primary/20 bg-primary/10 px-7 py-10 text-center shadow-lg shadow-primary/15 dark:bg-primary/15">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5">
            <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-[2.15rem]">
              Keep your mission, outcomes, and actions aligned as you ship.
            </h2>
            <p className="text-balance text-sm text-muted-foreground sm:text-base">
              Create your first plan now and see how Planteria keeps every collaborator focused on
              the smallest shippable slice.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="text-sm sm:text-base">
                <Link href="/sign-up">Create an account</Link>
              </Button>
              <Button asChild variant="ghost" size="lg" className="text-sm sm:text-base">
                <Link href="/sign-in">Already onboard? Sign in</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Card className="h-full border-border/60 bg-card/80 p-6 shadow-md shadow-primary/5 backdrop-blur-sm dark:bg-card/60">
      <CardHeader className="gap-4 p-0">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          {icon}
        </div>
        <CardTitle className="text-lg font-semibold tracking-tight">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground/90">
          {description}
        </CardDescription>
      </CardHeader>
    </Card>
  );
}

function HeroWorkspacePreview() {
  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,0.45fr)_minmax(0,0.55fr)]">
      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-4">
        <header className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <MessageSquare className="size-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">Plan AI</p>
            <p className="text-xs text-muted-foreground">Guided plan adjustments</p>
          </div>
        </header>
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-dashed border-border/50 bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
            Adjustments will appear here once you run them.
          </div>
          <div className="flex flex-col gap-2 rounded-xl border border-border/60 bg-background/95 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Composer
            </p>
            <div className="rounded-lg border border-border/40 bg-muted/20 p-3 text-sm text-muted-foreground">
              e.g. “Add an MCP action to sync plan updates to the feature flag scheduler.”
            </div>
            <Button className="h-8 gap-1.5 self-start px-3 text-xs">Adjust plan</Button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-2xl border border-border/60 bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Mission
            </p>
            <p className="text-sm font-medium text-foreground">
              Auto-expire beta feature flags once telemetry shows usage goals are met.
            </p>
          </div>
          <Badge variant="secondary" className="text-[10px] uppercase">
            Scoped
          </Badge>
        </div>
        <div className="grid gap-3">
          <section className="rounded-xl border border-border/60 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Outcomes
            </p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 rounded-full bg-primary/70" aria-hidden />
                Feature flags retire without manual intervention within 24 hours of success
                criteria.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 rounded-full bg-primary/70" aria-hidden />
                Teams receive rollup notes with links to completed experiments.
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-border/60 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Deliverables
            </p>
            <div className="mt-2 space-y-2 text-sm text-muted-foreground">
              <div className="rounded-lg bg-muted/30 p-2">
                Feature flag scheduler with automated expiry rules
                <div className="text-xs text-muted-foreground/80">
                  Done when telemetry hits success metric for 24h
                </div>
              </div>
              <div className="rounded-lg bg-muted/30 p-2">
                Rollup digest pushed to Launchpad channel
                <div className="text-xs text-muted-foreground/80">
                  Done when digest includes rollout links
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-border/60 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Next actions
            </p>
            <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 rounded-full bg-primary/50" aria-hidden />
                Instrument usage telemetry in Linehaul service.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 rounded-full bg-primary/50" aria-hidden />
                Wire MCP bridge to feature-flag scheduler.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 size-1.5 rounded-full bg-primary/50" aria-hidden />
                Ship dashboard toast with acceptance proof.
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
