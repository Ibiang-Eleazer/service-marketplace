import { AiMark } from "@/components/ai-mark";
import {
  Panel,
  Pill,
  SectionHeader,
  btn,
} from "@/components/provider/primitives";
import { AssistantProductVideo } from "@/components/provider/assistant-product-video";
import { AssistantTrialCard } from "@/components/provider/assistant-trial-card";
import {
  assistantCapabilities,
  type AssistantCapability,
} from "@/lib/assistant-plans";

const problems = [
  {
    title: "Enquiries arrive while you are on site",
    body: "A good lead sent at 9 AM is cold by lunch. The Assistant drafts a reply the moment a request lands, so you can reply quickly from wherever you are.",
  },
  {
    title: "Your week changes every day",
    body: "Jobs move, clients reschedule and travel eats hours. The Assistant groups nearby work and suggests an order aimed at cutting time on the road.",
  },
  {
    title: "Growth always waits for later",
    body: "Posting about finished work is the first thing dropped. The Assistant turns a completed job into a post you can review in seconds.",
  },
];

const steps = [
  {
    title: "It reads the work",
    body: "Requests, jobs, calendar and messages are gathered into one picture of your week.",
  },
  {
    title: "It prepares the next move",
    body: "Replies, schedule changes and posts are drafted, ready for you to read.",
  },
  {
    title: "You decide",
    body: "Nothing a customer will see goes out until you approve it. You can switch any permission off.",
  },
];

export function AssistantPaywall() {
  const available = assistantCapabilities.filter(
    (c) => c.status === "prototype",
  );
  const planned = assistantCapabilities.filter((c) => c.status === "planned");

  return (
    <div className="flex flex-col gap-10">
      <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
        <div className="flex flex-col gap-5">
          <Pill tone="neutral" className="w-fit">
            <AiMark working={false} size={12} /> AI Assistant · Pro
          </Pill>
          <h2 className="text-2xl font-semibold leading-[1.15] text-foreground md:text-[2.25rem]">
            A business partner that prepares the work. You stay in control.
          </h2>
          <p className="max-w-lg text-[15px] leading-relaxed text-muted-foreground">
            The Assistant handles the follow-up that eats your evenings: replies
            to enquiries, a sensible plan for your week, and a clear read on how
            the business is doing. You approve each move before it goes out.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="#trial" className={`${btn.primary} h-10 px-4 text-sm`}>
              Start your free 3-day trial
            </a>
            <a
              href="#overview"
              className={`${btn.secondary} h-10 px-4 text-sm`}
            >
              Watch the overview
            </a>
          </div>
        </div>

        <Panel className="flex flex-col gap-3 p-5" aria-label="Sample workflow">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Sample workflow
          </p>
          <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-foreground px-3.5 py-2.5 text-[13px] text-background">
            Can you come Thursday to measure the Ikoyi wardrobe?
          </div>
          <div className="flex max-w-[92%] flex-col gap-3 rounded-xl border border-border bg-surface p-4">
            <p className="text-[13px] font-medium text-foreground">
              Draft reply, ready for you
            </p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              &quot;Yes, Thursday works. I can be there at 10 AM with the
              drawings.&quot;
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-md border border-border-strong bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                Approve
              </span>
              <span className="rounded-md px-2.5 py-1 text-xs text-muted-foreground">
                Edit
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Illustrative example, not a live conversation.
          </p>
        </Panel>
      </section>

      <Panel className="p-4 md:p-5" aria-label="Prototype notice">
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Prototype notice.</span>{" "}
          The answers and figures shown in the Assistant use sample business
          data. Features marked Planned below are not built yet.
        </p>
      </Panel>

      <div id="overview">
        <AssistantProductVideo />
      </div>

      <section aria-labelledby="problems-title" className="flex flex-col gap-4">
        <SectionHeader
          id="problems-title"
          title="The problems it takes off your plate"
        />
        <div className="grid gap-4 md:grid-cols-3">
          {problems.map((p) => (
            <Panel key={p.title} className="flex flex-col gap-2 p-5">
              <p className="text-sm font-semibold text-foreground">{p.title}</p>
              <p className="text-[13px] leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </Panel>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-title" className="flex flex-col gap-4">
        <SectionHeader
          id="how-title"
          title="How it works"
          description="Three steps, and you are always the last one."
        />
        <ol className="grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <li key={s.title}>
              <Panel as="div" className="flex h-full flex-col gap-2 p-5">
                <span className="text-xs font-medium text-muted-foreground">
                  Step {i + 1}
                </span>
                <p className="text-sm font-semibold text-foreground">
                  {s.title}
                </p>
                <p className="text-[13px] leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </Panel>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="capabilities-title"
        className="flex flex-col gap-4"
      >
        <SectionHeader
          id="capabilities-title"
          title="What it does today, and what is planned"
          description="Only the first group is in the prototype. The second group is on the roadmap and is not built."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <CapabilityGroup label="In the prototype" items={available} />
          <CapabilityGroup label="Planned" items={planned} />
        </div>
      </section>

      <div id="trial">
        <AssistantTrialCard />
      </div>
    </div>
  );
}

function CapabilityGroup({
  label,
  items,
}: {
  label: string;
  items: AssistantCapability[];
}) {
  return (
    <Panel className="flex flex-col gap-4 p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <ul className="flex flex-col divide-y divide-border">
        {items.map((c) => (
          <li
            key={c.title}
            className="flex flex-col gap-1 py-3 first:pt-0 last:pb-0"
          >
            <p className="text-[13px] font-medium text-foreground">{c.title}</p>
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              {c.description}
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}
