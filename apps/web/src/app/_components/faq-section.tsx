import { HelpCircle } from "lucide-react";
import {
  Collapsible,
  CollapsibleChevronTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";

const faqs = [
  {
    q: "Does Planteria generate specs or code?",
    a: "No—by design. We're focused on planning: structure, scope, and sequence that lead to a demoable MVP. Think of us as the layer before implementation.",
  },
  {
    q: "What if I want absolute control over changes?",
    a: "You can edit everything manually. Our guardrails stop low‑quality changes from landing, but you're always in the driver's seat.",
  },
  {
    q: "Can I plug this into my AI assistant?",
    a: "Yes. Use MCP to read plans or fetch pending tasks from your agent of choice. It's read‑only, so your assistant can stay informed without making unwanted changes.",
  },
  {
    q: "How is this different from a task tracker?",
    a: "Task trackers organize existing work. Planteria shapes fuzzy ideas into structured plans before you ever open a tracker. We're planning‑first, not tracking‑first.",
  },
];

export function FaqSection() {
  return (
    <section className="rounded-3xl border border-border/70 bg-card/70 px-4 py-5">
      <div className="mx-auto max-w-4xl">
        <header className="mb-4 text-center">
          <div className="mx-auto mb-2 inline-flex rounded-xl bg-primary/10 p-2.5">
            <HelpCircle className="size-6 text-primary" aria-hidden />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Questions? We've got answers
          </h2>
        </header>

        <ul className="space-y-2.5">
          {faqs.map(({ q, a }) => (
            <li
              key={q}
              className="overflow-hidden rounded-2xl border border-border/60 bg-background/80 backdrop-blur-sm transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <Collapsible>
                <div className="flex items-center justify-between gap-3 p-4">
                  <p className="font-semibold text-foreground">{q}</p>
                  <CollapsibleChevronTrigger aria-label="Toggle answer" className="flex-shrink-0" />
                </div>
                <CollapsibleContent>
                  <div className="border-t border-border/40 bg-muted/30 px-4 py-3.5">
                    <p className="text-sm leading-relaxed text-muted-foreground">{a}</p>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
