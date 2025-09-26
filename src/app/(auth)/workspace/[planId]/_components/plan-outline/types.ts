import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export type StatusValue = "todo" | "doing" | "done";

export type StatusStyle = {
  label: string;
  dotClass: string;
  badgeClass: string;
};

export type LoadedPlan = NonNullable<
  FunctionReturnType<typeof api.plans.getPlan>
>;

export type Outcome = LoadedPlan["outcomes"][number];

export type Deliverable = Outcome["deliverables"][number];

export type ActionItem = Deliverable["actions"][number];

export type PlanOutlineProps = {
  plan: LoadedPlan;
};

export type OutcomeSectionProps = {
  planId: Id<"plans">;
  outcome: Outcome;
  index: number;
};

export type DeliverableItemProps = {
  deliverable: Deliverable;
  outcomeId: Id<"outcomes">;
  index: number;
};

export type ActionRowProps = {
  action: ActionItem;
  deliverableId: Id<"deliverables">;
  index: number;
};

export type NodeActionGroupProps = {
  onEdit: () => void;
  onStatus: () => void;
  onAiAdjust: () => void;
  onReorder: () => void;
  onDelete: () => void;
};

export type NodeActionButtonProps = {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
};

export type StatusBadgeProps = {
  status: StatusValue;
  className?: string;
};
