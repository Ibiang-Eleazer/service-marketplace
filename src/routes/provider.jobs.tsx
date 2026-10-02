import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Clock, MapPin, MessageSquare, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { PageContainer } from "@/components/provider/provider-shell";
import { Avatar, PageHeader, Panel, Pill, btn } from "@/components/provider/primitives";
import { acceptJob, declineJob } from "@/components/provider/home/action-center";
import { naira, type Job, type JobStatus } from "@/lib/provider-data";
import { providerStore, useProvider } from "@/lib/provider-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/jobs")({
  component: JobsPage,
});

const tabs: { key: JobStatus; label: string }[] = [
  { key: "new", label: "New requests" },
  { key: "upcoming", label: "Upcoming" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const steps = ["Request", "Accept", "Book time", "Go to location", "Complete"];
const stepIndex: Record<JobStatus, number> = {
  new: 0,
  upcoming: 2,
  in_progress: 3,
  completed: 5,
  cancelled: -1,
};

function Workflow({ status }: { status: JobStatus }) {
  const current = stepIndex[status];
  if (current < 0) return null;
  return (
    <ol className="flex items-center gap-1" aria-label="Job progress">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={s} className="flex flex-1 flex-col gap-1.5">
            <span
              className={cn(
                "h-1 rounded-full",
                done ? "bg-foreground" : active ? "bg-foreground/40" : "bg-border",
              )}
            />
            <span
              className={cn(
                "text-[10.5px] leading-tight",
                done || active ? "text-foreground" : "text-muted-foreground",
                active && "font-medium",
              )}
            >
              {s}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function JobActions({ job }: { job: Job }) {
  const message = (
    <Link to="/provider/messages" className={btn.secondary}>
      <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" /> Message
    </Link>
  );
  if (job.status === "new")
    return (
      <div className="flex flex-wrap gap-2">
        <button type="button" className={btn.primary} onClick={() => acceptJob(job)}>
          Accept
        </button>
        <button type="button" className={btn.secondary} onClick={() => declineJob(job)}>
          Decline
        </button>
        <Link to="/provider/calendar" className={btn.secondary}>
          Propose another time
        </Link>
        {message}
      </div>
    );
  if (job.status === "upcoming")
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btn.primary}
          onClick={() => {
            providerStore.moveJob(job.id, "in_progress");
            toast.success("On your way", { description: `${job.customer.name} can see your ETA.` });
          }}
        >
          Start — I&apos;m heading there
        </button>
        <Link to="/provider/calendar" className={btn.secondary}>
          Reschedule
        </Link>
        {message}
      </div>
    );
  if (job.status === "in_progress")
    return (
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={btn.primary}
          onClick={() => {
            providerStore.moveJob(job.id, "completed");
            toast.success("Job completed", { description: "Payment will be released after the customer confirms." });
          }}
        >
          <Check className="h-3.5 w-3.5" aria-hidden="true" /> Mark complete
        </button>
        {message}
      </div>
    );
  return <div className="flex gap-2">{message}</div>;
}

function JobDetail({ job }: { job: Job }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-start gap-3">
        <Avatar initials={job.customer.initials} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">{job.id}</p>
          <h2 className="text-lg font-semibold text-foreground">{job.service}</h2>
          <p className="text-[13px] text-muted-foreground">{job.customer.name}</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold tabular-nums">{naira(job.earnings)}</p>
          <p className="text-[11px] text-muted-foreground">est. earnings</p>
        </div>
      </div>

      <Workflow status={job.status} />

      <p className="text-sm leading-relaxed text-foreground text-pretty">{job.description}</p>

      <dl className="grid grid-cols-2 gap-3 rounded-lg bg-surface p-3 text-[13px]">
        <div>
          <dt className="text-xs text-muted-foreground">When</dt>
          <dd className="font-medium">
            {job.date}, {job.time}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Duration</dt>
          <dd className="font-medium">{job.duration}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Location</dt>
          <dd className="font-medium">{job.area}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted-foreground">Distance</dt>
          <dd className="font-medium">{job.distanceKm} km</dd>
        </div>
      </dl>

      <div className="rounded-lg border border-border p-3">
        <p className="text-xs font-medium text-muted-foreground">About the customer</p>
        <p className="mt-1 text-[13px] text-foreground">
          Member since {job.customer.memberSince} · {job.customer.jobsBooked} past bookings
          {job.customer.rating ? (
            <>
              {" "}
              · rated <Star className="inline h-3 w-3 fill-foreground" aria-hidden="true" /> {job.customer.rating} by
              providers
            </>
          ) : null}
        </p>
        {job.note ? <p className="mt-1 text-[13px] text-muted-foreground">{job.note}</p> : null}
      </div>

      {job.review ? (
        <figure className="rounded-lg border border-border p-3">
          <p className="flex gap-0.5" aria-label={`${job.review.rating} stars`}>
            {Array.from({ length: job.review.rating }).map((_, i) => (
              <Star key={i} className="h-3.5 w-3.5 fill-foreground" aria-hidden="true" />
            ))}
          </p>
          <blockquote className="mt-1.5 text-[13px] text-foreground">&ldquo;{job.review.text}&rdquo;</blockquote>
        </figure>
      ) : null}

      <JobActions job={job} />
    </div>
  );
}

function JobsPage() {
  const { jobs } = useProvider();
  const [tab, setTab] = useState<JobStatus>("new");
  const list = jobs.filter((j) => j.status === tab);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = list.find((j) => j.id === selectedId) ?? list[0];

  return (
    <PageContainer wide>
      <PageHeader title="Jobs" description="Every request and booking, from first message to final payment." />

      <div
        role="tablist"
        aria-label="Job status"
        className="-mx-4 mt-6 flex gap-1 overflow-x-auto border-b border-border px-4 md:mx-0 md:px-0"
      >
        {tabs.map((t) => {
          const count = jobs.filter((j) => j.status === t.key).length;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => {
                setTab(t.key);
                setSelectedId(null);
              }}
              className={cn(
                "-mb-px flex h-10 shrink-0 items-center gap-1.5 border-b-2 px-3 text-[13px] transition-colors",
                tab === t.key
                  ? "border-foreground font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              <span className="rounded-full bg-surface px-1.5 text-[11px] tabular-nums text-muted-foreground">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {list.length === 0 ? (
        <Panel className="mt-6 p-10 text-center">
          <p className="text-sm font-medium text-foreground">Nothing here right now</p>
          <p className="mt-1 text-[13px] text-muted-foreground">
            New jobs will appear here as customers book you.
          </p>
        </Panel>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <ul className="flex flex-col gap-2">
            {list.map((job) => {
              const isSelected = selected?.id === job.id;
              return (
                <li key={job.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(job.id)}
                    aria-expanded={isSelected}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-xl border bg-card p-4 text-left shadow-subtle transition-colors",
                      isSelected ? "border-foreground/25 ring-1 ring-foreground/10" : "border-border hover:bg-accent/50",
                    )}
                  >
                    <Avatar initials={job.customer.initials} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-semibold text-foreground">{job.service}</p>
                        <p className="text-sm font-semibold tabular-nums">{naira(job.earnings, true)}</p>
                      </div>
                      <p className="text-[13px] text-muted-foreground">{job.customer.name}</p>
                      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3 w-3" aria-hidden="true" />
                          {job.date}, {job.time}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" aria-hidden="true" />
                          {job.area} · {job.distanceKm} km
                        </span>
                      </p>
                      {job.urgent && job.status === "new" ? (
                        <Pill tone="attention" className="mt-2">
                          Expires in 2 h
                        </Pill>
                      ) : null}
                    </div>
                  </button>
                  {isSelected ? (
                    <div className="mt-2 rounded-xl border border-border bg-card p-4 lg:hidden">
                      <JobDetail job={job} />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {selected ? (
            <Panel className="sticky top-6 hidden self-start p-6 lg:block">
              <JobDetail job={selected} />
            </Panel>
          ) : null}
        </div>
      )}
    </PageContainer>
  );
}
