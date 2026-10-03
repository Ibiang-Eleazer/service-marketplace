import { MapPin, Star } from "lucide-react";
import { Avatar, Panel, SectionHeader, Verified, btn } from "@/components/provider/primitives";
import { discoverProviders } from "@/lib/provider-data";
import { cn } from "@/lib/utils";

export function DiscoverProfessionals({ className }: { className?: string }) {
  return (
    <Panel className={cn("p-4 md:p-5", className)} aria-labelledby="discover-title">
      <SectionHeader
        id="discover-title"
        title="Discover professionals"
        description="Other tradespeople on Brand"
      />
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {discoverProviders.map((p) => (
          <li key={p.id}>
            <div className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50">
              <Avatar initials={p.initials} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 text-[13px] font-semibold text-foreground">
                  {p.name}
                  {p.verified ? <Verified /> : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">{p.profession}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Star className="h-3 w-3 fill-foreground text-foreground" aria-hidden="true" />
                  <span className="font-medium text-foreground">{p.rating}</span>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin className="h-3 w-3" aria-hidden="true" />
                    {p.area}
                  </span>
                </p>
              </div>
              <img
                src={p.image}
                alt={p.imageAlt}
                className="h-12 w-12 shrink-0 rounded-md border border-border object-cover"
                loading="lazy"
              />
            </div>
          </li>
        ))}
      </ul>
      <button type="button" className={cn(btn.ghost, "mt-3 w-full justify-center")}>
        See more professionals
      </button>
    </Panel>
  );
}
