import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OutlineToolbar() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <nav className="flex items-center gap-2">
        <Button type="button" size="sm" variant="default">
          Outline
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled>
          Board
        </Button>
        <Button type="button" size="sm" variant="ghost" disabled>
          Split
        </Button>
      </nav>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => console.log("[UI] refine plan with AI")}
        >
          <Sparkles className="mr-2 size-4" /> AI adjust plan
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={() => console.log("[UI] add outcome", "toolbar")}
        >
          <Plus className="mr-2 size-4" /> Add outcome
        </Button>
      </div>
    </div>
  );
}
