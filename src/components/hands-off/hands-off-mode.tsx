import { useEffect, useRef, useState } from "react";
import {
  AssistantOrb,
  type AudioLevelSource,
} from "@/components/hands-off/assistant-orb";
import { AssistantStateIndicator } from "@/components/hands-off/assistant-state-indicator";
import { ExitHandsOffButton } from "@/components/hands-off/exit-hands-off-button";
import {
  ASSISTANT_STATES,
  ASSISTANT_STATE_META,
  type AssistantState,
} from "@/lib/assistant-state";
import { cn } from "@/lib/utils";

const EXIT_DURATION_MS = 280;
const PREVIEW_STEP_MS = 3200;

/**
 * Immersive voice-style surface. It only renders on top of the keyboard
 * interface, which stays mounted underneath so no conversation state is lost.
 */
export function HandsOffMode({
  open,
  onExit,
  state,
  requestLabel,
  getAudioLevel,
}: {
  open: boolean;
  onExit: () => void;
  /** State driven by the assistant workflow. */
  state: AssistantState;
  /** The request currently being worked on, if any. */
  requestLabel?: string | null;
  getAudioLevel?: AudioLevelSource;
}) {
  const [present, setPresent] = useState(open);
  const [previewState, setPreviewState] = useState<AssistantState | null>(null);
  const [autoplay, setAutoplay] = useState(false);
  const exitRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (open) {
      setPresent(true);
      return;
    }
    const t = setTimeout(() => {
      setPresent(false);
      setPreviewState(null);
      setAutoplay(false);
    }, EXIT_DURATION_MS);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    exitRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onExit]);

  useEffect(() => {
    if (!autoplay) return;
    const t = setInterval(() => {
      setPreviewState((current) => {
        const index = current ? ASSISTANT_STATES.indexOf(current) : -1;
        return (
          ASSISTANT_STATES[(index + 1) % ASSISTANT_STATES.length] ?? "idle"
        );
      });
    }, PREVIEW_STEP_MS);
    return () => clearInterval(t);
  }, [autoplay]);

  if (!present) return null;

  const shownState = previewState ?? state;
  const following = previewState === null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hands-off assistant"
      data-state={open ? "open" : "closed"}
      className="handsoff-surface fixed inset-0 z-[60] flex flex-col bg-background"
    >
      <header className="flex h-14 items-center justify-between gap-4 px-5 md:px-8">
        <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-foreground"
          />
          Hands-off
        </span>
        <ExitHandsOffButton ref={exitRef} onExit={onExit} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 pb-6">
        <div className="handsoff-orb aspect-square w-[min(78vw,52vh,440px)]">
          <AssistantOrb state={shownState} getAudioLevel={getAudioLevel} />
        </div>

        <AssistantStateIndicator state={shownState} />

        {requestLabel ? (
          <p className="max-w-md truncate text-center text-xs text-muted-foreground">
            <span className="sr-only">Current request: </span>
            {`\u201C${requestLabel}\u201D`}
          </p>
        ) : null}
      </main>

      <footer className="flex flex-col items-center gap-3 px-5 pb-6">
        <div
          role="group"
          aria-label="Preview assistant states"
          className="flex max-w-full flex-wrap items-center justify-center gap-1"
        >
          <StateChip
            active={following && !autoplay}
            onClick={() => {
              setAutoplay(false);
              setPreviewState(null);
            }}
          >
            Live
          </StateChip>
          <span aria-hidden="true" className="mx-1 h-3 w-px bg-border" />
          {ASSISTANT_STATES.map((s) => (
            <StateChip
              key={s}
              active={previewState === s}
              onClick={() => {
                setAutoplay(false);
                setPreviewState(s);
              }}
            >
              {ASSISTANT_STATE_META[s].label}
            </StateChip>
          ))}
          <span aria-hidden="true" className="mx-1 h-3 w-px bg-border" />
          <StateChip
            active={autoplay}
            onClick={() => {
              if (autoplay) {
                setAutoplay(false);
                return;
              }
              setPreviewState((c) => c ?? "idle");
              setAutoplay(true);
            }}
          >
            {autoplay ? "Stop" : "Play all"}
          </StateChip>
        </div>
        <p className="text-[11px] text-muted-foreground">
          Voice input is coming soon. Your conversation is kept when you switch
          back.
        </p>
      </footer>
    </div>
  );
}

function StateChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider transition-colors duration-200",
        active
          ? "bg-foreground text-background"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
