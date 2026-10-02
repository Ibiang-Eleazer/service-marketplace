import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Panel, SectionHeader, btn } from "@/components/provider/primitives";
import { cn } from "@/lib/utils";

const metrics = [
  { label: "Earned this month", value: "₦3.9M", delta: "+15%" },
  { label: "Jobs completed", value: "14", delta: "+3" },
  { label: "Rating", value: "4.9", delta: "214 reviews", neutral: true },
  { label: "Profile views", value: "3,990", delta: "+28%" },
  { label: "Requests received", value: "55", delta: "+16%" },
];

export function QuickPerformance({ className }: { className?: string }) {
  return (
    <Panel className={cn("p-4 md:p-5", className)} aria-labelledby="perf-title">
      <SectionHeader
        id="perf-title"
        title="This month"
        description="Oct 1 – today"
        action={
          <Link to="/provider/analytics" className={btn.ghost}>
            Analytics
          </Link>
        }
      />
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-4">
        {metrics.map((m, i) => (
          <div key={m.label} className={cn(i === 0 && "col-span-2 border-b border-border pb-4")}>
            <dt className="text-xs text-muted-foreground">{m.label}</dt>
            <dd className="mt-1 flex items-baseline gap-2">
              <span
                className={cn(
                  "font-semibold tabular-nums text-foreground",
                  i === 0 ? "text-2xl" : "text-lg",
                )}
              >
                {m.value}
              </span>
              <span
                className={cn(
                  "inline-flex items-center text-[11px] font-medium",
                  m.neutral ? "text-muted-foreground" : "text-emerald-700",
                )}
              >
                {!m.neutral ? <ArrowUpRight className="h-3 w-3" aria-hidden="true" /> : null}
                {m.delta}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
