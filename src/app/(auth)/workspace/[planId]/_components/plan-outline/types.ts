import type { FunctionReturnType } from "convex/server";
import type { api } from "@/convex/_generated/api";

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

export type StatusValue = LoadedPlan["outcomes"][number]["status"];
