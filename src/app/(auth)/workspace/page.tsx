import { SandboxPanel } from "./sandbox-panel";

export default function WorkspacePage() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">LLM sandbox</h1>
        <p className="text-sm text-slate-500">
          Iterate on idea clarifications and plan drafts while tuning prompts.
        </p>
      </div>
      <SandboxPanel />
    </div>
  );
}
