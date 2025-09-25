"use client";

import { useAction } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

type DraftResult = Awaited<ReturnType<ReturnType<typeof useDraftPlan>>>;

export function SandboxPanel() {
  const draftPlanAction = useDraftPlan();

  const [idea, setIdea] = useState("");

  const [planResult, setPlanResult] = useState<DraftResult | null>(null);

  const [planLoading, setPlanLoading] = useState(false);

  const [planError, setPlanError] = useState<string | null>(null);

  const handleDraftPlan = async () => {
    setPlanError(null);

    if (!idea.trim()) {
      setPlanError("Provide an idea before drafting a plan.");
      return;
    }

    setPlanLoading(true);
    try {
      const result = await draftPlanAction({
        idea: idea.trim(),
      });
      setPlanResult(result);
    } catch (error) {
      setPlanError(getErrorMessage(error));
    } finally {
      setPlanLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-xl border  p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold ">Idea input</h2>
          <p className="text-sm ">
            Describe what you want to build. Keep it conversational.
          </p>
        </div>

        <textarea
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Example: A guided planner that helps indie founders turn fuzzy ideas into shippable slices in a week."
          className="mt-4 h-36 w-full resize-none rounded-lg border  px-3 py-2 text-sm  shadow-inner "
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={handleDraftPlan}
            disabled={planLoading}
          >
            {planLoading ? (
              <LoadingSpinner label="Drafting plan" />
            ) : (
              "Draft plan"
            )}
          </Button>
        </div>

        {planError ? (
          <p className="mt-1 text-sm text-red-500">{planError}</p>
        ) : null}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <ResultCard className="md:col-span-2" title="Plan draft result">
          {planResult ? (
            <PreBlock data={planResult} />
          ) : (
            <Placeholder message="Draft a plan to inspect generated plan slices." />
          )}
        </ResultCard>
      </section>
    </div>
  );
}

function useDraftPlan() {
  return useAction(api.llm.draftPlan);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Check server logs.";
}

function LoadingSpinner({ label }: { label: string }) {
  return (
    <span className="flex items-center gap-2 text-sm">
      <Loader2 className="size-4 animate-spin" aria-hidden />
      {label}
    </span>
  );
}

function Placeholder({ message }: { message: string }) {
  return <p className="text-sm text-slate-500">{message}</p>;
}

function PreBlock({ data }: { data: unknown }) {
  return (
    <pre className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-lg border p-3 text-xs ">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function ResultCard({
  title,
  subtitle,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-5 shadow-sm ${className ?? ""}`}>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">{title}</h3>
        {subtitle ? (
          <p className="text-xs uppercase tracking-wide">{subtitle}</p>
        ) : null}
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}
