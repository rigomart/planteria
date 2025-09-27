import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

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

export type StatusValue = LoadedPlan["outcomes"][number]["status"];
