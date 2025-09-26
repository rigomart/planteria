import type { StatusValue } from "./types";

export function ensureStatus(status: string | undefined): StatusValue {
  if (status === "todo" || status === "doing" || status === "done") {
    return status;
  }

  return "todo";
}

export function sortByOrder<T extends { order: number }>(items: T[]) {
  return [...items].sort((a, b) => a.order - b.order);
}
