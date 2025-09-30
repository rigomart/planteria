"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Editable,
  EditableArea,
  EditableCancel,
  EditableInput,
  EditablePreview,
  EditableSubmit,
  EditableToolbar,
} from "@/components/ui/editable";
import { cn } from "@/lib/utils";

type EditableFieldProps = {
  value: string;
  onSave: (nextValue: string) => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  displayClassName?: string;
  editorClassName?: string;
};

export function EditableField({
  value,
  onSave,
  placeholder,
  className,
  displayClassName,
  editorClassName,
}: EditableFieldProps) {
  return (
    <div className={cn("group/editable", className)}>
      <Editable
        value={value}
        onSubmit={onSave}
        placeholder={placeholder}
        className="flex flex-row items-start gap-1"
        submitOnBlur={false}
      >
        <EditableArea className="flex-1 min-w-0">
          <EditablePreview
            className={cn(
              displayClassName,
              "whitespace-pre-wrap cursor-pointer rounded px-1 -mx-1 transition-colors hover:bg-muted/40",
              !value && "text-muted-foreground/60 italic",
            )}
          />
          <EditableInput
            className={cn(
              editorClassName,
              "w-full rounded border border-primary/40 bg-background px-1 py-0.5 ring-2 ring-primary/20 focus:outline-none",
            )}
          />
        </EditableArea>
        <EditableToolbar className="flex items-center gap-0.5 opacity-0 transition-opacity group-focus-within/editable:opacity-100">
          <EditableSubmit asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-green-600 hover:bg-green-100 hover:text-green-700"
            >
              <Check className="size-3.5" />
            </Button>
          </EditableSubmit>
          <EditableCancel asChild>
            <Button
              variant="ghost"
              size="icon"
              className="size-7 text-muted-foreground hover:bg-muted"
            >
              <X className="size-3.5" />
            </Button>
          </EditableCancel>
        </EditableToolbar>
      </Editable>
    </div>
  );
}
