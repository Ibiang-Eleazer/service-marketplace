import type { HomeProvider } from "@/lib/home-data";
import { cn } from "@/lib/utils";

export function HomeProviderCard({
  provider,
  compact = false,
  scanning = false,
  recommended = false,
  dimmed = false,
  showReason = false,
  onView,
}: {
  provider: HomeProvider;
  compact?: boolean;
  scanning?: boolean;
  recommended?: boolean;
  dimmed?: boolean;
  showReason?: boolean;
  onView?: (provider: HomeProvider) => void;
}) {
  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-lg border bg-card p-4 transition-[border-color,box-shadow,opacity,transform] duration-500 ease-out hover:-translate-y-0.5",
        recommended
          ? "border-foreground/80 shadow-raised"
          : "border-border shadow-subtle hover:border-border-strong hover:shadow-panel",
        dimmed && "opacity-45",
      )}
    >
      {scanning ? (
        <span
          aria-hidden="true"
          className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-px bg-foreground/30"
        />
      ) : null}

      {recommended ? (
        <span className="rise-in absolute right-3 top-3 rounded-full bg-foreground px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-background">
          Recommended
        </span>
      ) : null}

      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold text-foreground">
          {provider.initials}
        </span>
        <div className="min-w-0">
          <h4 className="truncate text-sm font-semibold text-foreground">
            {provider.name}
          </h4>
          <p className="truncate text-xs text-muted-foreground">{provider.service}</p>
        </div>
      </div>

      {!compact ? (
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          {provider.description}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <span className="tabular-nums">★ {provider.rating.toFixed(1)}</span>
        <span>{provider.distance}</span>
        <span>{provider.availability}</span>
      </div>

      {showReason ? (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          {provider.reason}
        </p>
      ) : null}

      {onView ? (
        <button
          type="button"
          onClick={() => onView(provider)}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-foreground transition-transform duration-200 hover:translate-x-0.5"
        >
          View profile <span aria-hidden="true">→</span>
        </button>
      ) : null}
    </article>
  );
}
