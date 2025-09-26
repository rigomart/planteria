"use client";

import { Loader2 } from "lucide-react";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createPlanForIdea } from "../actions";

const initialState = { message: "" };

export function SandboxPanel() {
  const [state, formAction, pending] = useActionState(
    createPlanForIdea,
    initialState,
  );

  return (
    <div className="flex flex-col gap-6">
      <form className="rounded-xl border p-6 shadow-sm" action={formAction}>
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Idea input</h2>
          <p className="text-sm">
            Describe what you want to build. Keep it conversational.
          </p>
        </div>

        <textarea
          id="idea"
          name="idea"
          placeholder="Example: A guided planner that helps indie founders turn fuzzy ideas into shippable slices in a week."
          className="mt-4 h-36 w-full resize-none rounded-lg border px-3 py-2 text-sm shadow-inner"
          required
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <Button variant="secondary" type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Create plan"
            )}
          </Button>
        </div>

        {state.message ? <ErrorMessage message={state.message} /> : null}
      </form>
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return <p className="mt-3 text-sm font-medium">Error: {message}</p>;
}
