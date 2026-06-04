import { cn } from "@/lib/utils";

export function CresciaWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "font-semibold tracking-tight text-foreground",
        className
      )}
    >
      Crescia
    </span>
  );
}
