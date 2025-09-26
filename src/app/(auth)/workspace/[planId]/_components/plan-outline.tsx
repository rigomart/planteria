"use client";

import type { FunctionReturnType } from "convex/server";
import {
  ArrowUpDown,
  CheckCircle2,
  Ellipsis,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { type ElementType, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

type StatusValue = "todo" | "doing" | "done";

type StatusStyle = {
  label: string;
  dotClass: string;
  badgeClass: string;
};

const STATUS_STYLES: Record<StatusValue, StatusStyle> = {
  todo: {
    label: "Todo",
    dotClass: "bg-muted-foreground/50",
    badgeClass: "bg-muted/40 text-muted-foreground border border-border/40",
  },
  doing: {
    label: "Doing",
    dotClass: "bg-chart-2",
    badgeClass: "bg-chart-2/20 text-chart-2 border border-chart-2/40",
  },
  done: {
    label: "Done",
    dotClass: "bg-chart-3",
    badgeClass: "bg-chart-3/20 text-chart-3 border border-chart-3/40",
  },
};

type Plan = FunctionReturnType<typeof api.plans.getPlan>;

type Outcome = NonNullable<Plan>["outcomes"][number];

type Deliverable = Outcome["deliverables"][number];

type ActionItem = Deliverable["actions"][number];

type PlanOutlineProps = {
  plan: FunctionReturnType<typeof api.plans.getPlan>;
};

export function PlanOutline({ plan }: PlanOutlineProps) {
  if (!plan) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <OutlineToolbar />
      <div className="flex flex-col gap-6">
        {plan.outcomes.map((outcome, outcomeIndex) => (
          <OutcomeSection
            key={outcome.id}
            planId={plan.id}
            outcome={outcome}
            index={outcomeIndex}
          />
        ))}
        <Button
          type="button"
          variant="ghost"
          className="self-start"
          onClick={() => console.log("[UI] add outcome", plan.id)}
        >
          <Plus className="mr-2 size-4" /> Add outcome
        </Button>
      </div>
    </div>
  );
}

function OutlineToolbar() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex items-center gap-2">
        <Button type="button" size="sm" variant="default">
          Outline
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled>
          Board
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled>
          Split
        </Button>
      </nav>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => console.log("[UI] refine plan with AI")}
        >
          <Sparkles className="mr-2 size-4" /> AI adjust plan
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => console.log("[UI] add outcome", "toolbar")}
        >
          <Plus className="mr-2 size-4" /> Add outcome
        </Button>
      </div>
    </div>
  );
}

type OutcomeSectionProps = {
  planId: Id<"plans">;
  outcome: Outcome;
  index: number;
};

