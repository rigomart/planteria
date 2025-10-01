import { FileDown, Globe, ListTree, Pencil, Plug, Sparkles } from "lucide-react";

const features = [
  {
    title: "Search & scrape for context",
    description: "Scan the web around your idea to surface terminology, patterns, and caveats.",
    icon: Globe,
    gradient: "from-blue-500/20 to-cyan-500/20",
  },
  {
    title: "Generate a structured outline",
    description: "Get Outcomes → Deliverables → Actions—clear and demo-ready.",
    icon: ListTree,
    gradient: "from-purple-500/20 to-pink-500/20",
  },
  {
    title: "AI full‑plan adjustments",
    description: "Tighten scope, rebalance phases, and sharpen phrasing across the plan.",
    icon: Sparkles,
    gradient: "from-amber-500/20 to-orange-500/20",
  },
  {
    title: "Manual edit of the entire plan",
    description: "Inline edits, reordering, split/merge, move/defer—with guardrails.",
    icon: Pencil,
    gradient: "from-green-500/20 to-emerald-500/20",
  },
  {
    title: "Export to Markdown",
    description: "One click to share a clean, implementation‑agnostic brief.",
    icon: FileDown,
    gradient: "from-indigo-500/20 to-purple-500/20",
  },
  {
    title: "MCP access",
    description: "Let your favorite AI tool read plans or fetch pending tasks via read‑only MCP.",
    icon: Plug,
    gradient: "from-rose-500/20 to-pink-500/20",
  },
];

export function FeaturesSection() {
  return (
    <section className="px-4 py-5">
      <div className="mx-auto max-w-6xl">
        <header className="mb-4 text-center">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Everything you need to ship
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            From fuzzy idea to structured plan in minutes
          </p>
        </header>

        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((item) => {
            const Icon = item.icon;
            return (
              <li
                key={item.title}
                className="group relative overflow-hidden rounded-2xl border border-border/60 bg-background/70 p-4"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 transition-opacity`}
                />
                <div className="relative">
                  <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mb-1.5 font-semibold text-foreground">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
