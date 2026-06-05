// Selectable card for choosing a study session type (questions vs exam).

import type { ComponentType } from "react";

import { cn } from "@/lib/utils";

export interface SessionTypeCardProps {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  selected: boolean;
  onSelect: () => void;
}

/**
 * Renders a selectable session mode option in the study config UI.
 */
export function SessionTypeCard({
  title,
  description,
  icon: Icon,
  selected,
  onSelect,
}: SessionTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-2xl p-4 text-left transition-colors",
        selected
          ? "border-2 border-primary bg-primary/5"
          : "border border-border bg-background hover:bg-muted/30"
      )}
    >
      <Icon
        className={cn(
          "mb-3 size-6",
          selected ? "text-primary" : "text-muted-foreground"
        )}
      />
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </button>
  );
}
