import { useEffect, useState } from "react";
import { AiMark, AiWave } from "@/components/ai-mark";
import { Button } from "@/components/ui-kit";
import { HomeProviderCard } from "@/components/home-provider-card";
import { resolveIntent } from "@/lib/home-data";
import { cn } from "@/lib/utils";

/**
 * Simulated assistant workflow: understand → search → compare → recommend → ask.
 * It never contacts anyone; it stops and waits for explicit permission.
 */

export type Decision = "pending" | "approved" | "declined";

/** 0 echo, 1 understanding, 2 diagnosis, 3 searching, 4 providers, 5 comparing, 6 recommend, 7 ask */
const TIMINGS = [450, 1300, 1100, 1500, 900, 1400, 850];

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
    if (stage >= TIMINGS.length) return;
    const t = setTimeout(() => setStage((s) => s + 1), TIMINGS[stage]);
    return () => clearTimeout(t);
  }, [stage]);

  useEffect(() => {
    onStage(stage);
  }, [stage, onStage]);

  const show = (n: number) => stage >= n;
  const working = stage < 7 || decision === "pending";

  return (
    <div className="rise-in mt-6 overflow-hidden rounded-xl border border-border bg-card shadow-panel">
      {/* the user's own words */}
      <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
        <p className="text-sm font-medium text-foreground">“{prompt}”</p>
        <span className="shrink-0 text-xs text-muted-foreground">Just now</span>
      </div>

      <div className="space-y-4 px-5 py-5">
        <Line show={show(1)}>
          <span className="flex items-center gap-2">
            <AiMark working={stage === 1} size={16} />
            {stage === 1 ? (
              <>
                Understanding your request…
                <AiWave />
              </>
            ) : (
              <>Understood — {intent.service.toLowerCase()}.</>
            )}
          </span>
        </Line>

        <Line show={show(2)}>
          <span className="text-foreground">{intent.summary}</span>
        </Line>

        <Line show={show(3)}>
          <span className="flex items-center gap-2">
            {stage === 3 ? (
              <>
                <ScanDot />
                Finding relevant providers near you…
              </>
            ) : (
              <>Found {intent.providers.length} providers nearby.</>
            )}
          </span>
        </Line>

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
                />
              </div>
            ))}
          </div>
        ) : null}

        <Line show={show(5)}>
          <span className="flex items-center gap-2">
            {stage === 5 ? (
              <>
                Comparing your options…
                <AiWave />
              </>
            ) : (
              <>Compared on distance, availability and reputation.</>
            )}
          </span>
        </Line>

        <Line show={show(6)}>
          <span className="text-foreground">
            Here are the providers I'd consider. {intent.providers[0]!.name} looks
            like the strongest fit.
          </span>
        </Line>

        {show(7) ? (
          <div className="rise-in rounded-lg border border-border-strong bg-surface p-4">
            {decision === "pending" ? (
              <>
                <p className="text-sm font-medium text-foreground">
                  Would you like me to contact one of them?
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  I won't reach out to anyone until you say so.
                </p>
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <Button
                    onClick={() => {
                      setDecision("approved");
                      onDecision("approved");
                    }}
                  >
                    Yes, continue
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setDecision("declined");
                      onDecision("declined");
                    }}
                  >
                    Not yet
                  </Button>
                </div>
              </>
            ) : (
              <p className="rise-in text-sm text-foreground">
                {decision === "approved"
                  ? "Got it. I'll help you with the next step."
                  : "No problem. I'll keep this request ready for whenever you decide."}
              </p>
            )}
          </div>
        ) : null}
      </div>

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

function Line({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <p className="rise-in text-sm text-muted-foreground">{children}</p>
  );
}

function ScanDot() {
  return (
    <span
      aria-hidden="true"
      className={cn("relative inline-grid h-4 w-4 place-items-center")}
    >
      <span className="ai-ring absolute inset-0 rounded-full border border-foreground/40" />
      <span className="h-1 w-1 rounded-full bg-foreground" />
    </span>
  );
}
