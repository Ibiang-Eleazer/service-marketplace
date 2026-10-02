import { MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Panel, SectionHeader } from "@/components/provider/primitives";
import { naira, opportunities } from "@/lib/provider-data";
import { cn } from "@/lib/utils";

export function Opportunities({ className }: { className?: string }) {
  const [interested, setInterested] = useState<string[]>([]);
  return (
    <Panel className={cn("p-4 md:p-5", className)} aria-labelledby="opps-title">
      <SectionHeader
        id="opps-title"
        title="Opportunities near you"
        description={`${opportunities.length} customers are looking for what you do`}
      />
      <ul className="mt-3 flex flex-col">
        {opportunities.map((o) => {
          const sent = interested.includes(o.id);
          return (
            <li key={o.id} className="flex items-center gap-3 border-t border-border py-3 first:border-t-0">
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{o.service}</p>
                <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 shrink-0" aria-hidden="true" />
                  {o.area} · {o.distanceKm} km · {o.timing}
                </p>
                <p className="mt-0.5 text-xs tabular-nums text-foreground">
                  {naira(o.range[0], true)}–{naira(o.range[1], true)}
                  <span className="text-muted-foreground"> · {o.category}</span>
                </p>
              </div>
              <button
                type="button"
                disabled={sent}
                onClick={() => {
                  setInterested((v) => [...v, o.id]);
                  toast.success("Interest sent", { description: "The customer will see your profile first." });
                }}
                className={cn(
                  "h-7 shrink-0 rounded-md border px-2.5 text-xs font-medium transition-colors",
                  sent
                    ? "border-transparent bg-surface text-muted-foreground"
                    : "border-border-strong bg-card text-foreground hover:bg-accent",
                )}
              >
                {sent ? "Sent" : "I'm interested"}
              </button>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
