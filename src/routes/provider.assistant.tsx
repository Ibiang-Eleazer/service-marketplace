import { createFileRoute } from "@tanstack/react-router";
import { ArrowUp, Check, Hand, ShieldCheck, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { AiMark } from "@/components/ai-mark";
import { PageContainer } from "@/components/provider/provider-shell";
import { PageHeader, Panel, ProGate, SectionHeader, btn } from "@/components/provider/primitives";
import { providerStore, useProvider, type PermissionKey } from "@/lib/provider-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/assistant")({
  component: AssistantPage,
});

const suggestions = [
  "How did I perform this month?",
  "Plan my schedule for next week",
  "Which requests should I accept?",
  "Draft a post about the Ikoyi wardrobe",
];

const answers: Record<string, string> = {
  "How did I perform this month?":
    "Strong month. You earned ₦3.9M (+15%), completed 14 jobs and kept a 4.9 rating. Profile views are up 28%, mostly from your Ikoyi wardrobe post. One thing to watch: 3 requests expired before you replied — turning on auto-drafted replies would help.",
  "Plan my schedule for next week":
    "Next week has room for 2 more jobs. I'd group Lekki work on Mon–Tue, keep Wed for the workshop, and put the Ikeja electrical follow-up on Thursday morning to avoid traffic. Want me to draft that as a proposal?",
  "Which requests should I accept?":
    "Accept Amaka's wardrobe (₦520k, 4 km, repeat customer). Tunde's refinishing fits Friday afternoon. Grace's consultation is low value but she's new and nearby in Ajah — worth it if you can pair it with Ngozi's Saturday job.",
  "Draft a post about the Ikoyi wardrobe":
    "Here's a draft: \"Some rooms just need one great piece. This floor-to-ceiling walnut wardrobe in Ikoyi took two days on site — soft-close doors, warm LED strips, and every gap scribed to the wall. Thinking about built-ins? Let's talk.\"",
};

const permissionGroups: { title: string; tone: "safe" | "careful"; items: { key: PermissionKey; label: string }[] }[] = [
  {
    title: "Can do on its own",
    tone: "safe",
    items: [
      { key: "analyze", label: "Analyse my performance" },
      { key: "organizeSchedule", label: "Organise my schedule" },
      { key: "draftMessages", label: "Draft replies to customers" },
      { key: "suggestOpportunities", label: "Suggest opportunities" },
      { key: "draftPosts", label: "Draft posts" },
    ],
  },
  {
    title: "Needs my permission",
    tone: "careful",
    items: [
      { key: "acceptJobs", label: "Accept jobs for me" },
      { key: "sendMessages", label: "Send messages" },
      { key: "changeAppointments", label: "Change appointments" },
      { key: "publishContent", label: "Publish content" },
    ],
  },
];

const prepared = [
  { id: "a1", title: "Reply to Amaka", detail: "\"Yes, 8 AM works — I'll bring the drawings.\"" },
  { id: "a2", title: "Accept Tunde's refinishing", detail: "Fri 16 Oct, 1 PM · ₦85,000 · no conflicts" },
  { id: "a3", title: "Move Kunle's site measure", detail: "Propose Fri 9 AM instead of Thu 1 PM (conflict)" },
];

function Chat() {
  const [messages, setMessages] = useState<{ from: "me" | "ai"; text: string }[]>([]);
  const [text, setText] = useState("");

  const ask = (q: string) => {
    setMessages((m) => [
      ...m,
      { from: "me", text: q },
      { from: "ai", text: answers[q] ?? "I'm looking at your jobs, calendar and messages for that — here's what I'd suggest once I've checked." },
    ]);
    setText("");
  };

  return (
    <Panel className="flex min-h-[460px] flex-col">
      <div className="flex-1 p-4 md:p-6" aria-live="polite">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center py-10 text-center">
            <AiMark working={false} size={28} />
            <p className="mt-4 text-base font-semibold">What can I take off your plate?</p>
            <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
              I can see your jobs, calendar, messages and earnings. I&apos;ll ask before doing anything customers will see.
            </p>
            <div className="mt-6 flex max-w-lg flex-wrap justify-center gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => ask(s)}
                  className="rounded-full border border-border bg-card px-3 py-1.5 text-[13px] shadow-subtle transition-colors hover:bg-accent"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <ol className="flex flex-col gap-4">
            {messages.map((m, i) => (
              <li key={i} className={cn("flex gap-3", m.from === "me" && "justify-end")}>
                {m.from === "ai" ? (
                  <span className="mt-0.5">
                    <AiMark working={false} size={18} />
                  </span>
                ) : null}
                <p
                  className={cn(
                    "max-w-[85%] text-sm leading-relaxed",
                    m.from === "me" ? "rounded-2xl rounded-br-md bg-foreground px-3.5 py-2 text-background" : "text-foreground",
                  )}
                >
                  {m.text}
                </p>
              </li>
            ))}
          </ol>
        )}
      </div>
      <form
        className="flex items-center gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (text.trim()) ask(text.trim());
        }}
      >
        <label htmlFor="ai-input" className="sr-only">
          Ask your assistant
        </label>
        <input
          id="ai-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about your business, or tell me what to handle…"
          className="h-9 flex-1 rounded-lg border border-input bg-background px-3 text-sm outline-none focus:border-ring"
        />
        <button type="submit" className={cn(btn.primary, "h-9 w-9 px-0")} disabled={!text.trim()} aria-label="Send">
          <ArrowUp className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </Panel>
  );
}

