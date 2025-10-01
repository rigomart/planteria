"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import { ChevronRight } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function Collapsible({ ...props }: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return <CollapsiblePrimitive.CollapsibleTrigger data-slot="collapsible-trigger" {...props} />;
}

function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return <CollapsiblePrimitive.CollapsibleContent data-slot="collapsible-content" {...props} />;
}

const CollapsibleChevronTrigger = React.forwardRef<
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(function CollapsibleChevronTrigger(
  { className, variant = "ghost", size = "icon", type, ...buttonProps },
  ref,
) {
  return (
    <CollapsibleTrigger asChild>
      <Button
        ref={ref}
        type={type ?? "button"}
        variant={variant}
        size={size}
        className={cn("group", className)}
        {...buttonProps}
      >
        <ChevronRight className="size-4 transition-transform duration-200 ease-out group-data-[state=open]:rotate-90" />
      </Button>
    </CollapsibleTrigger>
  );
});

export { Collapsible, CollapsibleTrigger, CollapsibleContent, CollapsibleChevronTrigger };
