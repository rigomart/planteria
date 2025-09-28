import { useMutation } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Plus, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  return (
    <div className="flex flex-col gap-2">
      <ActionsList
        actions={actions}
        onUpdateAction={handleUpdateAction}
        onDeleteAction={handleDeleteAction}
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
  );
}

type ActionsListProps = {
  actions: FunctionReturnType<typeof api.actions.listByDeliverable>;
  onUpdateAction: (actionId: Id<"actions">, title: string) => Promise<void>;
  onDeleteAction: (actionId: Id<"actions">) => Promise<void>;
};

function ActionsList({
  actions,
  onUpdateAction,
  onDeleteAction,
}: ActionsListProps) {
  if (actions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No actions yet. Create a few to make this deliverable unambiguous.
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
              <StatusBadge status={action.status} />

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
