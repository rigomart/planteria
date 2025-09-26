import { cn } from "@/lib/utils";
import { STATUS_STYLES } from "./constants";
import type { StatusValue } from "./types";

type StatusBadgeProps = {
  status: StatusValue;
  className?: string;
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
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
