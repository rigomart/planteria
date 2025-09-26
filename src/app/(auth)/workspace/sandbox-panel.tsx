"use client";

import { useAction, useMutation } from "convex/react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

type DraftResult = Awaited<ReturnType<ReturnType<typeof useDraftPlan>>>;

type SandboxPanelProps = {
  onCompleted?: () => void;
};

export function SandboxPanel({ onCompleted }: SandboxPanelProps) {
  const draftPlan = useDraftPlan();
  const createPlan = useCreatePlan();
  const router = useRouter();

  const [idea, setIdea] = useState("");
  const [planResult, setPlanResult] = useState<DraftResult | null>(null);
  const [planError, setPlanError] = useState<string | null>(null);
  const [persistError, setPersistError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const planPreview = useMemo(
    () => (planResult ? JSON.stringify(planResult, null, 2) : null),
    [planResult],
  );

  const handleDraftPlan = async () => {
    setPlanError(null);
    setPersistError(null);

    const trimmedIdea = idea.trim();
    if (!trimmedIdea) {
      setPlanError("Provide an idea before drafting a plan.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await draftPlan({ idea: trimmedIdea });
      setPlanResult(result);

      try {
        const response = await createPlan({ plan: result });
        onCompleted?.();
        router.push(`/workspace/${response.planId}`);
      } catch (error) {
        setPersistError(getErrorMessage(error));
      }
    } catch (error) {
      setPlanError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="rounded-xl border p-6 shadow-sm">
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Idea input</h2>
          <p className="text-sm">
            Describe what you want to build. Keep it conversational.
          </p>
        </div>

        <textarea
          value={idea}
          onChange={(event) => setIdea(event.target.value)}
          placeholder="Example: A guided planner that helps indie founders turn fuzzy ideas into shippable slices in a week."
          className="mt-4 h-36 w-full resize-none rounded-lg border px-3 py-2 text-sm shadow-inner"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <Button
            variant="secondary"
            onClick={handleDraftPlan}
            disabled={isSubmitting}
          >
            {isSubmitting ? <LoadingSpinner label="Creating" /> : "Draft plan"}
          </Button>
        </div>

        {planError ? <ErrorMessage message={planError} /> : null}
        {persistError ? <ErrorMessage message={persistError} /> : null}
      </section>

      <section className="rounded-xl border p-6 shadow-sm">
        <h3 className="text-lg font-semibold">Plan draft preview</h3>
        {planPreview ? (
          <pre className="mt-4 max-h-80 overflow-y-auto whitespace-pre-wrap rounded border px-3 py-2 text-xs">
            {planPreview}
          </pre>
        ) : (
          <p className="mt-4 text-sm">
            Draft a plan to inspect generated outcomes, deliverables, and
            actions.
          </p>
        )}
      </section>
    </div>
  );
}

function useDraftPlan() {
  return useAction(api.llm.draftPlan);
}

function useCreatePlan() {
  return useMutation(api.plans.createPlan);
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

function ErrorMessage({ message }: { message: string }) {
  return <p className="mt-3 text-sm font-medium">Error: {message}</p>;
}
