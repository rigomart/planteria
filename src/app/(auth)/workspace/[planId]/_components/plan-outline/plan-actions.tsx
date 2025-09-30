import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleChevronTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { EditableField } from "./editable-field";
import { StatusBadge } from "./status-badge";

type Action = FunctionReturnType<typeof api.actions.listByDeliverable>[number];

type PlanActionsProps = {
  actions: FunctionReturnType<typeof api.actions.listByDeliverable>;
  deliverableId: Id<"deliverables">;
};

export function PlanActions({ actions, deliverableId }: PlanActionsProps) {
  const addAction = useMutation(api.actions.addAction).withOptimisticUpdate(
    (localStore, args) => {
      // Optimistically update the listByDeliverable query
      const currentActions = localStore.getQuery(
        api.actions.listByDeliverable,
        {
          deliverableId: args.deliverableId,
        },
      );
      if (currentActions !== undefined) {
        const maxOrder = currentActions.reduce(
          (max, action) => Math.max(max, action.order),
          -1,
        );
        const newAction: Action = {
          id: `temp-${Date.now()}` as Id<"actions">,
          title: args.title,
          status: "todo",
          order: maxOrder + 1,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        localStore.setQuery(
          api.actions.listByDeliverable,
          { deliverableId: args.deliverableId },
          [...currentActions, newAction],
        );
      }
    },
  );

  const updateAction = useMutation(
    api.actions.updateAction,
  ).withOptimisticUpdate((localStore, args) => {
    // Optimistically update the listByDeliverable query
    const currentActions = localStore.getQuery(api.actions.listByDeliverable, {
      deliverableId,
    });
    if (currentActions !== undefined) {
      const updatedActions = currentActions.map((action) =>
        action.id === args.actionId
          ? { ...action, title: args.title, updatedAt: Date.now() }
          : action,
      );
      localStore.setQuery(
        api.actions.listByDeliverable,
        { deliverableId },
        updatedActions,
      );
    }
  });

  const deleteAction = useMutation(
    api.actions.deleteAction,
  ).withOptimisticUpdate((localStore, args) => {
    // Optimistically update the listByDeliverable query
    const currentActions = localStore.getQuery(api.actions.listByDeliverable, {
      deliverableId,
    });
    if (currentActions !== undefined) {
      const filteredActions = currentActions.filter(
        (action) => action.id !== args.actionId,
      );
      // Reorder remaining actions
      const reorderedActions = filteredActions.map((action, index: number) => ({
        ...action,
        order: index,
      }));
      localStore.setQuery(
        api.actions.listByDeliverable,
        { deliverableId },
        reorderedActions,
      );
    }
  });

  const updateActionStatus = useMutation(
    api.actions.updateActionStatus,
  ).withOptimisticUpdate((localStore, args) => {
    const currentActions = localStore.getQuery(api.actions.listByDeliverable, {
      deliverableId,
    });

    if (currentActions !== undefined) {
      const updatedActions = currentActions.map((action) =>
        action.id === args.actionId
          ? { ...action, status: args.status, updatedAt: Date.now() }
          : action,
      );

      localStore.setQuery(
        api.actions.listByDeliverable,
        { deliverableId },
        updatedActions,
      );
    }
  });

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

  const handleUpdateStatus = async (
    actionId: Id<"actions">,
    status: Action["status"],
  ) => {
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
    <Collapsible className="border rounded-xl">
      <div className="flex items-center p-1 gap-1">
        <CollapsibleChevronTrigger aria-label="Toggle actions" />
        <div className="flex w-full items-center justify-between gap-2 text-sm font-medium text-muted-foreground">
          <span>Actions</span>
          {totalActions > 0 ? (
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
              {completedActions}/{totalActions} done
            </span>
          ) : (
            <span className="text-xs text-muted-foreground/80">None yet</span>
          )}
        </div>
      </div>
      <CollapsibleContent>
        <div className="flex flex-col gap-3 p-3">
          <ActionsList
            actions={actions}
            onUpdateAction={handleUpdateAction}
            onDeleteAction={handleDeleteAction}
            onUpdateStatus={handleUpdateStatus}
          />
          <Button
            type="button"
            variant="dashed"
            size="sm"
            onClick={handleAddAction}
            className="self-start"
          >
            <Plus className="mr-2 size-4" /> Add action
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

type ActionsListProps = {
  actions: FunctionReturnType<typeof api.actions.listByDeliverable>;
  onUpdateAction: (actionId: Id<"actions">, title: string) => Promise<void>;
  onDeleteAction: (actionId: Id<"actions">) => Promise<void>;
  onUpdateStatus: (
    actionId: Id<"actions">,
    status: Action["status"],
  ) => Promise<void>;
};

function ActionsList({
  actions,
  onUpdateAction,
  onDeleteAction,
  onUpdateStatus,
}: ActionsListProps) {
  if (actions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No actions listed yet. Add steps if this deliverable would benefit from
        extra clarity.
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {actions.map((action) => (
        <li
          key={action.id}
          className="group flex items-center justify-between rounded-lg border border-transparent bg-background/40 px-3 py-2 text-sm transition hover:border-border/60 hover:bg-muted/20"
        >
          <div className="flex items-center gap-3 justify-between w-full">
            <EditableField
              value={action.title ?? ""}
              onSave={(nextValue) => onUpdateAction(action.id, nextValue)}
              placeholder="Add a brief action title"
              displayClassName="text-xs text-muted-foreground"
              editorClassName="text-xs"
            />

            <div className="flex items-center gap-1">
              <StatusBadge
                status={action.status}
                onChange={(nextStatus) => onUpdateStatus(action.id, nextStatus)}
              />

              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteAction(action.id)}
              >
                <Trash className="size-4" />
              </Button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