function AssistantPage() {
  const { aiMode, permissions } = useProvider();
  const [queue, setQueue] = useState(prepared);

  return (
    <PageContainer wide>
      <PageHeader
        title="AI Assistant"
        description="Your business partner. It prepares the work — you stay in control."
        actions={
          <div role="radiogroup" aria-label="Assistant mode" className="flex rounded-md border border-border bg-card p-0.5 shadow-subtle">
            {(["assist", "hands-off"] as const).map((m) => (
              <button
                key={m}
                role="radio"
                aria-checked={aiMode === m}
                onClick={() => providerStore.setAiMode(m)}
                className={cn(
                  "flex h-7 items-center gap-1.5 rounded-[5px] px-3 text-xs font-medium transition-colors",
                  aiMode === m ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {m === "hands-off" ? <Hand className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                {m === "assist" ? "Assist" : "Hands-off"}
              </button>
            ))}
          </div>
        }
      />

      <div className="mt-6">
        <ProGate
          feature="AI Assistant"
          description="Get a business partner that analyses performance, plans your week, drafts replies and — in Hands-off mode — prepares actions for one-tap approval."
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="flex flex-col gap-6">
              {aiMode === "hands-off" ? (
                <Panel className="p-4 md:p-5" aria-labelledby="queue-title">
                  <SectionHeader
                    id="queue-title"
                    title="Ready for your approval"
                    description="Hands-off mode is preparing these while you work."
                  />
                  {queue.length === 0 ? (
                    <p className="mt-4 text-[13px] text-muted-foreground">All caught up. New actions will appear here.</p>
                  ) : (
                    <ul className="mt-4 flex flex-col gap-2">
                      {queue.map((a) => (
                        <li key={a.id} className="rise-in flex items-center gap-3 rounded-lg border border-border p-3">
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium">{a.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{a.detail}</p>
                          </div>
                          <button
                            type="button"
                            className={cn(btn.icon, "border border-border")}
                            aria-label={`Dismiss: ${a.title}`}
                            onClick={() => setQueue((q) => q.filter((x) => x.id !== a.id))}
                          >
                            <X className="h-4 w-4" aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className={btn.primary}
                            onClick={() => {
                              setQueue((q) => q.filter((x) => x.id !== a.id));
                              toast.success(`Done · ${a.title}`);
                            }}
                          >
                            <Check className="h-3.5 w-3.5" aria-hidden="true" /> Approve
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </Panel>
              ) : null}
              <Chat />
            </div>

            <Panel className="self-start p-4 md:p-5" aria-labelledby="perm-title">
              <SectionHeader
                id="perm-title"
                title="Permissions"
                description="Choose what your assistant can do."
              />
              {permissionGroups.map((g) => (
                <div key={g.title} className="mt-5">
                  <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    {g.tone === "careful" ? <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> : null}
                    {g.title}
                  </p>
                  <ul className="mt-2 flex flex-col">
                    {g.items.map((item) => (
                      <li key={item.key} className="flex items-center justify-between gap-3 py-2">
                        <label htmlFor={`perm-${item.key}`} className="text-[13px]">
                          {item.label}
                        </label>
                        <Switch
                          id={`perm-${item.key}`}
                          checked={permissions[item.key]}
                          onCheckedChange={() => providerStore.togglePermission(item.key)}
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <p className="mt-4 rounded-lg bg-surface px-3 py-2 text-xs text-muted-foreground">
                Anything a customer will see is shown to you first unless you allow it above.
              </p>
            </Panel>
          </div>
        </ProGate>
      </div>
    </PageContainer>
  );
}
