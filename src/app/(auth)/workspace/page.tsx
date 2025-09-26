import { Suspense } from "react";
import { NewPlanDialog } from "./_components/new-plan-dialog";
import { PlansList } from "./_components/plans-list";

export default function WorkspaceIndexPage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Workspace</h1>
          <p className="text-sm">
            Choose a plan or start a new one to break your idea into outcomes,
            deliverables, and actions.
          </p>
        </div>
        <NewPlanDialog />
      </header>

      <Suspense fallback={<PlansSkeleton />}>
        <PlansList />
      </Suspense>
    </div>
  );
}

function PlansSkeleton() {
  return (
    <div className="space-y-3 rounded-xl border p-6 shadow-sm">
      <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      <div className="h-4 w-1/4 animate-pulse rounded bg-muted" />
    </div>
  );
}
