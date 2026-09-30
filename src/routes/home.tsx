import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { AppNav, AssistantStatus } from "@/components/app-nav";
import { AiMark } from "@/components/ai-mark";
import { HomeProviderCard } from "@/components/home-provider-card";
import { RequestWorkflow } from "@/components/request-workflow";
import { Button } from "@/components/ui-kit";
import {
  recentActivity,
  recommendedNearby,
  resolveIntent,
  starterPrompts,
  titleFor,
  type HomeProvider,
} from "@/lib/home-data";
import { useOnboarding } from "@/lib/onboarding-store";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Your assistant — Brand" },
      {
        name: "description",
        content:
          "Tell the assistant what you need in your own words. It works out the next steps and asks before contacting anyone.",
      },
      { property: "og:title", content: "Your assistant — Brand" },
      {
        property: "og:description",
        content:
          "Tell the assistant what you need in your own words. It works out the next steps and asks before contacting anyone.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type RequestStatus =
  | "Processing…"
  | "Finding providers"
  | "Comparing options"
  | "Waiting for your decision"
  | "Contacting provider"
  | "Saved for later";

type ActiveRequest = {
  id: string;
  title: string;
  service: string;
  status: RequestStatus;
  progress: number;
  note?: string | undefined;
};

const seedRequests: ActiveRequest[] = [
  {
    id: "seed-ac",
    title: "AC not cooling",
    service: "Technician search",
    status: "Waiting for your decision",
    progress: 0.85,
    note: "3 compared · 1 recommended",
  },
];

function Home() {
  const { customer } = useOnboarding();
  const firstName = customer.name.trim().split(" ")[0];

  const [draft, setDraft] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [requests, setRequests] = useState<ActiveRequest[]>(seedRequests);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [preview, setPreview] = useState<HomeProvider | null>(null);
  const workflowRef = useRef<HTMLDivElement>(null);

  function submit(text: string) {
    const value = text.trim();
    if (!value) return;
    const intent = resolveIntent(value);
    const id = `req-${Date.now()}`;
    setRequests((prev) => [
      {
        id,
        title: titleFor(value, intent),
        service: intent.service,
        status: "Processing…",
        progress: 0.1,
      },
      ...prev,
    ]);
    setActiveId(id);
    setPrompt(value);
    setDraft("");
    setWorking(true);
    requestAnimationFrame(() =>
      workflowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  }

  const handleStage = useCallback(
    (stage: number) => {
      setWorking(stage < 7);
      setRequests((prev) =>
        prev.map((r) =>
          r.id !== activeId
            ? r
            : {
                ...r,
                progress: Math.min(1, 0.1 + stage * 0.13),
                status:
                  stage >= 7
                    ? "Waiting for your decision"
                    : stage >= 5
                      ? "Comparing options"
                      : stage >= 3
                        ? "Finding providers"
                        : "Processing…",
                note: stage >= 6 ? "3 compared · 1 recommended" : r.note,
              },
        ),
      );
    },
    [activeId],
  );

  const handleDecision = useCallback(
    (decision: "approved" | "declined") => {
      setWorking(false);
      setRequests((prev) =>
        prev.map((r) =>
          r.id !== activeId
            ? r
            : {
                ...r,
                status: decision === "approved" ? "Contacting provider" : "Saved for later",
                progress: decision === "approved" ? 1 : 0.85,
                note:
                  decision === "approved"
                    ? "Preparing your next step"
                    : "Waiting for you to decide",
              },
        ),
      );
    },
    [activeId],
  );

  const activityReveal = useReveal<HTMLDivElement>(0.15);
  const discoverReveal = useReveal<HTMLDivElement>(0.12);

  return (
    <div className="min-h-screen bg-background">
      <AppNav
        working={working}
        statusLabel={working ? "Assistant is working…" : "Assistant ready"}
      />

      <main className="mx-auto w-full max-w-6xl px-5 pb-24 md:px-8">
        {/* Hero / AI request area */}
        <section className="pt-16 md:pt-24">
          <div className="max-w-2xl">
            <AssistantStatus
              working={working}
              label={working ? "Assistant is working…" : "Assistant ready"}
              className="rise-in"
            />
            <h1
              className="rise-in mt-5 text-[2.1rem] font-semibold leading-[1.1] text-foreground md:text-[2.8rem]"
              style={{ animationDelay: "60ms" }}
            >
              {firstName ? `${firstName}, what can I help you get done?` : "What can I help you get done?"}
            </h1>
            <p
              className="rise-in mt-3 text-[0.98rem] text-muted-foreground"
              style={{ animationDelay: "120ms" }}
            >
              Tell me what you need in your own words. I'll figure out the next steps.
            </p>
          </div>

          <form
            className="rise-in mt-8 rounded-xl border border-border bg-card p-3 shadow-panel transition-[box-shadow,border-color] duration-300 focus-within:border-border-strong focus-within:shadow-raised"
            style={{ animationDelay: "180ms" }}
            onSubmit={(e) => {
              e.preventDefault();
              submit(draft);
            }}
          >
            <label htmlFor="ai-input" className="sr-only">
              Tell me what you need
            </label>
            <div className="flex items-start gap-3 px-2 pt-2">
              <AiMark working={working} size={18} />
              <textarea
                id="ai-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    submit(draft);
                  }
                }}
                rows={2}
                placeholder="Tell me what you need..."
                className="min-h-16 w-full resize-none bg-transparent text-[1.02rem] text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 px-2 pb-1">
              <p className="hidden text-xs text-muted-foreground sm:block">
                Press Enter to send · I'll always ask before contacting anyone
              </p>
              <div className="ml-auto flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Use voice"
                  className="grid h-9 w-9 place-items-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
                >
                  <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                    <rect x="6" y="2" width="4" height="7" rx="2" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2" stroke="currentColor" strokeWidth="1.2" />
                  </svg>
                </button>
                <Button type="submit" disabled={!draft.trim()} aria-label="Send request">
                  Send <span aria-hidden="true">→</span>
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {starterPrompts.map((s, i) => (
              <button
                key={s}
                type="button"
                onClick={() => submit(s)}
                className="rise-in rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground shadow-subtle transition-[transform,color,border-color] duration-200 hover:-translate-y-px hover:border-border-strong hover:text-foreground"
                style={{ animationDelay: `${220 + i * 50}ms` }}
              >
                {s}
              </button>
            ))}
          </div>

          <div ref={workflowRef}>
            {prompt ? (
              <RequestWorkflow
                key={prompt + (activeId ?? "")}
                prompt={prompt}
                onStage={handleStage}
                onDecision={handleDecision}
              />
            ) : null}
          </div>
        </section>

        {/* Active requests */}
        <section className="mt-20">
          <SectionHead
            title="Active requests"
            hint={`${requests.length} in progress`}
          />
          {requests.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <p className="text-sm font-medium text-foreground">
                Nothing needs your attention right now.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tell me what you need help with whenever you're ready.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {requests.map((r, i) => (
                <div
                  key={r.id}
                  className="rise-in rounded-lg border border-border bg-card p-4 shadow-subtle transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-panel"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-foreground">
                        {r.title}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {r.service}
                        {r.note ? ` · ${r.note}` : ""}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2 py-0.5 text-[11px]",
                        r.status === "Waiting for your decision"
                          ? "border-foreground/70 text-foreground"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      {r.status}
                    </span>
                  </div>
                  <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground transition-[width] duration-700 ease-out"
                      style={{ width: `${Math.round(r.progress * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Recent activity + quick actions */}
        <section
          ref={activityReveal.ref}
          data-visible={activityReveal.visible}
          className="reveal mt-20 grid gap-12 md:grid-cols-[1.4fr_1fr]"
        >
          <div>
            <SectionHead title="Recent activity" hint="What I've been doing" />
            <ol className="relative border-l border-border pl-5">
              {recentActivity.map((a) => (
                <li key={a.id} className="relative pb-6 last:pb-0">
                  <span className="absolute -left-[23px] top-1.5 h-1.5 w-1.5 rounded-full bg-border-strong" />
                  <p className="text-sm text-foreground">{a.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {a.detail} · {a.when}
                  </p>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <SectionHead title="Quick actions" />
            <div className="grid gap-2">
              <QuickAction
                label="Request a service"
                hint="Start from the assistant"
                onClick={() =>
                  document.getElementById("ai-input")?.focus()
                }
              />
              <QuickLink to="/requests" label="View requests" hint="Everything in progress" />
              <QuickLink to="/messages" label="Messages" hint="Replies from providers" />
              <QuickAction label="Saved providers" hint="People you kept" />
            </div>
          </div>
        </section>

        {/* Discover */}
        <section
          ref={discoverReveal.ref}
          data-visible={discoverReveal.visible}
          className="reveal mt-20"
        >
          <SectionHead
            title="Recommended near you"
            hint="Based on what you've asked for"
          />
          <div className="grid gap-3 md:grid-cols-3">
            {recommendedNearby.map((p, i) => (
              <div key={p.id} style={{ transitionDelay: `${i * 90}ms` }}>
                <HomeProviderCard provider={p} showReason onView={setPreview} />
              </div>
            ))}
          </div>
        </section>
      </main>

      {preview ? (
        <ProviderPreview provider={preview} onClose={() => setPreview(null)} />
      ) : null}
    </div>
  );
}

function SectionHead({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
        {title}
      </h2>
      {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

function QuickAction({
  label,
  hint,
  onClick,
}: {
  label: string;
  hint: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-left shadow-subtle transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-border-strong hover:shadow-panel"
    >
      <span>
        <span className="block text-sm text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span
        aria-hidden="true"
        className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
      >
        →
      </span>
    </button>
  );
}

function QuickLink({
  to,
  label,
  hint,
}: {
  to: "/requests" | "/messages";
  label: string;
  hint: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 shadow-subtle transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-border-strong hover:shadow-panel"
    >
      <span>
        <span className="block text-sm text-foreground">{label}</span>
        <span className="block text-xs text-muted-foreground">{hint}</span>
      </span>
      <span
        aria-hidden="true"
        className="text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
      >
        →
      </span>
    </Link>
  );
}

function ProviderPreview({
  provider,
  onClose,
}: {
  provider: HomeProvider;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${provider.name} profile`}
      onClick={onClose}
    >
      <div
        className="rise-in w-full max-w-md rounded-t-xl border border-border bg-card p-6 shadow-raised sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-full border border-border-strong bg-surface text-sm font-semibold">
            {provider.initials}
          </span>
          <div>
            <h3 className="text-base font-semibold text-foreground">{provider.name}</h3>
            <p className="text-xs text-muted-foreground">{provider.service}</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
          {provider.description}
        </p>
        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-border pt-4 text-xs">
          <div>
            <dt className="text-muted-foreground">Rating</dt>
            <dd className="mt-0.5 text-foreground tabular-nums">
              ★ {provider.rating.toFixed(1)} ({provider.reviews})
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Distance</dt>
            <dd className="mt-0.5 text-foreground">{provider.distance}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Availability</dt>
            <dd className="mt-0.5 text-foreground">{provider.availability}</dd>
          </div>
        </dl>
        <p className="mt-4 text-xs text-muted-foreground">{provider.reason}</p>
        <div className="mt-5 flex gap-2">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose}>Ask the assistant about them</Button>
        </div>
      </div>
    </div>
  );
}
