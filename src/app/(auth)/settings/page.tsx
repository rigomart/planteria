import { Suspense } from "react";

import { OpenAIKeyManager } from "./_components/openai-key-manager";

export default function SettingsPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Connect your own OpenAI account so plan generation and adjustments run
          under your usage.
        </p>
      </header>

      <Suspense fallback={<SettingsSkeleton />}>
        <OpenAIKeyManager />
      </Suspense>
    </div>
  );
}

function SettingsSkeleton() {
  return (
    <div className="rounded-2xl border border-border/50 bg-muted/10 p-6">
      <div className="space-y-4">
        <div className="h-4 w-48 rounded bg-muted" />
        <div className="h-12 w-full rounded bg-muted/60" />
        <div className="h-10 w-32 rounded bg-muted" />
      </div>
    </div>
  );
}
