import { useEffect, useState } from "react";
import { AiMark, AiWave } from "@/components/ai-mark";
import { Button } from "@/components/ui-kit";
import { HomeProviderCard } from "@/components/home-provider-card";
import {
  resolveIntent,
  getClarification,
  matchCategoryLabel,
  getMatchCategory,
  type HomeProvider,
  type ClarificationQuestion,
} from "@/lib/home-data";
import { cn } from "@/lib/utils";

/**
 * Simulated assistant workflow (keyboard mode):
 * understand → [clarify] → search → compare → recommend → ask permission.
 * It never contacts anyone; it stops and waits for explicit permission.
 */

export type Decision = "pending" | "approved" | "declined";

/**
 * Stages:
 *  0 echo          — show the user's request back
 *  1 understanding — "Understanding your request..."
 *  2 understood    — show interpretation summary
 *  3 clarify       — ask clarification question (if needed)
 *  4 finding       — "Finding suitable providers nearby..."
 *  5 found         — provider cards appear
 *  6 comparing     — "Comparing..."
 *  7 compared      — recommendation
 *  8 permission    — ask to contact
 */
const STAGE_LABELS = ["Understand", "Find", "Compare", "Recommend"] as const;

// Timings without clarification: stages 1-7
const STAGE_TIMINGS_NO_CLARIFY = [800, 1200, 900, 1300, 800, 1200, 600];
// Timings with clarification: stages 1-2, then pause for answer, then 4-8
const STAGE_TIMINGS_CLARIFY = [800, 1000];