function OutcomeSection({ planId, outcome, index }: OutcomeSectionProps) {
  const deliverables = useMemo(
    () => sortByOrder(outcome.deliverables ?? []),
    [outcome.deliverables],
  );

  return (
    <Card>
      <CardHeader className="gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            Outcome {index + 1}
          </span>
          <CardTitle className="text-xl font-semibold">
            {outcome.title}
          </CardTitle>
          {outcome.summary ? (
            <CardDescription>{outcome.summary}</CardDescription>
          ) : null}
        </div>
        <CardAction>
          <NodeActionGroup
            onEdit={() => console.log("[UI] edit outcome", outcome.id)}
            onStatus={() => console.log("[UI] status outcome", outcome.id)}
            onAiAdjust={() => console.log("[UI] AI adjust outcome", outcome.id)}
            onReorder={() => console.log("[UI] reorder outcome", outcome.id)}
            onDelete={() =>
              console.log("[UI] delete outcome", outcome.id, "plan", planId)
            }
          />
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {deliverables.map((deliverable, deliverableIndex) => (
            <DeliverableItem
              key={deliverable.id}
              outcomeId={outcome.id}
              deliverable={deliverable}
              index={deliverableIndex}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="self-start"
          onClick={() =>
            console.log("[UI] add deliverable", outcome.id, "plan", planId)
          }
        >
          <Plus className="mr-2 size-4" /> Add deliverable
        </Button>
      </CardContent>
    </Card>
  );
}

type DeliverableItemProps = {
  deliverable: Deliverable;
  outcomeId: Id<"outcomes">;
  index: number;
};

function DeliverableItem({
  deliverable,
  outcomeId,
  index,
}: DeliverableItemProps) {
  const [showStatus, setShowStatus] = useState(false);
  const actions = useMemo(
    () => sortByOrder(deliverable.actions ?? []),
    [deliverable.actions],
  );

  return (
    <div className="rounded-xl border border-border/60 bg-muted/10">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Deliverable {index + 1}
            </span>
          </div>
          <h3 className="text-base font-medium leading-tight">
            {deliverable.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            Done when {deliverable.doneWhen}
          </p>
          {deliverable.notes ? (
            <p className="text-xs text-muted-foreground/80">
              Insight: {deliverable.notes}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-1">
          <NodeActionButton
            icon={Pencil}
            label="Edit deliverable"
            onClick={() =>
              console.log("[UI] edit deliverable", deliverable.id, outcomeId)
            }
          />
          <NodeActionButton
            icon={CheckCircle2}
            label="Update status"
            onClick={() =>
              console.log("[UI] status deliverable", deliverable.id, outcomeId)
            }
          />
          <NodeActionButton
            icon={Sparkles}
            label="AI adjust"
            onClick={() =>
              console.log(
                "[UI] AI adjust deliverable",
                deliverable.id,
                outcomeId,
              )
            }
          />
          <NodeActionButton
            icon={ArrowUpDown}
            label="Reorder"
            onClick={() =>
              console.log("[UI] reorder deliverable", deliverable.id, outcomeId)
            }
          />
          <NodeActionButton
            icon={Trash2}
            label="Delete"
            onClick={() =>
              console.log("[UI] delete deliverable", deliverable.id, outcomeId)
            }
          />
        </div>
      </div>
      <div className="space-y-4 border-t border-border/40 p-4">
        <div className="flex flex-col gap-2">
          {actions.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {actions.map((action, actionIndex) => (
                <ActionRow
                  key={action.id}
                  action={action}
                  deliverableId={deliverable.id}
                  index={actionIndex}
                />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No actions yet. Create a few to make this deliverable unambiguous.
            </p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() =>
            console.log("[UI] add action", deliverable.id, outcomeId)
          }
        >
          <Plus className="mr-2 size-4" /> Add action
        </Button>
        <Collapsible open={showStatus} onOpenChange={setShowStatus}>
          <CollapsibleTrigger asChild>
            <Button type="button" variant="outline" size="sm" className="mt-2">
              <Ellipsis className="mr-2 size-4" />
              {showStatus ? "Hide" : "Show"} status & notes
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent asChild>
            <div className="mt-3 rounded-lg border border-border/40 bg-background/60 p-4 text-sm">
              <StatusBadge status={ensureStatus(deliverable.status)} />
              <dl className="mt-3 space-y-2 text-xs text-muted-foreground">
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="uppercase tracking-wide">Status</dt>
                  <dd>
                    {STATUS_STYLES[ensureStatus(deliverable.status)].label}
                  </dd>
                </div>
                <div className="grid grid-cols-[120px_1fr] gap-2">
                  <dt className="uppercase tracking-wide">Order</dt>
                  <dd>{deliverable.order + 1}</dd>
                </div>
              </dl>
              {actions.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Action statuses
                  </p>
                  <ul className="space-y-1 text-xs">
                    {actions.map((action) => (
                      <li
                        key={action.id}
                        className="flex items-center justify-between gap-3 rounded-md border border-border/30 bg-muted/10 px-3 py-2"
                      >
                        <span className="line-clamp-1 text-muted-foreground">
                          {action.title}
                        </span>
                        <StatusBadge status={ensureStatus(action.status)} />
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}

type ActionRowProps = {
  action: ActionItem;
  deliverableId: Id<"deliverables">;
  index: number;
};

function ActionRow({ action, deliverableId, index }: ActionRowProps) {
  return (
    <li className="group flex items-center justify-between rounded-lg border border-transparent bg-background/40 px-3 py-2 text-sm transition hover:border-border/60 hover:bg-muted/20">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() =>
            console.log("[UI] toggle action status", action.id, deliverableId)
          }
          className="grid size-6 place-items-center rounded-full border border-border/50 text-muted-foreground transition hover:text-foreground"
        >
          <CheckCircle2 className="size-3.5" />
        </button>
        <div className="flex flex-col">
          <span className="font-medium leading-tight">{action.title}</span>
          <span className="text-xs text-muted-foreground">
            Action {index + 1}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <NodeActionButton
          icon={Pencil}
          label="Edit action"
          onClick={() =>
            console.log("[UI] edit action", action.id, deliverableId)
          }
        />
        <NodeActionButton
          icon={ArrowUpDown}
          label="Reorder"
          onClick={() =>
            console.log("[UI] reorder action", action.id, deliverableId)
          }
        />
        <NodeActionButton
          icon={Trash2}
          label="Delete"
          onClick={() =>
            console.log("[UI] delete action", action.id, deliverableId)
          }
        />
      </div>
    </li>
  );
}

type NodeActionGroupProps = {
  onEdit: () => void;
  onStatus: () => void;
  onAiAdjust: () => void;
  onReorder: () => void;
  onDelete: () => void;
};

function NodeActionGroup({
  onEdit,
  onStatus,
  onAiAdjust,
  onReorder,
  onDelete,
}: NodeActionGroupProps) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      <NodeActionButton icon={Pencil} label="Edit" onClick={onEdit} />
      <NodeActionButton icon={CheckCircle2} label="Status" onClick={onStatus} />
      <NodeActionButton
        icon={Sparkles}
        label="AI adjust"
        onClick={onAiAdjust}
      />
      <NodeActionButton
        icon={ArrowUpDown}
        label="Reorder"
        onClick={onReorder}
      />
      <NodeActionButton icon={Trash2} label="Delete" onClick={onDelete} />
    </div>
  );
}

type NodeActionButtonProps = {
  icon: ElementType;
  label: string;
  onClick: () => void;
};

function NodeActionButton({
  icon: Icon,
  label,
  onClick,
}: NodeActionButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className="size-8"
      onClick={onClick}
      aria-label={label}
    >
      <Icon className="size-4" />
    </Button>
  );
}

type StatusBadgeProps = {
  status: StatusValue;
};

function StatusBadge({ status }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        style.badgeClass,
      )}
    >
      <span className={cn("size-2.5 rounded-full", style.dotClass)} />
      {style.label}
    </span>
  );
}

function ensureStatus(status: string | undefined): StatusValue {
  if (status === "todo" || status === "doing" || status === "done") {
    return status;
  }

  return "todo";
}

function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}
