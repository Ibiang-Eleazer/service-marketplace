import { useState } from "react";
import type { HomeProvider } from "@/lib/home-data";
import { cn } from "@/lib/utils";

export function HomeProviderCard({
  provider,
  compact = false,
  scanning = false,
  recommended = false,
  dimmed = false,
  showReason = false,
  showWhy = false,
  matchCategoryLabel,
  onView,
  onSelect,
}: {
  provider: HomeProvider;
  compact?: boolean;
  scanning?: boolean;
  recommended?: boolean;
  dimmed?: boolean;
  showReason?: boolean;
  showWhy?: boolean;
  matchCategoryLabel?: string;
  onView?: (provider: HomeProvider) => void;
  onSelect?: () => void;
}) {
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <article
      className={cn(
        "group relative h-full overflow-hidden rounded-lg border bg-card p-4 transition-[border-color,box-shadow,opacity,transform] duration-500 ease-out hover:-translate-y-0.5",
        onSelect && "cursor-pointer",
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
        {!compact && provider.experience ? (
          <span>{provider.experience} exp.</span>
        ) : null}
      </div>

      {showReason ? (
        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          {provider.reason}
        </p>
      ) : null}

      {showWhy ? (
        <div className="mt-3 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setWhyOpen((v) => !v)}
            className="flex items-center gap-1.5 text-xs font-medium text-foreground transition-colors hover:text-foreground/80"
          >
            <span
              aria-hidden="true"
              className={cn(
                "transition-transform duration-200",
                whyOpen ? "rotate-90" : "",
              )}
            >
              ›
            </span>
            Why this provider?
          </button>
          <div
            className={cn(
              "grid transition-[grid-template-rows,opacity,margin-top] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              whyOpen
                ? "grid-rows-[1fr] opacity-100"
                : "grid-rows-[0fr] opacity-0",
            )}
          >
            <div className="overflow-hidden">
              <p className="pt-2.5 text-xs leading-relaxed text-muted-foreground">
                {provider.reason}
              </p>
              {provider.skills.length > 0 ? (
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  {provider.skills.map((s) => (
                    <span
                      key={s}
                      className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
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

      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          className={cn(
            "mt-3 inline-flex items-center gap-1 text-xs font-medium transition-transform duration-200 hover:translate-x-0.5",
            recommended ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {recommended ? (
            <>Selected</>
          ) : (
            <>Select this provider <span aria-hidden="true">→</span></>
          )}
        </button>
      ) : null}
    </article>
  );
}
