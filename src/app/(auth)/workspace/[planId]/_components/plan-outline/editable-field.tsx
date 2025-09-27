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
    <div className={className}>
      <Editable
        value={value}
        onSubmit={onSave}
        placeholder={placeholder}
        autosize
        className="flex flex-row"
        submitOnBlur={false}
      >
        <EditableArea className="flex flex-row w-full">
          <EditablePreview className={displayClassName} />
          <EditableInput className={cn(editorClassName, "flex-1")} />
        </EditableArea>
        <EditableToolbar>
          <EditableSubmit asChild>
            <Button variant="ghost" size="icon">
              <Check />
            </Button>
          </EditableSubmit>
          <EditableCancel asChild>
            <Button variant="ghost" size="icon">
              <X className="w-4 h-4" />
            </Button>
          </EditableCancel>
        </EditableToolbar>
      </Editable>
    </div>
  );
}
