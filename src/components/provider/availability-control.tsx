import { Check, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { providerStore, useProvider, type Availability } from "@/lib/provider-store";
import { cn } from "@/lib/utils";

const options: Record<Availability, { label: string; hint: string; dot: string }> = {
  available: { label: "Available", hint: "Receiving new requests", dot: "bg-emerald-500" },
  busy: { label: "Busy", hint: "Only urgent & repeat customers", dot: "bg-amber-500" },
  offline: { label: "Offline", hint: "Paused — no new requests", dot: "bg-muted-foreground/50" },
};

export function AvailabilityControl({ variant }: { variant: "block" | "compact" | "inline" }) {
  const { availability } = useProvider();
  const current = options[availability];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Availability: ${current.label}. Change availability`}
        className={cn(
          "flex items-center gap-2 text-left transition-colors",
          variant === "block" &&
            "w-full rounded-lg border border-border bg-card px-3 py-2 shadow-subtle hover:bg-accent",
          variant === "compact" &&
            "h-8 rounded-full border border-border bg-card px-2.5 text-xs shadow-subtle",
          variant === "inline" &&
            "h-8 rounded-full border border-border bg-card px-3 text-[13px] shadow-subtle hover:bg-accent",
        )}
      >
        <span className="relative flex h-2 w-2">
          {availability === "available" ? (
            <span className="absolute inset-0 animate-ping rounded-full bg-emerald-500/50" />
          ) : null}
          <span className={cn("relative h-2 w-2 rounded-full", current.dot)} />
        </span>
        {variant === "block" ? (
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-medium text-foreground">{current.label}</span>
            <span className="block truncate text-[11px] text-muted-foreground">{current.hint}</span>
          </span>
        ) : (
          <span className="font-medium text-foreground">{current.label}</span>
        )}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align={variant === "block" ? "start" : "end"} className="w-60">
        {(Object.keys(options) as Availability[]).map((key) => (
          <DropdownMenuItem
            key={key}
            onSelect={() => providerStore.setAvailability(key)}
            className="items-start gap-2.5 py-2"
          >
            <span className={cn("mt-1.5 h-2 w-2 rounded-full", options[key].dot)} />
            <span className="flex-1">
              <span className="block text-[13px] font-medium">{options[key].label}</span>
              <span className="block text-xs text-muted-foreground">{options[key].hint}</span>
            </span>
            {key === availability ? <Check className="mt-1 h-3.5 w-3.5" aria-hidden="true" /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
