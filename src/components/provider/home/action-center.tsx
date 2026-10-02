import { Link } from "@tanstack/react-router";
import { CalendarCheck, Clock, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, Panel, Pill, SectionHeader, btn } from "@/components/provider/primitives";
import { conversations, naira, type Job } from "@/lib/provider-data";
import { providerStore, useProvider } from "@/lib/provider-store";

export function useAttentionCount() {
  const { jobs } = useProvider();
  const newRequests = jobs.filter((j) => j.status === "new").length;
  const pendingConfirmations = jobs.filter((j) => j.status === "upcoming" && j.note?.includes("awaiting")).length;
  return newRequests + pendingConfirmations + 1;
}

export function acceptJob(job: Job) {
  providerStore.moveJob(job.id, "upcoming");
  toast.success(`Accepted · ${job.service}`, {
    description: `${job.date}, ${job.time} · ${job.customer.name} has been notified.`,
  });
}

export function declineJob(job: Job) {
  providerStore.moveJob(job.id, "cancelled");
  toast(`Declined · ${job.service}`, {
    action: { label: "Undo", onClick: () => providerStore.moveJob(job.id, "new") },
  });
}

function RequestItem({ job }: { job: Job }) {
  return (
    <li className="rise-in flex flex-col gap-3 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <Avatar initials={job.customer.initials} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Pill tone="strong">New request</Pill>
            {job.urgent ? <Pill tone="attention">Responds fast to win</Pill> : null}
          </div>
          <p className="mt-1.5 text-[15px] font-semibold text-foreground">{job.service}</p>
          <p className="text-[13px] text-muted-foreground">
            {job.customer.name}
            {job.customer.rating ? ` · ★ ${job.customer.rating}` : ""} · {job.customer.jobsBooked} past bookings
          </p>
        </div>
        <div className="text-right">
          <p className="text-[15px] font-semibold tabular-nums text-foreground">{naira(job.earnings)}</p>
          <p className="text-[11px] text-muted-foreground">est. earnings</p>
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-4 gap-y-1 pl-12 text-[13px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">Location</dt>
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          <dd>
            {job.area} · {job.distanceKm} km away
          </dd>
        </div>
        <div className="flex items-center gap-1.5">
          <dt className="sr-only">When</dt>
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <dd>
            {job.date}, {job.time} · {job.duration}
          </dd>
        </div>
      </dl>

      <div className="flex flex-wrap items-center gap-2 pl-12">
        <button type="button" className={btn.primary} onClick={() => acceptJob(job)}>
          Accept
        </button>
        <button type="button" className={btn.secondary} onClick={() => declineJob(job)}>
          Decline
        </button>
        <Link to="/provider/jobs" className={btn.ghost}>
          View details
        </Link>
      </div>
    </li>
  );
}

function MessageItem() {
  const convo = conversations[0];
  const [reply, setReply] = useState("");
  const [sent, setSent] = useState(false);
  return (
    <li className="flex flex-col gap-3 p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface">
          <MessageSquare className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] text-muted-foreground">
            <span className="font-medium text-foreground">{convo.name}</span> · re: Custom wardrobe · {convo.time} ago
          </p>
          <p className="mt-1 text-[15px] text-foreground">&ldquo;{convo.preview}&rdquo;</p>
        </div>
      </div>
      {sent ? (
        <p className="pl-12 text-[13px] text-muted-foreground">Reply sent. You&apos;ll see her response in Messages.</p>
      ) : (
        <form
          className="flex gap-2 pl-12"
          onSubmit={(e) => {
            e.preventDefault();
            if (!reply.trim()) return;
            setSent(true);
            toast.success("Reply sent to Amaka");
          }}
        >
          <label htmlFor="quick-reply" className="sr-only">
            Reply to {convo.name}
          </label>
          <input
            id="quick-reply"
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Quick reply…"
            className="h-8 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-[13px] outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
          />
          <button
            type="button"
            className={btn.secondary}
            onClick={() => setReply("Yes, 8:00 AM works. I'll be there with the measurements.")}
          >
            8 AM works
          </button>
          <button type="submit" className={btn.primary} disabled={!reply.trim()}>
            Send
          </button>
        </form>
      )}
    </li>
  );
}

function ConfirmationItem({ job }: { job: Job }) {
  return (
    <li className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:p-5">
      <div className="flex flex-1 items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border bg-surface">
          <CalendarCheck className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        </span>
        <div>
          <p className="text-[15px] text-foreground">
            <span className="font-medium">{job.customer.name}</span> requested {job.date} at {job.time}
          </p>
          <p className="text-[13px] text-muted-foreground">
            {job.service} · {job.area} · No conflicts on your calendar
          </p>
        </div>
      </div>
      <div className="flex gap-2 pl-12 md:pl-0">
        <button
          type="button"
          className={btn.primary}
          onClick={() => {
            providerStore.updateJob(job.id, { note: undefined });
            toast.success("Booking confirmed", { description: `${job.date}, ${job.time}` });
          }}
        >
          Confirm
        </button>
        <Link to="/provider/calendar" className={btn.secondary}>
          Suggest time
        </Link>
      </div>
    </li>
  );
}

export function ActionCenter({ className }: { className?: string }) {
  const { jobs } = useProvider();
  const requests = jobs.filter((j) => j.status === "new").slice(0, 2);
  const confirmation = jobs.find((j) => j.status === "upcoming" && j.note?.includes("awaiting"));
  const total = useAttentionCount();

  return (
    <Panel className={className} aria-labelledby="attention-title">
      <div className="border-b border-border px-4 py-3.5 md:px-5">
        <SectionHeader
          id="attention-title"
          title="Needs your attention"
          description={`${total} items · new requests expire in 2 h if you don't respond`}
          action={
            <Link to="/provider/jobs" className={btn.ghost}>
              All requests
            </Link>
          }
        />
      </div>
      <ul className="divide-y divide-border">
        {requests.map((job) => (
          <RequestItem key={job.id} job={job} />
        ))}
        <MessageItem />
        {confirmation ? <ConfirmationItem job={confirmation} /> : null}
      </ul>
    </Panel>
  );
}
