import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

/** Temporary text-based brand placeholder — swap the label here when naming lands. */
export const BRAND_NAME = "Brand";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      className={cn(
        "inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground",
        className,
      )}
    >
      <span className="grid h-6 w-6 place-items-center rounded-[5px] border border-border-strong bg-card text-[11px] font-semibold shadow-subtle">
        B
      </span>
      {BRAND_NAME}
    </Link>
  );
}
