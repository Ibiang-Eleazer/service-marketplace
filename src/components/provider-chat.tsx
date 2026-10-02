import { useEffect, useRef, useState } from "react";
import { AiMark } from "@/components/ai-mark";
import { Button } from "@/components/ui-kit";
import {
  conversation,
  sendProviderMessage,
  aiAssistInChat,
  exitProviderChat,
} from "@/lib/conversation-engine";
import { cn } from "@/lib/utils";

/**
 * Provider Chat — direct conversation between user and provider.
 * The AI stands by and can assist but never impersonates the user.
 */

export function ProviderChat({ onExit }: { onExit: () => void }) {
  const conv = conversation.get();
  const provider = conv.chattingProvider;
  const [input, setInput] = useState("");
  const [aiAssistText, setAiAssistText] = useState<string | null>(null);
  const [showAiAssist, setShowAiAssist] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to conversation updates
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    return conversation.subscribe(() => forceUpdate((n) => n + 1));
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [conv.chatMessages.length]);

  if (!provider) return null;

  function handleSend() {
    if (!input.trim()) return;
    const { aiAssist } = sendProviderMessage(input);
    setInput("");
    if (aiAssist) {
      setAiAssistText(aiAssist);
    }
  }

  function handleAskAi() {
    const assist = aiAssistInChat();
    setAiAssistText(assist);
    setShowAiAssist(true);
  }

  function handleExit() {
    exitProviderChat();
    onExit();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold text-foreground">
            {provider.initials}
          </span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{provider.name}</h3>
            <p className="text-xs text-muted-foreground">{provider.service}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleExit}
          className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          Back to assistant
        </button>
      </div>

      {/* AI standby indicator */}
      <div className="flex items-center gap-2 border-b border-border bg-surface px-5 py-2">
        <AiMark working={false} size={12} />
        <span className="text-xs text-muted-foreground">
          AI standing by — I can help clarify or explain, but I won't speak for you.
        </span>
        <button
          type="button"
          onClick={handleAskAi}
          className="ml-auto rounded-md border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:text-foreground"
        >
          Ask AI to explain
        </button>
      </div>

      {/* AI assist banner */}
      {showAiAssist && aiAssistText ? (
        <div className="rise-in border-b border-border bg-accent/50 px-5 py-3">
          <div className="flex items-start gap-2">
            <AiMark working={false} size={12} />
            <div className="flex-1">
              <p className="text-xs font-medium text-foreground">AI clarification</p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {aiAssistText}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowAiAssist(false)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      ) : null}

      {/* Chat messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {conv.chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex",
                msg.role === "user" ? "justify-end" : "justify-start",
              )}
            >
              <div
                className={cn(
                  "rise-in max-w-[80%] rounded-lg px-4 py-2.5 text-sm",
                  msg.role === "user"
                    ? "bg-foreground text-background"
                    : "border border-border bg-card text-foreground",
                )}
              >
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border px-5 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-subtle">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message to the provider…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <Button onClick={handleSend} disabled={!input.trim()} size="md">
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
