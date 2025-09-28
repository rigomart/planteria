import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";

export type StatusStyle = {
  label: string;
  dotClass: string;
  badgeClass: string;
};

export type LoadedPlan = NonNullable<
  FunctionReturnType<typeof api.plans.queries.getPlan>
>;

export type Outcome = LoadedPlan["outcomes"][number];

export type Deliverable = Outcome["deliverables"][number];

export type ActionItem = Deliverable["actions"][number];

// Define status values explicitly since the old getPlan query is deprecated
export type StatusValue = "todo" | "doing" | "done";
