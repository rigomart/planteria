import type { StatusValue } from "./types";

export type StatusStyle = {
  label: string;
  dotClass: string;
  badgeClass: string;
};

export const STATUS_STYLES: Record<StatusValue, StatusStyle> = {
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
