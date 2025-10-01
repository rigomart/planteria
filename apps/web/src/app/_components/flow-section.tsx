import { Edit3, Globe, Lightbulb, ListTree, Share2, Sparkles } from "lucide-react";

const steps = [
  { n: 1, text: "Drop your idea", detail: "Type your concrete product mission", icon: Lightbulb },
  { n: 2, text: "We scan the web", detail: "Collect light evidence and terminology", icon: Globe },
  {
    n: 3,
    text: "Get the outline",
    detail: "Outcomes → Deliverables → Actions",
    icon: ListTree,
  },
  { n: 4, text: "Tune with AI", detail: "Fit your scope and timebox", icon: Sparkles },
  { n: 5, text: "Edit by hand", detail: "Rename, split/merge, reorder, or defer", icon: Edit3 },
  { n: 6, text: "Export or connect", detail: "Markdown export or MCP integration", icon: Share2 },
];

export function FlowSection() {
  return (
    <section className="rounded-3xl border border-border/70 bg-card/70 px-4 py-5">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">How it works</h2>
          <p className="mt-1 text-sm text-muted-foreground">From idea to plan in under a minute</p>
        </header>

        {/* Horizontal stepper (md+) */}
        <div className="relative hidden md:flex md:flex-col">
          <div className="absolute left-0 right-0 top-5 h-px bg-border/70" />
          <ol className="relative z-10 grid grid-cols-6 gap-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.n} className="flex min-w-0 flex-col items-center px-1 text-center">
                  <div className="flex size-8 items-center justify-center rounded-full border border-primary/40 bg-background text-[11px] font-semibold text-primary shadow-sm">
                    {s.n}
                  </div>
                  <span className="mt-2 inline-flex rounded-md bg-primary/10 p-1.5 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </span>
                  <p className="mt-1 line-clamp-2 text-xs font-semibold text-foreground">
                    {s.text}
                  </p>
                  <p className="mt-0.5 line-clamp-3 text-[11px] text-muted-foreground">
                    {s.detail}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Compact grid (mobile) */}
        <div className="md:hidden">
          <ol className="grid grid-cols-2 gap-3">
            {steps.map((s) => {
              const Icon = s.icon;
              return (
                <li key={s.n} className="rounded-xl border border-border/60 bg-background/80 p-3">
                  <div className="mb-1.5 flex items-center gap-1.5">
                    <div className="flex size-6 items-center justify-center rounded-full border border-primary/40 bg-background text-[10px] font-semibold text-primary">
                      {s.n}
                    </div>
                    <span className="inline-flex rounded-md bg-primary/10 p-1 text-primary">
                      <Icon className="size-3.5" aria-hidden />
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-foreground">{s.text}</p>
                  <p className="text-[11px] text-muted-foreground">{s.detail}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
