import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { PageContainer } from "@/components/provider/provider-shell";
import { PageHeader, Panel, SectionHeader, btn } from "@/components/provider/primitives";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/calendar")({
  component: CalendarPage,
});

type Slot = {
  id: string;
  day: number;
  start: number;
  end: number;
  title: string;
  who: string;
  kind: "job" | "block" | "pending";
};

const days = [
  { short: "Mon", date: 12 },
  { short: "Tue", date: 13 },
  { short: "Wed", date: 14 },
  { short: "Thu", date: 15 },
  { short: "Fri", date: 16 },
  { short: "Sat", date: 17 },
  { short: "Sun", date: 18 },
];
const TODAY = 0;
const HOURS = Array.from({ length: 11 }, (_, i) => 8 + i);
const HOUR_PX = 52;

const seed: Slot[] = [
  { id: "s1", day: 0, start: 10, end: 14, title: "Kitchen installation", who: "Folake A. · Lekki Ph 1", kind: "job" },
  { id: "s2", day: 0, start: 15.5, end: 17, title: "Electrical inspection", who: "Chidi O. · Ikeja GRA", kind: "job" },
  { id: "s3", day: 1, start: 9, end: 15, title: "Kitchen installation", who: "Folake A. · Day 4", kind: "job" },
  { id: "s4", day: 2, start: 9, end: 13, title: "Kitchen installation", who: "Folake A. · Day 5", kind: "job" },
  { id: "s5", day: 2, start: 14, end: 16, title: "Workshop — timber delivery", who: "Blocked", kind: "block" },
  { id: "s6", day: 3, start: 9, end: 17, title: "Bespoke bookshelf", who: "Ibrahim S. · VI", kind: "job" },
  { id: "s7", day: 3, start: 13, end: 14.5, title: "Site measure", who: "Kunle A. · Oniru", kind: "pending" },
  { id: "s8", day: 4, start: 13, end: 18, title: "Dining table refinish", who: "Tunde B. · Ikoyi", kind: "pending" },
  { id: "s9", day: 5, start: 11, end: 12, title: "Kitchen consultation", who: "Grace E. · Ajah", kind: "pending" },
  { id: "s10", day: 5, start: 14, end: 18, title: "Wardrobe doors", who: "Ngozi O. · Lekki Ph 1", kind: "job" },
];

function overlaps(a: Slot, b: Slot) {
  return a.id !== b.id && a.day === b.day && a.start < b.end && b.start < a.end;
}

function fmt(h: number) {
  const hr = Math.floor(h);
  const min = h % 1 ? "30" : "00";
  const suffix = hr >= 12 ? "PM" : "AM";
  return `${hr > 12 ? hr - 12 : hr}:${min} ${suffix}`;
}

const kindStyles = {
  job: "border-foreground/15 bg-foreground text-background",
  pending: "border-dashed border-foreground/40 bg-card text-foreground",
  block: "border-border bg-[repeating-linear-gradient(135deg,var(--color-surface)_0_6px,transparent_6px_12px)] text-muted-foreground",
};

