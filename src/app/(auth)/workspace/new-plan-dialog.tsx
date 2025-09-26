"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SandboxPanel } from "./sandbox-panel";

export function NewPlanDialog() {
  const [open, setOpen] = useState(false);

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
        <SandboxPanel onCompleted={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
