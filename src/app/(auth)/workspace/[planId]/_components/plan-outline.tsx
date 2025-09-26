"use client";

import type { FunctionReturnType } from "convex/server";
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { type ElementType, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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

export type LoadedPlan = NonNullable<
  FunctionReturnType<typeof api.plans.getPlan>
>;

type Outcome = LoadedPlan["outcomes"][number];

type Deliverable = Outcome["deliverables"][number];

type ActionItem = Deliverable["actions"][number];

type PlanOutlineProps = {
  plan: LoadedPlan;
};

export function PlanOutline({ plan }: PlanOutlineProps) {
  const outcomes = useMemo(
    () => sortByOrder(plan.outcomes ?? []),
    [plan.outcomes],
  );

  return (
    <div className="flex flex-col gap-6">
      <OutlineToolbar />
      <div className="flex flex-col gap-6">
        {outcomes.map((outcome, outcomeIndex) => (
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
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Outcome {index + 1}
            </span>
            <StatusBadge status={ensureStatus(outcome.status)} />
          </div>
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
  const [showActions, setShowActions] = useState(false);
  const actions = useMemo(
    () => sortByOrder(deliverable.actions ?? []),
    [deliverable.actions],
  );
  const completedActions = actions.filter(
    (item) => ensureStatus(item.status) === "done",
  ).length;
  const totalActions = actions.length;
  const ToggleIcon = showActions ? ChevronDown : ChevronRight;

  return (
    <div className="rounded-xl border border-border/60 bg-muted/10">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-muted-foreground">
              Deliverable {index + 1}
            </span>
            <StatusBadge status={ensureStatus(deliverable.status)} />
          </div>
          <h3 className="text-base font-medium leading-tight">
            {deliverable.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            Done when{" "}
            <span className="text-foreground/90">{deliverable.doneWhen}</span>
          </p>
          {deliverable.notes ? (
            <Alert>
              <AlertTitle>Note</AlertTitle>
              <AlertDescription>{deliverable.notes}</AlertDescription>
            </Alert>
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
        <Collapsible open={showActions} onOpenChange={setShowActions}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="inline-flex items-center gap-2"
              >
                <ToggleIcon className="size-4" />
                {showActions
                  ? "Hide actions"
                  : `Show actions (${totalActions})`}
              </Button>
            </CollapsibleTrigger>
            {totalActions > 0 ? (
              <span className="text-xs text-muted-foreground">
                {completedActions}/{totalActions} done
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">
                No actions yet
              </span>
            )}
          </div>
          <CollapsibleContent>
            <div className="mt-3 flex flex-col gap-2">
              {totalActions > 0 ? (
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
                  No actions yet. Create a few to make this deliverable
                  unambiguous.
                </p>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
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
        <StatusBadge
          status={ensureStatus(action.status)}
          className="px-2 py-0.5 text-[11px]"
        />
        <div className="flex flex-col">
          <span className="font-medium leading-tight">{action.title}</span>
          <span className="text-xs text-muted-foreground">
            Action {index + 1}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        <NodeActionButton
          icon={CheckCircle2}
          label="Toggle status"
          onClick={() =>
            console.log("[UI] toggle action status", action.id, deliverableId)
          }
        />
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
  className?: string;
};

function StatusBadge({ status, className }: StatusBadgeProps) {
  const style = STATUS_STYLES[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium",
        style.badgeClass,
        className,
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
