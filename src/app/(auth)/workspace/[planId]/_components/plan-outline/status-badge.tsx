"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { STATUS_STYLES, type StatusValue } from "./constants";

type StatusBadgeProps = {
  status: StatusValue;
  onChange?: (status: StatusValue) => void;
  className?: string;
};

export function StatusBadge({ status, onChange, className }: StatusBadgeProps) {
  const [open, setOpen] = useState(false);
  const style = STATUS_STYLES[status];

  const statusOptions = Object.entries(STATUS_STYLES).map(([value, style]) => ({
    value: value as StatusValue,
    label: style.label,
  }));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium h-auto border-0 shadow-none hover:bg-muted/50",
            style.badgeClass,
            className,
          )}
        >
          <span className={cn("size-2.5 rounded-full", style.dotClass)} />
          {style.label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[100px] p-0" align="start">
        <Command>
          <CommandList>
            <CommandGroup>
              {statusOptions.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(value) => {
                    const newStatus = value as StatusValue;
                    onChange?.(newStatus);
                    setOpen(false);
                  }}
                >
                  <span
                    className={cn(
                      "size-2.5 rounded-full mr-1",
                      STATUS_STYLES[option.value].dotClass,
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
