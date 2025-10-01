import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { MoreHorizontal, Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { EditableField } from "./editable-field";
import { StatusBadge } from "./status-badge";

type Action = FunctionReturnType<typeof api.actions.listByDeliverable>[number];

type PlanActionsProps = {
  actions: FunctionReturnType<typeof api.actions.listByDeliverable>;
  deliverableId: Id<"deliverables">;
};

export function PlanActions({ actions, deliverableId }: PlanActionsProps) {
  const addAction = useMutation(api.actions.addAction).withOptimisticUpdate((localStore, args) => {
    const currentActions = localStore.getQuery(api.actions.listByDeliverable, {
      deliverableId: args.deliverableId,
    });
    if (currentActions !== undefined) {
      const maxOrder = currentActions.reduce((max, action) => Math.max(max, action.order), -1);
      const newAction: Action = {
        id: `temp-${Date.now()}` as Id<"actions">,
        title: args.title,
        status: "todo",
        order: maxOrder + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      localStore.setQuery(api.actions.listByDeliverable, { deliverableId: args.deliverableId }, [
        ...currentActions,
        newAction,
      ]);
    }
  });

  const updateAction = useMutation(api.actions.updateAction).withOptimisticUpdate(
    (localStore, args) => {
      const currentActions = localStore.getQuery(api.actions.listByDeliverable, {
        deliverableId,
      });
      if (currentActions !== undefined) {
        const updatedActions = currentActions.map((action) =>
          action.id === args.actionId
            ? { ...action, title: args.title, updatedAt: Date.now() }
            : action,
        );
        localStore.setQuery(api.actions.listByDeliverable, { deliverableId }, updatedActions);
      }
    },
  );

  const deleteAction = useMutation(api.actions.deleteAction).withOptimisticUpdate(
    (localStore, args) => {
      const currentActions = localStore.getQuery(api.actions.listByDeliverable, {
        deliverableId,
      });
      if (currentActions !== undefined) {
        const filteredActions = currentActions.filter((action) => action.id !== args.actionId);
        const reorderedActions = filteredActions.map((action, index: number) => ({
          ...action,
          order: index,
        }));
        localStore.setQuery(api.actions.listByDeliverable, { deliverableId }, reorderedActions);
      }
    },
  );

  const updateActionStatus = useMutation(api.actions.updateActionStatus).withOptimisticUpdate(
    (localStore, args) => {
      const currentActions = localStore.getQuery(api.actions.listByDeliverable, {
        deliverableId,
      });

      if (currentActions !== undefined) {
        const updatedActions = currentActions.map((action) =>
          action.id === args.actionId
            ? { ...action, status: args.status, updatedAt: Date.now() }
            : action,
        );

        localStore.setQuery(api.actions.listByDeliverable, { deliverableId }, updatedActions);
      }
    },
  );

  const handleAddAction = async () => {
    try {
      await addAction({
        deliverableId,
        title: "New action",
      });
    } catch (error) {
      console.error("Failed to add action:", error);
    }
  };

  const handleUpdateAction = async (actionId: Id<"actions">, title: string) => {
    try {
      await updateAction({
        actionId,
        title,
      });
    } catch (error) {
      console.error("Failed to update action:", error);
    }
  };

  const handleDeleteAction = async (actionId: Id<"actions">) => {
    try {
      await deleteAction({
        actionId,
      });
    } catch (error) {
      console.error("Failed to delete action:", error);
    }
  };

  const handleUpdateStatus = async (actionId: Id<"actions">, status: Action["status"]) => {
    try {
      await updateActionStatus({
        actionId,
        status,
      });
    } catch (error) {
      console.error("Failed to update action status:", error);
    }
  };

  const totalActions = actions.length;
  const completedActions = actions.reduce(
    (count, action) => (action.status === "done" ? count + 1 : count),
    0,
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Actions</span>
          {totalActions > 0 && (
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
              {completedActions}/{totalActions}
            </span>
          )}
        </div>
      </div>

      {actions.length === 0 ? (
        <div className="rounded-lg bg-muted/20 py-4 text-center">
          <p className="text-xs text-muted-foreground">No actions yet</p>
        </div>
      ) : (
        <ul className="space-y-1.5">
          {actions.map((action) => (
            <li
              key={action.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors",
                "border-border/30 bg-background/40 hover:bg-muted/20",
              )}
            >
              <StatusBadge
                status={action.status}
                onChange={(nextStatus) => handleUpdateStatus(action.id, nextStatus)}
                className="text-[10px] px-2 py-0.5"
              />

              <EditableField
                value={action.title ?? ""}
                onSave={(nextValue) => handleUpdateAction(action.id, nextValue)}
                placeholder="Action title"
                displayClassName="text-xs text-foreground flex-1"
                editorClassName="text-xs flex-1"
              />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-6 flex-shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => handleDeleteAction(action.id)}
                  >
                    <Trash className="mr-2 size-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </li>
          ))}
        </ul>
      )}

      <Button type="button" variant="ghost" size="sm" onClick={handleAddAction} className="text-xs">
        <Plus className="size-3.5" /> Add action
      </Button>
    </div>
  );
}
