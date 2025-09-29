"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

type SelectedNode =
  | { type: "outcome"; outcomeId: string }
  | { type: "deliverable"; outcomeId: string; deliverableId: string }
  | null;

type OutlineSelectionContextValue = {
  selectedNode: SelectedNode;
  selectOutcome: (outcomeId: string) => void;
  selectDeliverable: (outcomeId: string, deliverableId: string) => void;
  clearSelection: () => void;
};

const OutlineSelectionContext =
  createContext<OutlineSelectionContextValue | null>(null);

export function OutlineSelectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedNode, setSelectedNode] = useState<SelectedNode>(null);

  const selectOutcome = useCallback((outcomeId: string) => {
    setSelectedNode({ type: "outcome", outcomeId });
  }, []);

  const selectDeliverable = useCallback(
    (outcomeId: string, deliverableId: string) => {
      setSelectedNode({ type: "deliverable", outcomeId, deliverableId });
    },
    [],
  );

  const clearSelection = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const value = useMemo<OutlineSelectionContextValue>(
    () => ({ selectedNode, selectOutcome, selectDeliverable, clearSelection }),
    [selectedNode, selectOutcome, selectDeliverable, clearSelection],
  );

  return (
    <OutlineSelectionContext.Provider value={value}>
      {children}
    </OutlineSelectionContext.Provider>
  );
}

export function useOutlineSelection() {
  const context = useContext(OutlineSelectionContext);

  if (!context) {
    throw new Error(
      "useOutlineSelection must be used within an OutlineSelectionProvider",
    );
  }

  return context;
}
