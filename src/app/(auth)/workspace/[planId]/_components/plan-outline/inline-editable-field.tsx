"use client";

import { Check, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InlineEditableFieldProps = {
  value: string;
  onSave: (nextValue: string) => void;
  onDiscard?: () => void;
  placeholder?: string;
  multiline?: boolean;
  className?: string;
  displayClassName?: string;
  editorClassName?: string;
};

export function InlineEditableField({
  value,
  onSave,
  onDiscard,
  placeholder,
  className,
  displayClassName,
  editorClassName,
}: InlineEditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayValue, setDisplayValue] = useState(() => value ?? "");
  const [draft, setDraft] = useState(() => value ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setDisplayValue(value ?? "");
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      return;
    }

    const element = inputRef.current;
    if (element) {
      element.focus();
      element.select();
    }
  }, [isEditing]);

  const handleEnterEdit = useCallback(() => {
    setDraft(displayValue);
    setIsEditing(true);
  }, [displayValue]);

  const handleSave = useCallback(() => {
    const trimmed = draft.trim();
    setDisplayValue(trimmed);
    setIsEditing(false);
    onSave(trimmed);
  }, [draft, onSave]);

  const handleDiscard = useCallback(() => {
    setDraft(displayValue);
    setIsEditing(false);
    onDiscard?.();
  }, [displayValue, onDiscard]);

  const hasChanges = useMemo(
    () => draft.trim() !== displayValue,
    [draft, displayValue],
  );

  if (!isEditing) {
    return (
      <button
        type="button"
        tabIndex={0}
        onClick={handleEnterEdit}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            handleEnterEdit();
          }
        }}
        className={cn(
          "text-left -mx-1 cursor-text rounded-sm px-1 py-1 transition-colors hover:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
          className,
        )}
      >
        <span
          className={cn(displayClassName, {
            "text-muted-foreground": !displayValue,
            "whitespace-pre-line": true,
          })}
        >
          {displayValue || placeholder || "Click to edit"}
        </span>
      </button>
    );
  }

  return (
    <form
      className={cn("flex gap-3", className)}
      onSubmit={(event) => {
        event.preventDefault();
        if (hasChanges) {
          handleSave();
        }
      }}
    >
      <Input
        ref={inputRef}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={handleDiscard}
        placeholder={placeholder}
        className={editorClassName}
      />

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" size="icon" disabled={!hasChanges}>
          <Check className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          onClick={handleDiscard}
        >
          <X className="size-4" />
        </Button>
      </div>
    </form>
  );
}