export function RequestWorkflow({
  prompt,
  onStage,
  onDecision,
  onChatWithProvider,
}: {
  prompt: string;
  onStage: (stage: number) => void;
  onDecision: (decision: Exclude<Decision, "pending">) => void;
  onChatWithProvider?: (provider: HomeProvider) => void;
}) {
  const intent = resolveIntent(prompt);
  const clarification = getClarification(prompt, intent);

  const [stage, setStage] = useState(0);
  const [decision, setDecision] = useState<Decision>("pending");
  const [showMore, setShowMore] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<HomeProvider | null>(null);
  const [clarificationAnswer, setClarificationAnswer] = useState<string | null>(null);
  const [clarifyAnswered, setClarifyAnswered] = useState(false);

  useEffect(() => {
    setStage(0);
    setDecision("pending");
    setShowMore(false);
    setSelectedProvider(null);
    setClarificationAnswer(null);
    setClarifyAnswered(false);
  }, [prompt]);

  // Stage progression — pauses at clarification stage if needed
  useEffect(() => {
    if (clarification && stage === 2 && !clarifyAnswered) {
      // Wait at stage 2 (understood) then move to clarification
      const t = setTimeout(() => setStage(3), 800);
      return () => clearTimeout(t);
    }

    if (clarification && stage === 3 && !clarifyAnswered) {
      // Stay at clarification stage until answered
      return;
    }

    if (clarification && clarifyAnswered && stage === 3) {
      // Answer received → proceed to finding
      const t = setTimeout(() => setStage(4), 600);
      return () => clearTimeout(t);
    }

    if (!clarification && stage === 2) {
      // No clarification → skip to finding after showing understanding
      const t = setTimeout(() => setStage(4), 1000);
      return () => clearTimeout(t);
    }

    if (stage >= 8) return;

    // Normal progression for stages 1, 4-8
    const timings = clarification ? [800, 1000] : [800, 1200, 900, 1300, 800, 1200, 600];
    const adjustedStage = clarification ? stage - 4 : stage - 1;

    // For stages after clarification, adjust index
    let timing: number | undefined;
    if (stage === 1) timing = 800;
    else if (stage === 2) timing = 1000;
    else if (stage === 4) timing = 900;
    else if (stage === 5) timing = 1300;
    else if (stage === 6) timing = 800;
    else if (stage === 7) timing = 1200
    else if (stage === 8) return;

    if (timing === undefined) return;
    void adjustedStage;
    void timings;

    const t = setTimeout(() => setStage((s) => s + 1), timing);
    return () => clearTimeout(t);
  }, [stage, clarification, clarifyAnswered]);

  useEffect(() => {
    onStage(stage);
  }, [stage, onStage]);

  function handleClarifyAnswer(answer: string) {
    setClarificationAnswer(answer);
    setClarifyAnswered(true);
  }

  const show = (n: number) => stage >= n;
  const working = stage < 8 || decision === "pending";
  const recommended = intent.providers[0]!;
  const allProviders = [...intent.providers, ...intent.moreProviders];
  const activeProvider = selectedProvider ?? recommended;

  const trailIndex =
    stage <= (clarification ? 3 : 2) ? 0 : stage <= 5 ? 1 : stage <= 7 ? 2 : 3;

  // Build understanding summary
  const understandingLines: string[] = [intent.summary];
  if (clarificationAnswer) {
    understandingLines.push(`${clarification!.question.replace(/\?$/, "")}: ${clarificationAnswer.toLowerCase()}.`);
  }
  const priority = clarificationAnswer === "It's continuous" || (clarificationAnswer?.includes("Yes")) ? "Urgent" : "Normal";
  understandingLines.push(`Priority: ${priority}.`);

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

        {/* Understanding summary */}
        <WorkflowLine show={show(2)}>
          <div className="rounded-lg border border-border bg-surface p-3">
            <p className="mb-1.5 text-xs font-medium text-foreground">Here's what I understand:</p>
            <ul className="space-y-1">
              {understandingLines.map((line, i) => (
                <li key={i} className="text-xs leading-relaxed text-muted-foreground">
                  • {line}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              I'll use this to find suitable {intent.tradeLabel}s.
            </p>
          </div>
        </WorkflowLine>

        {/* Clarification question */}
        {clarification && show(3) && !clarifyAnswered ? (
          <div className="rise-in rounded-lg border border-border-strong bg-surface p-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border-strong bg-card">
                <AiMark working={false} size={14} />
              </span>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {clarification.question}
                </p>
                {clarification.options ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {clarification.options.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => handleClarifyAnswer(opt)}
                        className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground shadow-subtle transition-[transform,color,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-border-strong hover:text-foreground hover:shadow-panel"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {/* Clarification answer recorded */}
        {clarification && clarifyAnswered && show(3) ? (
          <WorkflowLine show>
            <span className="text-foreground">
              Got it — {clarificationAnswer}.
            </span>
          </WorkflowLine>
        ) : null}

        {/* Finding providers */}
        <WorkflowLine show={show(4)}>
          <span className="flex items-center gap-2">
            {stage === 4 ? (
              <>
                <ScanDot />
                Looking for {intent.tradeLabel}s who serve your area…
              </>
            ) : (
              <>I searched for {intent.tradeLabel}s in your area and found several options.</>
            )}
          </span>
        </WorkflowLine>

        {/* Provider cards */}
        {show(5) ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {intent.providers.length} of {allProviders.length} providers that match your request
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {intent.providers.map((p, i) => {
                const matchCat = getMatchCategory(intent, p.id);
                return (
                  <div
                    key={p.id}
                    className="rise-in"
                    style={{ animationDelay: `${i * 140}ms` }}
                  >
                    <HomeProviderCard
                      provider={p}
                      compact
                      scanning={stage === 6}
                      recommended={stage >= 7 && p.id === activeProvider.id}
                      dimmed={stage >= 7 && p.id !== activeProvider.id}
                      showWhy={stage >= 7 && p.id === activeProvider.id}
                      matchCategoryLabel={matchCat ? matchCategoryLabel(matchCat) : undefined}
                      onSelect={stage >= 8 ? () => {
                        setSelectedProvider(p);
                        setDecision("pending");
                      } : undefined}
                    />
                  </div>
                );
              })}
            </div>

            {/* Additional providers */}
            {showMore ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 pt-2">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">More providers</span>
                  <span className="h-px flex-1 bg-border" />
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  {intent.moreProviders.map((p, i) => {
                    const matchCat = getMatchCategory(intent, p.id);
                    return (
                      <div
                        key={p.id}
                        className="rise-in"
                        style={{ animationDelay: `${i * 140}ms` }}
                      >
                        <HomeProviderCard
                          provider={p}
                          compact
                          recommended={p.id === activeProvider.id && stage >= 7}
                          dimmed={stage >= 7 && p.id !== activeProvider.id}
                          showWhy={p.id === activeProvider.id && stage >= 8}
                          matchCategoryLabel={matchCat ? matchCategoryLabel(matchCat) : undefined}
                          onSelect={stage >= 8 ? () => {
                            setSelectedProvider(p);
                            setDecision("pending");
                          } : undefined}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* Comparing */}
        <WorkflowLine show={show(6)}>
          <span className="flex items-center gap-2">
            {stage === 6 ? (
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
        <WorkflowLine show={show(7)}>
          <span className="text-foreground">
            I found a provider who looks like a good fit —{" "}
            <span className="font-medium">{recommended.name}</span>.
            {" "}These are the most relevant matches from the {allProviders.length} I found nearby.
          </span>
        </WorkflowLine>

        {/* Permission step */}
        {show(8) ? (
          <div className="rise-in overflow-hidden rounded-lg border border-border-strong bg-surface p-4">
            {decision === "pending" ? (
              <>
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border-strong bg-card">
                    <AiMark working={false} size={14} />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Ready to contact {activeProvider.name}?
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
                  {!showMore ? (
                    <Button
                      variant="secondary"
                      onClick={() => setShowMore(true)}
                    >
                      See more providers
                    </Button>
                  ) : null}
                  {onChatWithProvider ? (
                    <Button
                      variant="ghost"
                      onClick={() => onChatWithProvider(activeProvider)}
                    >
                      Chat with provider
                    </Button>
                  ) : null}
                  {showMore || selectedProvider ? (
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedProvider(null);
                        setDecision("pending");
                      }}
                    >
                      Reset to recommendation
                    </Button>
                  ) : null}
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
                      ? `Got it. I'll contact ${activeProvider.name} and get back to you.`
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
          : clarification && stage === 3 && !clarifyAnswered
            ? "Waiting for your answer."
            : stage >= 8
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
