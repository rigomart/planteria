import type { Id } from "@/convex/_generated/dataModel";
import { InlineEditableField } from "./inline-editable-field";
import { StatusBadge } from "./status-badge";
import type { ActionItem } from "./types";

type ActionRowProps = {
  action: ActionItem;
  deliverableId: Id<"deliverables">;
};

export function ActionRow({ action, deliverableId }: ActionRowProps) {
  return (
    <li className="group flex items-center justify-between rounded-lg border border-transparent bg-background/40 px-3 py-2 text-sm transition hover:border-border/60 hover:bg-muted/20">
      <div className="flex items-center gap-3 justify-between w-full">
        <InlineEditableField
          value={action.title ?? ""}
          onSave={(nextValue) =>
            console.log("[UI] save action title", {
              deliverableId,
              actionId: action.id,
              value: nextValue,
            })
          }
          placeholder="Add a brief action title"
          displayClassName="text-sm text-muted-foreground"
          editorClassName="text-sm"
        />

        <StatusBadge status={action.status} />
      </div>
    </li>
  );
}
