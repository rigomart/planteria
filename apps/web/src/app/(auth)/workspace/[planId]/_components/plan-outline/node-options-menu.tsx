import { MoreHorizontal, Sparkles, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NodeOptionsMenuProps = {
  onAiAdjust: () => void;
  onDelete: () => void;
};

export function NodeOptionsMenu({ onAiAdjust, onDelete }: NodeOptionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          aria-label="Open options"
        >
          <MoreHorizontal className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="bottom" className="w-48 p-1">
        <DropdownMenuItem
          variant="default"
          onSelect={(event) => {
            event.preventDefault();
            onAiAdjust();
          }}
        >
          <Sparkles className="size-4" />
          AI adjust
        </DropdownMenuItem>
        <DropdownMenuItem
          variant="destructive"
          onSelect={(event) => {
            event.preventDefault();
            onDelete();
          }}
        >
          <Trash2 className="size-4" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type { NodeOptionsMenuProps };
