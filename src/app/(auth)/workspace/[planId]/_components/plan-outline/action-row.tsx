import { CheckCircle2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Id } from "@/convex/_generated/dataModel";
import { StatusBadge } from "./status-badge";
import type { ActionItem } from "./types";
import { ensureStatus } from "./utils";

type ActionRowProps = {
  action: ActionItem;
  deliverableId: Id<"deliverables">;
};

export function ActionRow({ action, deliverableId }: ActionRowProps) {
  return (
    <li className="group flex items-center justify-between rounded-lg border border-transparent bg-background/40 px-3 py-2 text-sm transition hover:border-border/60 hover:bg-muted/20">
      <div className="flex items-center gap-3">
        <StatusBadge
          status={ensureStatus(action.status)}
          className="px-2 py-0.5 text-[11px]"
        />

        <span className="leading-tight">{action.title}</span>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <Button variant="ghost" size="icon">
          <Pencil className="size-4" />
        </Button>
        <Button variant="ghost" size="icon">
          <CheckCircle2 className="size-4" />
        </Button>
      </div>
    </li>
  );
}
