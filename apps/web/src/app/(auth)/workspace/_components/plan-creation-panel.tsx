"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import { createPlanForIdea } from "../actions";
import { getIdeaMetrics, IDEA_MAX_LENGTH, IDEA_MIN_LENGTH, validateIdea } from "../idea-validation";

const initialState = { message: "" };
const quickPrompts = [
  "Browser extension that summarizes any GitHub PR and flags risky files.",
  "Web app that turns CSVs into embeddable filterable tables with shareable views.",
  "AI tutor that generates minimal-pair pronunciation drills from any sentence.",
];

export function PlanCreationPanel() {
  const [idea, setIdea] = useState("");
  const [state, formAction, pending] = useActionState(createPlanForIdea, initialState);
  const ideaMetrics = getIdeaMetrics(idea);
  const localIdeaError = idea ? validateIdea(idea) : null;
  const isIdeaInvalid = Boolean(localIdeaError);
  const isSubmitDisabled = pending || isIdeaInvalid;

  return (
    <section className="relative overflow-hidden rounded-3xl border border-border/40 bg-card/80 shadow">
      <div className="pointer-events-none absolute -left-24 top-8 h-64 w-64 rounded-xl bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-10 bottom-0 h-56 w-56 rounded-xl bg-muted/40 blur-3xl" />

      <form action={formAction} className="relative flex flex-col gap-8 px-6 py-6 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 inline-flex items-center gap-1 rounded-xl border border-primary/60 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-wide text-primary">
            <Sparkles className="size-3" />
            Guided planning
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            What are we building next?
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            Describe the idea swirling in your head. Planteria scaffolds a structured workflow with
            outcomes, deliverables, and next actions so developers know the next move.
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
              placeholder="e.g. Platform for private communities with posts, chat, and member billing"
              className="h-32 w-full rounded-2xl border-0 bg-transparent px-6 py-5 text-base placeholder:text-muted-foreground/70 focus:outline-none focus-visible:ring-0"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              disabled={pending}
              minLength={IDEA_MIN_LENGTH}
              maxLength={IDEA_MAX_LENGTH}
              aria-invalid={isIdeaInvalid || undefined}
              required
            />
            <div className="flex flex-col gap-3 border-t border-border/60 py-2 px-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-1">
                <span>We'll turn this into a sequenced plan you can iterate on.</span>
                <span className="hidden sm:block">
                  {ideaMetrics.length}/{IDEA_MAX_LENGTH} chars • {ideaMetrics.wordCount} words
                </span>
                {localIdeaError ? (
                  <span className="text-destructive/80">{localIdeaError}</span>
                ) : (
                  <span className="sm:hidden">
                    {ideaMetrics.length}/{IDEA_MAX_LENGTH} chars • {ideaMetrics.wordCount} words
                  </span>
                )}
              </div>
              <Button type="submit" disabled={isSubmitDisabled} size="sm">
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
            <p className="text-sm font-medium text-destructive">{state.message}</p>
          ) : null}
        </div>
      </form>
    </section>
  );
}
