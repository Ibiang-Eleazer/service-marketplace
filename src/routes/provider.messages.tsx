import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Briefcase, Paperclip, Send } from "lucide-react";
import { useState } from "react";
import { PageContainer } from "@/components/provider/provider-shell";
import { Avatar, PageHeader, Panel, btn } from "@/components/provider/primitives";
import { conversations as seed, naira, type Conversation } from "@/lib/provider-data";
import { useProvider } from "@/lib/provider-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/messages")({
  component: MessagesPage,
});

const channels = [
  { key: "customers", label: "Customers" },
  { key: "platform", label: "Platform" },
  { key: "support", label: "Support" },
] as const;

function Thread({ convo, onBack, onSend }: { convo: Conversation; onBack: () => void; onSend: (t: string) => void }) {
  const { jobs } = useProvider();
  const job = jobs.find((j) => j.id === convo.jobId);
  const [text, setText] = useState("");

  return (
    <div className="flex h-full min-h-[60dvh] flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <button type="button" onClick={onBack} className={cn(btn.icon, "md:hidden")} aria-label="Back to conversations">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        </button>
        <Avatar initials={convo.initials} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{convo.name}</p>
          <p className="text-xs text-muted-foreground">{convo.channel === "customers" ? "Customer" : "Brand"}</p>
        </div>
      </div>

      {job ? (
        <Link
          to="/provider/jobs"
          className="mx-4 mt-3 flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2 transition-colors hover:bg-accent"
        >
          <Briefcase className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-medium">{job.service}</p>
            <p className="truncate text-xs text-muted-foreground">
              {job.date}, {job.time} · {job.area}
            </p>
          </div>
          <span className="text-[13px] font-semibold tabular-nums">{naira(job.earnings, true)}</span>
        </Link>
      ) : null}

      <ol className="flex flex-1 flex-col gap-2 overflow-y-auto p-4" aria-live="polite">
        {convo.messages.map((m, i) => (
          <li key={i} className={cn("flex flex-col", m.from === "me" ? "items-end" : "items-start")}>
            <p
              className={cn(
                "max-w-[80%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed",
                m.from === "me" ? "rounded-br-md bg-foreground text-background" : "rounded-bl-md bg-surface text-foreground",
              )}
            >
              {m.text}
            </p>
            <span className="mt-1 px-1 text-[10.5px] text-muted-foreground">{m.time}</span>
          </li>
        ))}
      </ol>

      <form
        className="flex items-end gap-2 border-t border-border p-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onSend(text.trim());
          setText("");
        }}
      >
        <button type="button" className={btn.icon} aria-label="Attach file">
          <Paperclip className="h-4 w-4" aria-hidden="true" />
        </button>
        <label htmlFor="msg" className="sr-only">
          Message {convo.name}
        </label>
        <textarea
          id="msg"
          rows={1}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              if (e.nativeEvent.isComposing || e.keyCode === 229) return;
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder="Write a message…"
          className="max-h-32 min-h-9 flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-ring"
        />
        <button type="submit" className={cn(btn.primary, "h-9 w-9 px-0")} disabled={!text.trim()} aria-label="Send">
          <Send className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}

function MessagesPage() {
  const [convos, setConvos] = useState(seed);
  const [channel, setChannel] = useState<Conversation["channel"]>("customers");
  const [openId, setOpenId] = useState<string | null>(null);
  const list = convos.filter((c) => c.channel === channel);
  const active = convos.find((c) => c.id === openId) ?? (openId === null ? list[0] : undefined);

  return (
    <PageContainer wide>
      <PageHeader title="Messages" description="Customers, payouts and support — all in one inbox." />
      <Panel className="mt-6 grid overflow-hidden md:grid-cols-[320px_minmax(0,1fr)]">
        <div className={cn("border-border md:border-r", openId && "hidden md:block")}>
          <div role="tablist" aria-label="Inbox" className="flex gap-1 border-b border-border p-2">
            {channels.map((c) => {
              const unread = convos.filter((x) => x.channel === c.key).reduce((n, x) => n + x.unread, 0);
              return (
                <button
                  key={c.key}
                  role="tab"
                  aria-selected={channel === c.key}
                  onClick={() => {
                    setChannel(c.key);
                    setOpenId(null);
                  }}
                  className={cn(
                    "flex h-8 flex-1 items-center justify-center gap-1.5 rounded-md text-[13px] transition-colors",
                    channel === c.key ? "bg-surface font-medium text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {c.label}
                  {unread ? (
                    <span className="rounded-full bg-foreground px-1.5 text-[10px] font-semibold leading-4 text-background">
                      {unread}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
          <ul>
            {list.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(c.id);
                    setConvos((all) => all.map((x) => (x.id === c.id ? { ...x, unread: 0 } : x)));
                  }}
                  className={cn(
                    "flex w-full items-start gap-3 border-b border-border px-4 py-3 text-left transition-colors hover:bg-accent/60",
                    active?.id === c.id && "bg-accent/60",
                  )}
                >
                  <Avatar initials={c.initials} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className={cn("truncate text-[13px]", c.unread ? "font-semibold" : "font-medium")}>{c.name}</p>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{c.time}</span>
                    </div>
                    <p className={cn("truncate text-[13px]", c.unread ? "text-foreground" : "text-muted-foreground")}>
                      {c.preview}
                    </p>
                  </div>
                  {c.unread ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-foreground" aria-label="Unread" /> : null}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <div className={cn(!openId && "hidden md:block")}>
          {active ? (
            <Thread
              key={active.id}
              convo={active}
              onBack={() => setOpenId(null)}
              onSend={(text) =>
                setConvos((all) =>
                  all.map((x) =>
                    x.id === active.id
                      ? { ...x, preview: text, time: "now", messages: [...x.messages, { from: "me", text, time: "Just now" }] }
                      : x,
                  ),
                )
              }
            />
          ) : null}
        </div>
      </Panel>
    </PageContainer>
  );
}
