import { Suspense } from "react";
import { Header } from "../_components/header";
import { PlanCreationPanel } from "./_components/plan-creation-panel";
import { PlansList } from "./_components/plans-list";

export default function WorkspaceIndexPage() {
  return (
    <>
      <Header />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-6 overflow-y-auto">
        <PlanCreationPanel />

        <section className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent plans</h2>
          </div>

          <Suspense fallback={<PlansSkeleton />}>
            <PlansList />
          </Suspense>
        </section>
      </div>
    </>
  );
}

function PlansSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          className="h-20 rounded-2xl border border-border/50 bg-muted/20"
        >
          <span className="sr-only">Loading plan skeleton</span>
        </div>
      ))}
    </div>
  );
}
