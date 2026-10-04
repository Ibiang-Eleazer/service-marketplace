import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { AppNav, AssistantStatus } from "@/components/app-nav";
import { Feed, DiscoverPeople } from "@/components/feed/feed";
import { HandsOffMode } from "@/components/hands-off/hands-off-mode";
import {
  assistantStateFromWorkflow,
  type WorkflowDecision,
} from "@/lib/assistant-state";
import { RequestWorkflow } from "@/components/request-workflow";
import { Button } from "@/components/ui-kit";
import {
  resolveIntent,
  starterPrompts,
  titleFor,
} from "@/lib/home-data";
import { useOnboarding } from "@/lib/onboarding-store";
import { useReveal } from "@/hooks/use-reveal";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Brand" },
      {
        name: "description",
        content:
          "Discover people, work, and ideas. Ask AI to turn what you see into something done.",
      },
      { property: "og:title", content: "Home — Brand" },
      {
        property: "og:description",
        content:
          "Discover people, work, and ideas. Ask AI to turn what you see into something done.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { customer } = useOnboarding();
  const firstName = customer.name.trim().split(" ")[0];

  const [aiOpen, setAiOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [focused, setFocused] = useState(false);
  const workflowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [handsOff, setHandsOff] = useState(false);
  const [workflowStage, setWorkflowStage] = useState<number | null>(null);
  const [workflowDecision, setWorkflowDecision] = useState<WorkflowDecision>("pending");
  const handsOffTriggerRef = useRef<HTMLButtonElement>(null);

  const exitHandsOff = useCallback(() => {
    setHandsOff(false);
    requestAnimationFrame(() => handsOffTriggerRef.current?.focus());
  }, []);

  function submit(text: string) {
    const value = text.trim();
    if (!value) return;
    const intent = resolveIntent(value);
    void intent;
    setPrompt(value);
    setWorkflowStage(0);
    setWorkflowDecision("pending");
    setDraft("");
    setWorking(true);
    requestAnimationFrame(() =>
      workflowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  }

  const handleStage = useCallback((stage: number) => {
    setWorking(stage < 7);
    setWorkflowStage(stage);
  }, []);

  const handleDecision = useCallback((decision: "approved" | "declined") => {
    setWorking(false);
    setWorkflowDecision(decision);
  }, []);

  const discoverReveal = useReveal<HTMLDivElement>(0.12);

  return (
    <div className="min-h-screen bg-background">
      <div inert={handsOff} aria-hidden={handsOff || undefined}>
      <AppNav
        working={working}
        statusLabel={working ? "Assistant is working…" : "Assistant ready"}
      />

      <main className="mx-auto w-full max-w-2xl px-5 pb-28 pt-8 md:px-8 md:pt-12">
        {/* Greeting */}
        <div className="mb-6">
          <AssistantStatus
            working={working}
            label={working ? "Assistant is working…" : "Assistant ready"}
            className="rise-in"
          />
          <h1
            className="rise-in mt-4 text-[1.75rem] font-semibold leading-[1.1] text-foreground md:text-[2rem]"
            style={{ animationDelay: "60ms" }}
          >
            {firstName ? `Hello, ${firstName}` : "Welcome back"}
          </h1>
          <p
            className="rise-in mt-1.5 text-sm text-muted-foreground"
            style={{ animationDelay: "120ms" }}
          >
            Discover people, work, and ideas from your network.
          </p>
        </div>

        {/* Feed */}
        <Feed />

        {/* Discover people */}
        <div
          ref={discoverReveal.ref}
          data-visible={discoverReveal.visible}
          className="reveal mt-8"
        >
          <DiscoverPeople />
        </div>
      </main>

      {/* AI floating action button */}
      <button
        type="button"
        onClick={() => setAiOpen(true)}
        aria-label="Ask AI for help"
        className="rise-in fixed bottom-6 left-1/2 z-30 flex h-12 -translate-x-1/2 items-center gap-2.5 rounded-full border border-border-strong bg-card px-5 shadow-raised transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-panel md:left-auto md:right-6 md:translate-x-0"
        style={{ animationDelay: "300ms" }}
      >
        <span className="grid h-6 w-6 place-items-center rounded-full bg-foreground text-[10px] font-bold text-background">
          AI
        </span>
        <span className="text-sm font-medium text-foreground">What can I get done?</span>
      </button>

      {/* AI panel */}
      {aiOpen ? (
        <AiPanel
          draft={draft}
          setDraft={setDraft}
          focused={focused}
          setFocused={setFocused}
          working={working}
          onSubmit={submit}
          prompt={prompt}
          workflowRef={workflowRef}
          inputRef={inputRef}
          onStage={handleStage}
          onDecision={handleDecision}
          onClose={() => setAiOpen(false)}
          onHandsOff={() => setHandsOff(true)}
          handsOffTriggerRef={handsOffTriggerRef}
        />
      ) : null}
      </div>

      <HandsOffMode
        open={handsOff}
        onExit={exitHandsOff}
        state={assistantStateFromWorkflow(workflowStage, workflowDecision)}
        requestLabel={prompt}
      />
    </div>
  );
}

function AiPanel({
  draft,
  setDraft,
  focused,
  setFocused,
  working,
  onSubmit,
  prompt,
  workflowRef,
  inputRef,
  onStage,
  onDecision,
  onClose,
  onHandsOff,
  handsOffTriggerRef,
}: {
  draft: string;
  setDraft: (v: string) => void;
  focused: boolean;
  setFocused: (v: boolean) => void;
  working: boolean;
  onSubmit: (text: string) => void;
  prompt: string | null;
  workflowRef: React.RefObject<HTMLDivElement | null>;
  inputRef: React.RefObject<HTMLTextAreaElement | null>;
  onStage: (stage: number) => void;
  onDecision: (decision: "approved" | "declined") => void;
  onClose: () => void;
  onHandsOff: () => void;
  handsOffTriggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/20 p-0 backdrop-blur-[2px] sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="AI assistant"
      onClick={onClose}
    >
      <div
        className="rise-in flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-xl border border-border bg-card shadow-raised sm:rounded-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-foreground text-[10px] font-bold text-background">
              AI
            </span>
            <span className="text-sm font-semibold text-foreground">Assistant</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Input */}
          <form
            className={cn(
              "overflow-hidden rounded-xl border bg-background shadow-subtle transition-[box-shadow,border-color] duration-300",
              focused ? "border-border-strong shadow-panel" : "border-border",
            )}
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(draft);
            }}
          >
            <label htmlFor="ai-input" className="sr-only">
              Tell me what you need
            </label>
            <div className="flex items-start gap-3 px-4 pt-4">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-foreground text-[8px] font-bold text-background">
                AI
              </span>
              <textarea
                id="ai-input"
                ref={inputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    onSubmit(draft);
                  }
                }}
                rows={2}
                placeholder="My kitchen sink is leaking..."
                className="min-h-16 w-full resize-none bg-transparent text-[1.05rem] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-2">
              <p className="hidden text-xs text-muted-foreground sm:block">
                I'll always ask before contacting anyone
              </p>
              <div className="ml-auto flex items-center gap-2">
                <button
                  ref={handsOffTriggerRef}
                  type="button"
                  onClick={onHandsOff}
                  aria-label="Switch to hands-off mode"
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground transition-[color,border-color,background-color] duration-200 hover:border-border-strong hover:bg-accent hover:text-foreground"
                >
                  Hands-off
                </button>
                <Button type="submit" disabled={!draft.trim()} aria-label="Send request">
                  Send <span aria-hidden="true">→</span>
                </Button>
              </div>
            </div>
          </form>

          {/* Example prompts */}
          <div className="mt-4 flex flex-wrap gap-2">
            {starterPrompts.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSubmit(s)}
                className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground shadow-subtle transition-[transform,color,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-border-strong hover:text-foreground hover:shadow-panel"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Workflow output */}
          <div ref={workflowRef} className="mt-4">
            {prompt ? (
              <RequestWorkflow
                key={prompt}
                prompt={prompt}
                onStage={onStage}
                onDecision={onDecision}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
