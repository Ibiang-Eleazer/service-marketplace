import { useEffect, useImperativeHandle, useState, type Ref } from "react";
import { demoProviders } from "@/lib/mock-providers";
import { ProviderCard, type CardState } from "@/components/provider-card";
import { AiMark, AiWave } from "@/components/ai-mark";
import { cn } from "@/lib/utils";

export type DemoHandle = { replay: () => void };

const REQUEST = "My sink is leaking.";

/**
 * Phases:
 * 1 typing · 2 understanding · 3 identified · 4 searching · 5 cards
 * 6 comparing · 7 recommend · 8 ask (hold) · 9 fading out before loop
 */
const TIMELINE: [number, number][] = [
  [200, 1],
  [1600, 2],
  [2700, 3],
  [3400, 4],
  [5100, 5],
  [6700, 6],
  [8500, 7],
  [9900, 8],
  [15500, 9],
];
const LOOP_AT = 16200;

const STAGES = ["Understand", "Search", "Compare", "Recommend", "Ask"];

const CARD_H = 104; // px incl. gap
// Display order after comparison: Marcus, Ada, Northside
const RANK_INITIAL = [0, 1, 2];
const RANK_SORTED = [0, 2, 1];

export function AssistantDemo({ handleRef }: { handleRef?: Ref<DemoHandle> }) {
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState(0);
  const [typed, setTyped] = useState(0);

  useImperativeHandle(handleRef, () => ({ replay: () => setRun((r) => r + 1) }));

  useEffect(() => {
    setPhase(0);
    setTyped(0);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = TIMELINE.map(([t, p]) => setTimeout(() => setPhase(p), t));
    const typeStart = TIMELINE[0]![0] + 150;
    if (reduced) {
      timers.push(setTimeout(() => setTyped(REQUEST.length), typeStart));
    } else {
      for (let i = 1; i <= REQUEST.length; i++) {
        timers.push(setTimeout(() => setTyped(i), typeStart + i * 58));
      }
    }
    timers.push(setTimeout(() => setRun((r) => r + 1), LOOP_AT));
    return () => timers.forEach(clearTimeout);
  }, [run]);

  const stageIndex =
    phase <= 1 ? -1 : phase <= 3 ? 0 : phase <= 5 ? 1 : phase === 6 ? 2 : phase === 7 ? 3 : 4;

  const status: Record<number, { text: string; working: boolean }> = {
    2: { text: "Understanding your request…", working: true },
    3: { text: "Understanding your request…", working: true },
    4: { text: "Looking for relevant providers nearby…", working: true },
    5: { text: "Found 3 providers that match.", working: false },
    6: { text: "Comparing your options…", working: true },
    7: { text: "Here's who I'd recommend.", working: false },
    8: { text: "Would you like me to contact Marcus?", working: false },
    9: { text: "Would you like me to contact Marcus?", working: false },
  };
  const current = status[phase];

  const rank = phase >= 6 ? RANK_SORTED : RANK_INITIAL;
  const cardState = (i: number): CardState => {
    if (phase === 6) return "compare";
    if (phase >= 7) return i === 0 ? "recommended" : "dimmed";
    return "idle";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-raised">
      {/* Window chrome + stage trail */}
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-2.5">
        <span className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <AiMark working={!!current?.working} size={14} />
          Assistant
        </span>
        <ol className="hidden items-center gap-1 sm:flex" aria-label="Assistant stages">
          {STAGES.map((s, i) => (
            <li key={s} className="flex items-center gap-1">
              <span
                className={cn(
                  "font-mono text-[10px] uppercase tracking-wider transition-colors duration-500",
                  i === stageIndex
                    ? "text-foreground"
                    : i < stageIndex
                      ? "text-muted-foreground"
                      : "text-border-strong",
                )}
              >
                {s}
              </span>
              {i < STAGES.length - 1 ? (
                <span
                  className={cn(
                    "h-px w-3 transition-colors duration-500",
                    i < stageIndex ? "bg-muted-foreground" : "bg-border",
                  )}
                />
              ) : null}
            </li>
          ))}
        </ol>
      </div>

      <div
        className={cn(
          "space-y-4 p-5 transition-opacity duration-700 md:p-6",
          phase === 9 ? "opacity-0" : "opacity-100",
        )}
      >
        {/* User message */}
        <div className="flex h-9 justify-end">
          {phase >= 1 ? (
            <p className="rise-in rounded-lg rounded-br-sm bg-primary px-3.5 py-2 text-sm text-primary-foreground">
              {REQUEST.slice(0, typed)}
              {typed < REQUEST.length ? (
                <span className="caret ml-px inline-block h-3.5 w-px translate-y-0.5 bg-primary-foreground" />
              ) : null}
            </p>
          ) : null}
        </div>

        {/* AI status line */}
        <div className="flex min-h-6 items-center gap-2.5">
          {current ? (
            <div key={current.text} className="rise-in flex items-center gap-2.5">
              <AiMark working={current.working} size={16} />
              <p
                className={cn(
                  "text-sm",
                  current.working ? "text-muted-foreground" : "font-medium text-foreground",
                )}
              >
                {current.text}
              </p>
              {current.working ? <AiWave /> : null}
            </div>
          ) : null}
        </div>

        {/* Interpretation chips */}
        <div className="flex h-6 flex-wrap gap-1.5">
          {phase >= 3
            ? ["Plumbing", "Leak repair", "Nearby", "Soon"].map((c, i) => (
                <span
                  key={c}
                  className="rise-in rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-foreground"
                  style={{ animationDelay: `${i * 90}ms` }}
                >
                  {c}
                </span>
              ))
            : null}
        </div>

        {/* Stage: map → cards */}
        <div className="relative h-[316px]">
          <ProximityMap active={phase === 4} visible={phase >= 4 && phase < 5} />

          {phase >= 5 ? (
            <div className="absolute inset-0">
              {demoProviders.map((p, i) => (
                <div
                  key={p.name}
                  className="absolute inset-x-0 top-0 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                  style={{ transform: `translateY(${rank.indexOf(i) * CARD_H}px)` }}
                >
                  <div className="rise-in" style={{ animationDelay: `${i * 160}ms` }}>
                    <ProviderCard provider={p} state={cardState(i)} className="h-[92px]" />
                  </div>
                </div>
              ))}
              {phase === 6 ? (
                <span
                  aria-hidden="true"
                  className="scan-sweep pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-foreground/[0.05] to-transparent"
                />
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Permission */}
        <div className="flex h-9 items-center gap-2">
          {phase >= 8 ? (
            <>
              <span className="rise-in inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground">
                Yes, contact Marcus
              </span>
              <span
                className="rise-in inline-flex h-8 items-center rounded-md border border-border-strong px-3 text-xs font-medium text-foreground"
                style={{ animationDelay: "80ms" }}
              >
                Not yet
              </span>
              <span
                className="rise-in ml-auto hidden text-[11px] text-muted-foreground md:inline"
                style={{ animationDelay: "200ms" }}
              >
                Nothing happens without you.
              </span>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const DOTS = [
  { x: 28, y: 34, d: 300 },
  { x: 71, y: 28, d: 700 },
  { x: 62, y: 72, d: 1100 },
  { x: 20, y: 70, d: 1400, faint: true },
  { x: 82, y: 55, d: 1500, faint: true },
];

export function ProximityMap({ active, visible }: { active: boolean; visible: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "absolute inset-0 overflow-hidden rounded-lg border border-border bg-surface transition-[opacity,transform] duration-500",
        visible ? "scale-100 opacity-100" : "pointer-events-none scale-[0.98] opacity-0",
      )}
    >
      {/* grid */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute left-1/2 top-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2">
        {active ? (
          <>
            <span className="ai-ring absolute inset-0 rounded-full border border-foreground/30" />
            <span
              className="ai-ring absolute inset-0 rounded-full border border-foreground/20"
              style={{ animationDelay: "0.8s" }}
            />
            <span
              className="ai-ring absolute inset-0 rounded-full border border-foreground/15"
              style={{ animationDelay: "1.6s" }}
            />
          </>
        ) : null}
        <span className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground shadow-panel" />
      </div>
      {active
        ? DOTS.map((dot) => (
            <span
              key={`${dot.x}-${dot.y}`}
              className={cn(
                "pop-in absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card",
                dot.faint ? "bg-border-strong" : "bg-muted-foreground",
              )}
              style={{ left: `${dot.x}%`, top: `${dot.y}%`, animationDelay: `${dot.d}ms` }}
            />
          ))
        : null}
      <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        Within 5 km
      </span>
    </div>
  );
}
