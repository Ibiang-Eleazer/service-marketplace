import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  Mail,
  Wrench,
  Info,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { seedNotifications, type AppNotification } from "@/lib/feed-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Brand" },
      {
        name: "description",
        content: "Likes, comments, follows, messages, and request updates.",
      },
      { property: "og:title", content: "Notifications — Brand" },
      {
        property: "og:description",
        content: "Likes, comments, follows, messages, and request updates.",
      },
    ],
  }),
  component: Notifications,
});

const iconMap: Record<AppNotification["kind"], typeof Heart> = {
  like: Heart,
  comment: MessageCircle,
  follow: UserPlus,
  message: Mail,
  repost: Repeat2,
  request: Wrench,
  system: Info,
};

function Notifications() {
  const unread = seedNotifications.filter((n) => n.unread);
  const read = seedNotifications.filter((n) => !n.unread);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 md:px-8">
        <h1 className="rise-in text-2xl font-semibold text-foreground">Notifications</h1>
        <p className="rise-in mt-2 text-sm text-muted-foreground">
          {unread.length > 0 ? `${unread.length} new` : "You're all caught up"}
        </p>

        {unread.length > 0 ? (
          <>
            <h2 className="mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              New
            </h2>
            <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-card shadow-subtle">
              {unread.map((n, i) => (
                <NotifRow key={n.id} n={n} delay={i * 50} />
              ))}
            </div>
          </>
        ) : null}

        {read.length > 0 ? (
          <>
            <h2 className="mt-8 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Earlier
            </h2>
            <div className="mt-3 divide-y divide-border rounded-xl border border-border bg-card shadow-subtle">
              {read.map((n, i) => (
                <NotifRow key={n.id} n={n} delay={i * 50} />
              ))}
            </div>
          </>
        ) : null}

        {seedNotifications.length === 0 ? (
          <div className="mt-8 rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border bg-surface">
              <Bell className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </span>
            <p className="mt-4 text-sm font-medium text-foreground">No notifications</p>
            <p className="mt-1 text-sm text-muted-foreground">
              You'll see likes, comments, follows, and request updates here.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function NotifRow({ n, delay }: { n: AppNotification; delay: number }) {
  const Icon = iconMap[n.kind];
  return (
    <div
      className={cn(
        "rise-in flex items-start gap-3 px-4 py-3.5 transition-colors hover:bg-accent/50",
        n.unread && "bg-accent/20",
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex shrink-0 items-center gap-2.5">
        {n.whoInitials ? (
          <span className="grid h-9 w-9 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold text-foreground">
            {n.whoInitials}
          </span>
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface">
            <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          </span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm text-foreground">
          {n.who ? <span className="font-semibold">{n.who} </span> : null}
          {n.text}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">{n.time} ago</p>
      </div>
      {n.unread ? (
        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-foreground" />
      ) : null}
    </div>
  );
}
