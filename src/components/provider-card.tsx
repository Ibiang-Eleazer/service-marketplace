import type { MockProvider } from "@/lib/mock-providers";
import { cn } from "@/lib/utils";

export type CardState = "idle" | "compare" | "recommended" | "dimmed";

export function ProviderCard({
  provider,
  state = "idle",
  className,
}: {
  provider: MockProvider;
  state?: CardState;
  className?: string;
}) {
  const highlight = state === "compare" || state === "recommended";
  const hl = (on: boolean) =>
    cn(
      "rounded-[3px] px-1 -mx-1 transition-[background-color,color] duration-500",
      on ? "bg-accent text-foreground" : "",
    );

  return (
    <article
      className={cn(
        "group/card relative rounded-lg border bg-card p-4 transition-[border-color,box-shadow,opacity,transform] duration-500 ease-out hover:-translate-y-0.5",
        state === "recommended"
          ? "border-foreground/80 shadow-raised"
          : "border-border shadow-subtle hover:border-border-strong hover:shadow-panel",
        state === "dimmed" && "opacity-45",
        className,
      )}
    >
      {state === "recommended" ? (
        <span className="rise-in absolute -top-2.5 right-3 rounded-full border border-foreground bg-foreground px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-background">
          Recommended
        </span>
      ) : null}
      <div className="flex items-baseline justify-between gap-3">
        <h4 className="text-sm font-semibold text-foreground">{provider.name}</h4>
        <span
          className={cn(
            "text-xs tabular-nums text-muted-foreground",
            hl(highlight),
          )}
        >
          ★ {provider.rating.toFixed(1)} · {provider.reviews}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        {provider.service} · {provider.experience}
      </p>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className={hl(highlight)}>{provider.distance}</span>
        <span className={hl(highlight)}>{provider.availability}</span>
      </div>
    </article>
  );
}
