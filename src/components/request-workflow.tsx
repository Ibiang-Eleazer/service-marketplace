import { useEffect, useState } from "react";
import { AiMark, AiWave } from "@/components/ai-mark";
import { Button } from "@/components/ui-kit";
import { HomeProviderCard } from "@/components/home-provider-card";
import { resolveIntent, type HomeProvider } from "@/lib/home-data";
import { cn } from "@/lib/utils";

/**
 * Simulated assistant workflow:
 * understand → find → compare → recommend → ask permission.
 * It never contacts anyone; it stops and waits for explicit permission.
 */

export type Decision = "pending" | "approved" | "declined";

/**
 * Stages:
 * 0 echo          — show the user's request back
 * 1 understanding — "Understanding your request..."
 * 2 understood    — "You need help with a leaking kitchen sink."
 * 3 finding       — "Finding suitable providers nearby..."
 * 4 found         — "I found 3 providers who can help."
 * 5 comparing     — "Comparing availability, experience and relevant skills..."
 * 6 compared      — "I've compared your options."
 * 7 recommending  — Show the recommended provider + ask
 */
const STAGE_LABELS = [
  "Understand",
  "Find",
  "Compare",
  "Recommend",
] as const;

const STAGE_TIMINGS = [600, 1400, 900, 1300, 800, 1200, 600];

export function RequestWorkflow({
  prompt,
  onStage,
  onDecision,
}: {
  prompt: string;
  onStage: (stage: number) => void;
  onDecision: (decision: Exclude<Decision, "pending">) => void;
}) {
  const intent = resolveIntent(prompt);
  const [stage, setStage] = useState(0);
  const [decision, setDecision] = useState<Decision>("pending");

  useEffect(() => {
    setStage(0);
    setDecision("pending");
  }, [prompt]);

  useEffect(() => {
    if (stage >= STAGE_TIMINGS.length) return;
    const t = setTimeout(() => setStage((s) => s + 1), STAGE_TIMINGS[stage]);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    onStage(stage);
  }, [stage, onStage]);

  const show = (n: number) => stage >= n;
  const working = stage < 7 || decision === "pending";
  const recommended = intent.providers[0]!;

  // Map internal stage to the stage-trail indicator
  const trailIndex =
    stage <= 2 ? 0 : stage <= 4 ? 1 : stage <= 6 ? 2 : 3;

  return (
    <div className="rise-in mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-panel">
      {/* Stage trail */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-3">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <AiMark working={working && decision === "pending"} size={14} />
          Assistant
        </span>
        <ol className="hidden items-center gap-1 sm:flex" aria-label="Assistant stages">
          {STAGE_LABELS.map((s, i) => (
            <li key={s} className="flex items-center gap-1">
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-wider transition-colors duration-500",
                  i === trailIndex
                    ? "text-foreground"
                    : i < trailIndex
                      ? "text-muted-foreground"
                      : "text-border-strong",
                )}
              >
                {s}
              </span>
              {i < STAGE_LABELS.length - 1 ? (
                <span
                  className={cn(
                    "h-px w-3 transition-colors duration-500",
                    i < trailIndex ? "bg-muted-foreground" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      {/* User's request echo */}
      <div className="border-b border-border bg-surface px-5 py-3.5">
        <p className="text-sm font-medium text-foreground">"{prompt}"</p>
        <span className="mt-0.5 block text-xs text-muted-foreground">Just now</span>
      </div>

      <div className="space-y-4 px-5 py-5">
        {/* Understanding */}
        <WorkflowLine show={show(1)}>
          <span className="flex items-center gap-2">
            <AiMark working={stage === 1} size={15} />
            {stage === 1 ? (
              <>
                Understanding your request…
                <AiWave />
              </>
            ) : (
              <>Understood your request.</>
            )}
          </span>
        </WorkflowLine>

        {/* Understood — what it means */}
        <WorkflowLine show={show(2)}>
          <span className="text-foreground">
            {intent.summary}
          </span>
        </WorkflowLine>

        {/* Finding providers */}
        <WorkflowLine show={show(3)}>
          <span className="flex items-center gap-2">
            {stage === 3 ? (
              <>
                <ScanDot />
                Looking for {intent.tradeLabel}s who serve your area…
              </>
            ) : (
              <>Found {intent.providers.length} {intent.tradeLabel}s nearby.</>
            )}
          </span>
        </WorkflowLine>

        {/* Provider cards appear */}
        {show(4) ? (
          <div className="grid gap-3 md:grid-cols-3">
            {intent.providers.map((p, i) => (
              <div
                key={p.id}
                className="rise-in"
                style={{ animationDelay: `${i * 140}ms` }}
              >
                <HomeProviderCard
                  provider={p}
                  compact
                  scanning={stage === 5}
                  recommended={stage >= 6 && i === 0}
                  dimmed={stage >= 6 && i !== 0}
                  showWhy={stage >= 6 && i === 0}
                />
              </div>
            ))}
          </div>
        ) : null}

        {/* Comparing */}
        <WorkflowLine show={show(5)}>
          <span className="flex items-center gap-2">
            {stage === 5 ? (
              <>
                <AiMark working size={15} />
                Checking experience with {intent.service.toLowerCase()} repairs, availability and distance…
                <AiWave />
              </>
            ) : (
              <>Compared on availability, experience, distance and reputation.</>
            )}
          </span>
        </WorkflowLine>

        {/* Recommendation */}
        <WorkflowLine show={show(6)}>
          <span className="text-foreground">
            I found a provider who looks like a good fit —{" "}
            <span className="font-medium">{recommended.name}</span>.
          </span>
        </WorkflowLine>

        {/* Permission step */}
        {show(7) ? (
          <div className="rise-in overflow-hidden rounded-lg border border-border-strong bg-surface p-4">
            {decision === "pending" ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border-strong bg-card">
                    <AiMark working={false} size={14} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Ready to contact {recommended.name}?
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      I'll reach out on your behalf and set up the next step. Nothing happens until you say so.
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      setDecision("approved");
                      onDecision("approved");
                    }}
                  >
                    Contact provider
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDecision("declined");
                      onDecision("declined");
                    }}
                  >
                    Choose another
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-start gap-3">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border-strong bg-card">
                  <AiMark working={false} size={14} />
                </span>
                <div>
                  <p className="rise-in text-sm font-medium text-foreground">
                    {decision === "approved"
                      ? `Got it. I'll contact ${recommended.name} and get back to you.`
                      : "No problem. I'll keep this request ready for whenever you decide."}
                  </p>
                  <p className="rise-in mt-1 text-xs text-muted-foreground">
                    {decision === "approved"
                      ? "You'll get a message when they respond."
                      : "Your other options are still saved above."}
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* Footer status */}
      <div className="flex items-center gap-2 border-t border-border bg-surface px-5 py-2.5 text-xs text-muted-foreground">
        <AiMark working={working && decision === "pending"} size={12} />
        {decision !== "pending"
          ? "Ready when you are."
          : stage >= 7
            ? "Waiting for your decision."
            : "Assistant is working…"}
      </div>
    </div>
  );
}

function WorkflowLine({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <p className="rise-in text-sm text-muted-foreground">{children}</p>
  );
}

function ScanDot() {
  return (
    <span
      aria-hidden="true"
      className="relative inline-grid h-4 w-4 place-items-center"
    >
      <span className="ai-ring absolute inset-0 rounded-full border border-foreground/40" />
      <span className="h-1 w-1 rounded-full bg-foreground" />
    </span>
  );
}
