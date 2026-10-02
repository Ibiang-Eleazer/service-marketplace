import { Link } from "@tanstack/react-router";
import { ChevronRight, Navigation } from "lucide-react";
import { Panel, Pill, SectionHeader, btn } from "@/components/provider/primitives";
import { useProvider } from "@/lib/provider-store";
import { cn } from "@/lib/utils";

export function TodaySchedule({ className }: { className?: string }) {
  const { jobs } = useProvider();
  const today = jobs
    .filter((j) => j.date === "Today" && (j.status === "upcoming" || j.status === "in_progress"))
    .sort((a, b) => (a.time.includes("AM") ? -1 : 1) - (b.time.includes("AM") ? -1 : 1));

  return (
    <Panel className={cn("p-4 md:p-5", className)} aria-labelledby="today-title">
      <SectionHeader
        id="today-title"
        title="Today"
        description={`${today.length} appointments`}
        action={
          <Link to="/provider/calendar" className={btn.ghost}>
            Calendar
          </Link>
        }
      />
      <ol className="mt-4 flex flex-col">
        {today.map((job, i) => (
          <li key={job.id} className="relative flex gap-3">
            <div className="flex w-16 shrink-0 flex-col items-end pt-0.5">
              <span className="text-[13px] font-medium tabular-nums text-foreground">{job.time}</span>
            </div>
            <div className="relative flex flex-col items-center">
              <span
                className={cn(
                  "mt-1.5 h-2 w-2 rounded-full",
                  job.status === "in_progress" ? "bg-foreground" : "border border-border-strong bg-card",
                )}
              />
              {i < today.length - 1 ? <span className="mt-1 w-px flex-1 bg-border" /> : null}
            </div>
            <Link
              to="/provider/jobs"
              className="group -mt-1 mb-3 flex min-w-0 flex-1 items-center gap-2 rounded-lg p-2 transition-colors hover:bg-accent"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-foreground">{job.service}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {job.customer.name} · {job.area}
                </p>
                <div className="mt-1.5">
                  {job.status === "in_progress" ? (
                    <Pill tone="strong">In progress · {job.duration}</Pill>
                  ) : (
                    <Pill tone="positive">Confirmed</Pill>
                  )}
                </div>
              </div>
              <ChevronRight
                className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              />
            </Link>
          </li>
        ))}
      </ol>
      {today.length > 0 ? (
        <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2.5 text-xs text-muted-foreground">
          <Navigation className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          Leave by 2:40 PM for Ikeja GRA — traffic on Third Mainland is heavy.
        </div>
      ) : null}
    </Panel>
  );
}
