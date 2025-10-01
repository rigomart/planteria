"use client";

import { useMutation } from "convex/react";
import { Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";

import type { Id } from "@/convex/_generated/dataModel";

export type ListedPlan = {
  id: Id<"plans">;
  title: string;
  idea: string;
  summary: string;
  createdAt: number;
  updatedAt: number;
};

type PlanRowProps = {
  plan: ListedPlan;
};

export function PlanRow({ plan }: PlanRowProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deletePlan = useMutation(api.plans.mutations.deletePlan);

  const created = new Date(plan.createdAt);
  const updated = new Date(plan.updatedAt);
  const createdLabel = created.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
  const updatedLabel = updated.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deletePlan({ planId: plan.id });
      toast.success("Plan deleted");
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete plan", error);
      toast.error("Failed to delete plan. Try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="group flex items-start justify-between gap-4 rounded-2xl border border-border/60 bg-card/70 px-5 py-4 shadow-sm transition hover:-translate-y-1 hover:bg-card hover:shadow-md focus-within:ring-2 focus-within:ring-primary/60 focus-within:ring-offset-2 focus-within:ring-offset-background">
      <Link
        href={`/workspace/${plan.id}`}
        className="flex flex-col flex-1 items-start justify-between gap-4 focus:outline-none"
      >
        <div className="space-y-1">
          <h3 className="text-base font-semibold tracking-tight transition group-hover:text-primary">
            {plan.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{plan.summary || plan.idea}</p>
        </div>
        <div className="flex items-end gap-2 text-right text-[11px] text-muted-foreground/80">
          <span>Created {createdLabel}</span>
          <span>Updated {updatedLabel}</span>
        </div>
      </Link>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive"
            disabled={isDeleting}
          >
            <Trash2 className="size-4" />
            <span className="sr-only">Delete plan</span>
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this plan?</DialogTitle>
            <DialogDescription>
              This removes the plan and its outcomes, deliverables, and actions. You can’t undo
              this.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