function WeekGrid({ slots }: { slots: Slot[] }) {
  return (
    <Panel className="hidden overflow-hidden md:block">
      <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b border-border">
        <span />
        {days.map((d, i) => (
          <div key={d.short} className="border-l border-border px-2 py-2.5 text-center">
            <p className="text-[11px] text-muted-foreground">{d.short}</p>
            <p
              className={cn(
                "mx-auto mt-0.5 grid h-7 w-7 place-items-center rounded-full text-sm font-semibold tabular-nums",
                i === TODAY && "bg-foreground text-background",
              )}
            >
              {d.date}
            </p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
        <div>
          {HOURS.map((h) => (
            <div key={h} style={{ height: HOUR_PX }} className="pr-2 pt-1 text-right text-[10.5px] text-muted-foreground">
              {fmt(h).replace(":00", "")}
            </div>
          ))}
        </div>
        {days.map((d, dayIdx) => (
          <div key={d.short} className="relative border-l border-border">
            {HOURS.map((h) => (
              <div key={h} style={{ height: HOUR_PX }} className="border-t border-border/60 first:border-t-0" />
            ))}
            {slots
              .filter((s) => s.day === dayIdx)
              .map((s) => {
                const conflict = slots.some((o) => overlaps(s, o));
                return (
                  <div
                    key={s.id}
                    className={cn(
                      "absolute inset-x-1 overflow-hidden rounded-md border px-1.5 py-1 text-[11px] leading-tight",
                      kindStyles[s.kind],
                      conflict && s.kind === "pending" && "left-1/2 ring-2 ring-amber-500",
                      conflict && s.kind === "job" && "right-1/2",
                    )}
                    style={{ top: (s.start - 8) * HOUR_PX + 2, height: (s.end - s.start) * HOUR_PX - 4 }}
                  >
                    <p className="truncate font-medium">{s.title}</p>
                    <p className="truncate opacity-75">{s.who}</p>
                  </div>
                );
              })}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function DayAgenda({ slots }: { slots: Slot[] }) {
  const [day, setDay] = useState(TODAY);
  const items = slots.filter((s) => s.day === day).sort((a, b) => a.start - b.start);
  return (
    <div className="md:hidden">
      <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1">
        {days.map((d, i) => (
          <button
            key={d.short}
            type="button"
            onClick={() => setDay(i)}
            aria-pressed={day === i}
            className={cn(
              "flex h-14 w-12 shrink-0 flex-col items-center justify-center rounded-xl border text-xs transition-colors",
              day === i ? "border-foreground bg-foreground text-background" : "border-border bg-card text-foreground",
            )}
          >
            <span className="opacity-70">{d.short}</span>
            <span className="text-sm font-semibold tabular-nums">{d.date}</span>
          </button>
        ))}
      </div>
      <ul className="mt-4 flex flex-col gap-2">
        {items.length === 0 ? (
          <li className="rounded-xl border border-dashed border-border p-6 text-center text-[13px] text-muted-foreground">
            Free day — you&apos;re open to new bookings.
          </li>
        ) : null}
        {items.map((s) => (
          <li key={s.id} className={cn("flex gap-3 rounded-xl border p-3", kindStyles[s.kind])}>
            <span className="w-16 shrink-0 text-xs font-medium tabular-nums">{fmt(s.start)}</span>
            <div className="min-w-0">
              <p className="truncate text-[13px] font-medium">{s.title}</p>
              <p className="truncate text-xs opacity-75">
                {s.who} · until {fmt(s.end)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

const defaultHours = [
  { day: "Monday", on: true, hours: "8:00 – 18:00" },
  { day: "Tuesday", on: true, hours: "8:00 – 18:00" },
  { day: "Wednesday", on: true, hours: "8:00 – 18:00" },
  { day: "Thursday", on: true, hours: "8:00 – 18:00" },
  { day: "Friday", on: true, hours: "8:00 – 18:00" },
  { day: "Saturday", on: true, hours: "10:00 – 16:00" },
  { day: "Sunday", on: false, hours: "Closed" },
];

function CalendarPage() {
  const [slots, setSlots] = useState(seed);
  const [hours, setHours] = useState(defaultHours);
  const conflicts = slots.filter((s) => s.kind === "pending" && slots.some((o) => overlaps(s, o)));

  return (
    <PageContainer wide>
      <PageHeader
        title="Calendar"
        description="12 – 18 October · 7 bookings, 3 awaiting your confirmation"
        actions={
          <>
            <div className="flex items-center rounded-md border border-border bg-card shadow-subtle">
              <button type="button" className={btn.icon} aria-label="Previous week">
                <ChevronLeft className="h-4 w-4" aria-hidden="true" />
              </button>
              <span className="px-1 text-[13px] font-medium">This week</span>
              <button type="button" className={btn.icon} aria-label="Next week">
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <button
              type="button"
              className={btn.primary}
              onClick={() => {
                setSlots((s) => [
                  ...s,
                  { id: `b${s.length}`, day: 6, start: 10, end: 13, title: "Personal time", who: "Blocked", kind: "block" },
                ]);
                toast.success("Blocked Sunday 10 AM – 1 PM");
              }}
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Block time
            </button>
          </>
        }
      />

      {conflicts.length > 0 ? (
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-amber-500/30 bg-amber-500/[0.06] p-4 sm:flex-row sm:items-center">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <p className="flex-1 text-[13px] text-foreground">
            <span className="font-medium">Scheduling conflict:</span> {conflicts[0].title} ({conflicts[0].who}) on{" "}
            {days[conflicts[0].day].short} {fmt(conflicts[0].start)} overlaps the bookshelf build.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className={btn.secondary}
              onClick={() => {
                setSlots((s) => s.map((x) => (x.id === conflicts[0].id ? { ...x, day: 4, start: 9, end: 10.5 } : x)));
                toast.success("Proposed Fri 9:00 AM to Kunle");
              }}
            >
              Suggest Fri 9 AM
            </button>
            <button
              type="button"
              className={btn.ghost}
              onClick={() => setSlots((s) => s.filter((x) => x.id !== conflicts[0].id))}
            >
              Decline
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <WeekGrid slots={slots} />
          <DayAgenda slots={slots} />
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-foreground" /> Confirmed
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-foreground/50" /> Awaiting you
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-border bg-surface" /> Blocked
            </span>
          </div>
        </div>

        <Panel className="self-start p-4 md:p-5" aria-labelledby="hours-title">
          <SectionHeader id="hours-title" title="Working hours" description="Customers can only book inside these." />
          <ul className="mt-4 flex flex-col">
            {hours.map((h, i) => (
              <li key={h.day} className="flex items-center gap-3 border-t border-border py-2.5 first:border-t-0">
                <Switch
                  id={`wh-${h.day}`}
                  checked={h.on}
                  onCheckedChange={(on) =>
                    setHours((all) =>
                      all.map((x, j) => (j === i ? { ...x, on, hours: on ? "8:00 – 18:00" : "Closed" } : x)),
                    )
                  }
                />
                <label htmlFor={`wh-${h.day}`} className="flex-1 text-[13px] text-foreground">
                  {h.day}
                </label>
                <span className={cn("text-xs tabular-nums", h.on ? "text-foreground" : "text-muted-foreground")}>
                  {h.hours}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg bg-surface px-3 py-2 text-xs text-muted-foreground">
            30-min travel buffer is added automatically between jobs in different areas.
          </p>
        </Panel>
      </div>
    </PageContainer>
  );
}
