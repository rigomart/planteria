"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { createPlanForIdea } from "../actions";

const initialState = { message: "" };
const quickPrompts = [
  "Automated onboarding checklist that adapts tasks to first-login signals",
  "Slack bot that triages bug reports into weekly solo sprint slices",
  "Self-updating changelog that turns merged PRs into customer updates",
];

export function PlanCreationPanel() {
  const [idea, setIdea] = useState("");
  const [state, formAction, pending] = useActionState(
    createPlanForIdea,
    initialState,
  );

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/80 shadow-xl">
      <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-full bg-muted/40 blur-3xl" />

      <form
        action={formAction}
        className="relative flex flex-col gap-8 px-6 py-6 sm:px-8"
      >
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-1 rounded-full border border-primary/60 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            <Sparkles className="size-3" />
            Guided planning
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What are we building next?
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Describe the idea swirling in your head. Planteria scaffolds a
            structured workflow with outcomes, deliverables, and next actions so
            builders know the next move.
          </p>
        </div>

        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
          <label htmlFor="idea" className="sr-only">
            Idea to turn into a plan
          </label>
          <div className="rounded-2xl border border-border/60 bg-background/90 shadow-lg">
            <textarea
              id="idea"
              name="idea"
              placeholder="Example: Turn my indie planner concept into a 4-week roadmap with weekly deliverables and launch checkpoints."
              className="h-32 w-full rounded-2xl border-0 bg-transparent px-6 py-5 text-base placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-0"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              disabled={pending}
              required
            />
            <div className="flex flex-col gap-3 border-t border-border/60 py-2 px-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>
                We'll turn this into a sequenced plan you can iterate on.
              </span>
              <Button type="submit" disabled={pending} size="sm">
                {pending ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <Sparkles className="size-3.5" />
                )}
                {pending ? "Generating..." : "Generate plan"}
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            {quickPrompts.map((prompt) => (
              <Button
                key={prompt}
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-full bg-muted/60 text-muted-foreground transition hover:bg-muted text-xs"
                onClick={() => setIdea(prompt)}
                disabled={pending}
              >
                {prompt}
              </Button>
            ))}
          </div>
          {state.message ? (
            <p className="text-sm font-medium text-destructive">
              {state.message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
