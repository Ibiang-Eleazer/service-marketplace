import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/app-nav";
import { recentActivity } from "@/lib/home-data";

export const Route = createFileRoute("/requests")({
  head: () => ({
    meta: [
      { title: "Your requests — Brand" },
      {
        name: "description",
        content: "Everything your assistant is working on, and what it has finished.",
      },
      { property: "og:title", content: "Your requests — Brand" },
      {
        property: "og:description",
        content: "Everything your assistant is working on, and what it has finished.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Requests,
});

const open = [
  {
    title: "AC not cooling",
    service: "Technician search",
    status: "Waiting for your decision",
    note: "3 compared · 1 recommended",
  },
];

function Requests() {
  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto w-full max-w-4xl px-5 py-16 md:px-8">
        <h1 className="rise-in text-2xl font-semibold text-foreground">Requests</h1>
        <p className="rise-in mt-2 text-sm text-muted-foreground">
          Everything in progress, plus what your assistant has already handled.
        </p>

        <h2 className="mt-12 text-sm font-semibold uppercase tracking-wider text-foreground">
          In progress
        </h2>
        <div className="mt-4 grid gap-3">
          {open.map((r) => (
            <div
              key={r.title}
              className="rise-in flex items-start justify-between gap-4 rounded-lg border border-border bg-card p-4 shadow-subtle transition-transform duration-200 hover:-translate-y-0.5"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">{r.title}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {r.service} · {r.note}
                </p>
              </div>
              <span className="shrink-0 rounded-full border border-foreground/70 px-2 py-0.5 text-[11px] text-foreground">
                {r.status}
              </span>
            </div>
          ))}
        </div>

        <h2 className="mt-12 text-sm font-semibold uppercase tracking-wider text-foreground">
          Completed
        </h2>
        <ol className="mt-4 border-l border-border pl-5">
          {recentActivity.map((a) => (
            <li key={a.id} className="relative pb-6 last:pb-0">
              <span className="absolute -left-[23px] top-1.5 h-1.5 w-1.5 rounded-full bg-border-strong" />
              <p className="text-sm text-foreground">{a.title}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {a.detail} · {a.when}
              </p>
            </li>
          ))}
        </ol>

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
