import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/app-nav";

export const Route = createFileRoute("/messages")({
  head: () => ({
    meta: [
      { title: "Messages — Brand" },
      {
        name: "description",
        content: "Replies from providers your assistant has been in touch with.",
      },
      { property: "og:title", content: "Messages — Brand" },
      {
        property: "og:description",
        content: "Replies from providers your assistant has been in touch with.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Messages,
});

const threads = [
  {
    id: "m1",
    name: "Northside Plumbing Co.",
    initials: "NP",
    preview: "We can send someone tomorrow morning between 9 and 11.",
    when: "12 min ago",
    unread: true,
  },
  {
    id: "m2",
    name: "Still House Cleaning",
    initials: "SH",
    preview: "Thanks for reaching out — could you confirm the number of rooms?",
    when: "3 days ago",
    unread: false,
  },
  {
    id: "m3",
    name: "Lumen Electrical",
    initials: "LE",
    preview: "All done. Let us know if the lights flicker again.",
    when: "Last week",
    unread: false,
  },
];

function Messages() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto w-full max-w-3xl px-5 py-16 md:px-8">
        <h1 className="rise-in text-2xl font-semibold text-foreground">Messages</h1>
        <p className="rise-in mt-2 text-sm text-muted-foreground">
          Replies from providers. Your assistant only writes with your permission.
        </p>

        <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-card shadow-subtle">
          {threads.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className="rise-in flex w-full items-start gap-3 px-4 py-4 text-left transition-colors duration-200 hover:bg-accent"
              style={{ animationDelay: `${i * 70}ms` }}
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold">
                {t.initials}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-sm font-medium text-foreground">
                    {t.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{t.when}</span>
                </span>
                <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                  {t.preview}
                </span>
              </span>
              {t.unread ? (
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />
              ) : null}
            </button>
          ))}
        </div>

        <Link
          to="/home"
          className="mt-12 inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          ← Back to your assistant
        </Link>
      </main>
    </div>
  );
}
