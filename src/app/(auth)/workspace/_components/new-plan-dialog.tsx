"use client";

import { Loader2 } from "lucide-react";
import { useActionState, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createPlanForIdea } from "../actions";

const initialState = { message: "" };

export function NewPlanDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(
    createPlanForIdea,
    initialState,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>New plan</Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto" showCloseButton>
        <DialogHeader>
          <DialogTitle>Generate a new plan</DialogTitle>
          <DialogDescription>
            Describe your idea and let Planteria draft outcomes, deliverables,
            and actions. You can refine everything after creation.
          </DialogDescription>
        </DialogHeader>

        <form className="flex flex-col gap-4" action={formAction}>
          <textarea
            id="idea"
            name="idea"
            placeholder="Example: A guided planner that helps indie founders turn fuzzy ideas into shippable slices in a week."
            className="mt-4 h-36 w-full resize-none rounded-lg border px-3 py-2 text-sm shadow-inner"
            required
          />

          <Button type="submit" disabled={pending}>
            {pending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Create plan"
            )}
          </Button>

          {state.message ? (
            <p className="mt-3 text-sm font-medium">Error: {state.message}</p>
          ) : null}
        </form>
      </DialogContent>
    </Dialog>
  );
}
