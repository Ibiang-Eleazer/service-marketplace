import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useRef, useState } from "react";
import { AppNav, AssistantStatus } from "@/components/app-nav";
import { AiMark, AiWave } from "@/components/ai-mark";
import { HandsOffMode } from "@/components/hands-off/hands-off-mode";
import {
  assistantStateFromWorkflow,
  type WorkflowDecision,
} from "@/lib/assistant-state";
import { RequestWorkflow } from "@/components/request-workflow";
import { Button } from "@/components/ui-kit";
import { resolveIntent, starterPrompts } from "@/lib/home-data";
import { useOnboarding } from "@/lib/onboarding-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Assistant — Brand" },
      {
        name: "description",
        content: "Talk to your AI assistant. Find professionals, get help, turn ideas into action.",
      },
      { property: "og:title", content: "Assistant — Brand" },
      {
        property: "og:description",
        content: "Talk to your AI assistant. Find professionals, get help, turn ideas into action.",
      },
    ],
  }),
  component: AssistantPage,
});

type Message = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type ConversationState = "idle" | "listening" | "working";

function AssistantPage() {
  const { customer } = useOnboarding();
  const firstName = customer.name.trim().split(" ")[0];
  const context = Route.useSearch({ select: (s) => (s as { context?: string })?.context });

  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [prompt, setPrompt] = useState<string | null>(null);
  const [working, setWorking] = useState(false);
  const [focused, setFocused] = useState(false);
  const [conversationState, setConversationState] = useState<ConversationState>("idle");
  const workflowRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [handsOff, setHandsOff] = useState(false);
  const [workflowStage, setWorkflowStage] = useState<number | null>(null);
  const [workflowDecision, setWorkflowDecision] = useState<WorkflowDecision>("pending");
  const handsOffTriggerRef = useRef<HTMLButtonElement>(null);
  const contextConsumed = useRef(false);

  const exitHandsOff = useCallback(() => {
    setHandsOff(false);
    requestAnimationFrame(() => handsOffTriggerRef.current?.focus());
  }, []);

  function submit(text: string) {
    const value = text.trim();
    if (!value) return;

    const userMsg: Message = { id: `u-${Date.now()}`, role: "user", text: value };
    setMessages((prev) => [...prev, userMsg]);
    setDraft("");

    const intent = resolveIntent(value);
    void intent;

    setConversationState("working");
    setWorking(true);

    // Simulate assistant acknowledging before starting the workflow
    setTimeout(() => {
      const ackMsg: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: "Let me help with that. I'll figure out what you need and find the right people.",
      };
      setMessages((prev) => [...prev, ackMsg]);
      setPrompt(value);
      setWorkflowStage(0);
      setWorkflowDecision("pending");
      setConversationState("idle");
      requestAnimationFrame(() => {
        workflowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
      });
    }, 800);
  }

  const handleStage = useCallback((stage: number) => {
    setWorking(stage < 7);
    setWorkflowStage(stage);
  }, []);

  const handleDecision = useCallback((decision: "approved" | "declined") => {
    setWorking(false);
    setWorkflowDecision(decision);
    const outcomeMsg: Message = {
      id: `a-done-${Date.now()}`,
      role: "assistant",
      text: decision === "approved"
        ? "I'll contact them now. You'll get a message when they respond."
        : "No problem. I'll keep this ready for whenever you decide.",
    };
    setMessages((prev) => [...prev, outcomeMsg]);
    requestAnimationFrame(() => {
      scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    });
  }, []);

  // Consume context from feed navigation (e.g. "Ask AI about this post")
  if (context && !contextConsumed.current && messages.length === 0) {
    contextConsumed.current = true;
    const contextMsg: Message = {
      id: `ctx-${Date.now()}`,
      role: "assistant",
      text: context,
    };
    setMessages([contextMsg]);
    setConversationState("listening");
  }

  return (
    <div className="min-h-screen bg-background">
      <div inert={handsOff} aria-hidden={handsOff || undefined}>
      <AppNav
        working={working}
        statusLabel={working ? "Assistant is working…" : "Assistant ready"}
      />

      {/* Three-column layout matching Home */}
      <div className="mx-auto flex w-full max-w-[1400px] gap-0 px-5 md:px-8">
        {/* Left spacer to align with feed layout */}
        <div className="hidden w-56 shrink-0 lg:block" />

        {/* Center — conversation workspace */}
        <main className="flex min-h-[calc(100vh-3.5rem)] min-w-0 flex-1 flex-col border-x border-border">
          {/* Header */}
          <div className="sticky top-14 z-10 border-b border-border bg-background/85 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <span className="grid h-8 w-8 place-items-center rounded-full border border-border-strong bg-card">
                <AiMark working={working} size={16} />
              </span>
              <div>
                <h1 className="text-[15px] font-semibold text-foreground">Assistant</h1>
                <p className="text-xs text-muted-foreground">
                  {working ? "Working on your request…" : "Ask me anything, or describe what you need done"}
                </p>
              </div>
              <div className="ml-auto">
                <AssistantStatus
                  working={working}
                  label={working ? "Working…" : "Ready"}
                  className="hidden sm:inline-flex"
                />
              </div>
            </div>
          </div>

          {/* Conversation scroll area */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto">
            <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
              {/* Empty state — greeting + suggestions */}
              {messages.length === 0 && !context ? (
                <div className="rise-in flex flex-col items-center justify-center py-12 text-center">
                  <span className="grid h-14 w-14 place-items-center rounded-full border border-border-strong bg-card shadow-subtle">
                    <AiMark working={false} size={28} />
                  </span>
                  <h2 className="mt-5 text-xl font-semibold text-foreground">
                    {firstName ? `Hi ${firstName}.` : "Hi there."}
                  </h2>
                  <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">
                    I can help you find professionals, understand a problem, turn an idea into a task, or explore work from people on the platform.
                  </p>
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {starterPrompts.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => submit(s)}
                        className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs text-muted-foreground shadow-subtle transition-[transform,color,border-color,box-shadow] duration-200 hover:-translate-y-px hover:border-border-strong hover:text-foreground hover:shadow-panel"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Context message (from feed) */}
              {context && messages.length > 0 && messages[0]?.text === context ? (
                <div className="rise-in mb-4 rounded-lg border border-border bg-surface px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    From the feed
                  </p>
                  <p className="mt-1.5 text-sm text-foreground">{context}</p>
                </div>
              ) : null}

              {/* Messages */}
              {messages.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {messages.map((msg) => (
                    <MessageBubble key={msg.id} msg={msg} />
                  ))}
                </div>
              ) : null}

              {/* Workflow output */}
              <div ref={workflowRef} className="mt-4">
                {prompt ? (
                  <RequestWorkflow
                    key={prompt}
                    prompt={prompt}
                    onStage={handleStage}
                    onDecision={handleDecision}
                  />
                ) : null}
              </div>

              {/* Listening indicator */}
              {conversationState === "listening" ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <AiMark working size={16} />
                  <AiWave />
                </div>
              ) : null}
            </div>
          </div>

          {/* Input bar — sticky at bottom of conversation */}
          <div className="sticky bottom-0 border-t border-border bg-background/85 px-4 py-3 backdrop-blur-xl md:px-6">
            <div className="mx-auto max-w-2xl">
              <form
                className={cn(
                  "flex items-end gap-2 rounded-xl border bg-card px-3 py-2 shadow-subtle transition-[box-shadow,border-color] duration-300",
                  focused ? "border-border-strong shadow-panel" : "border-border",
                )}
                onSubmit={(e) => {
                  e.preventDefault();
                  submit(draft);
                }}
              >
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-foreground text-[8px] font-bold text-background">
                  AI
                </span>
                <textarea
                  ref={inputRef}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submit(draft);
                    }
                  }}
                  rows={1}
                  placeholder="Describe what you need…"
                  className="min-h-7 max-h-32 flex-1 resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    ref={handsOffTriggerRef}
                    type="button"
                    onClick={() => setHandsOff(true)}
                    aria-label="Switch to hands-off mode"
                    className="inline-flex h-8 items-center rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:border-border-strong hover:bg-accent hover:text-foreground"
                  >
                    Hands-off
                  </button>
                  <Button type="submit" disabled={!draft.trim()} aria-label="Send message">
                    Send <span aria-hidden="true">→</span>
                  </Button>
                </div>
              </form>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                I'll always ask before contacting anyone
              </p>
            </div>
          </div>
        </main>

        {/* Right spacer */}
        <div className="hidden w-80 shrink-0 xl:block" />
      </div>
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

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("rise-in flex gap-3", isUser && "flex-row-reverse")}>
      <span
        className={cn(
          "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-[10px] font-semibold",
          isUser
            ? "border-border-strong bg-surface text-foreground"
            : "border-border-strong bg-foreground text-background",
        )}
      >
        {isUser ? "You" : <AiMark working={false} size={14} />}
      </span>
      <div
        className={cn(
          "max-w-[80%] rounded-lg px-3.5 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-foreground text-background"
            : "border border-border bg-card text-foreground",
        )}
      >
        {msg.text}
      </div>
    </div>
  );
}
