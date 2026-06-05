// Crescia wordmark text component for branding in headers and auth pages.

import { cn } from "@/lib/utils";

interface CresciaWordmarkProps {
  className?: string;
}

/**
 * Renders the Crescia product name as styled text.
 */
export function CresciaWordmark({ className }: CresciaWordmarkProps) {
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
