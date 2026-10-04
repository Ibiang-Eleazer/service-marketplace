import { useMemo, useState } from "react";
import { Composer } from "@/components/feed/composer";
import { PostCard } from "@/components/feed/post-card";
import { useFeed } from "@/lib/feed-store";
import { discoverPeople } from "@/lib/feed-data";
import { cn } from "@/lib/utils";

type Tab = "for-you" | "following" | "providers" | "community";

const tabs: { key: Tab; label: string }[] = [
  { key: "for-you", label: "For you" },
  { key: "following", label: "Following" },
  { key: "providers", label: "Professionals" },
  { key: "community", label: "Community" },
];

export function Feed() {
  const { posts } = useFeed();
  const [tab, setTab] = useState<Tab>("for-you");

  const visible = useMemo(() => {
    switch (tab) {
      case "following":
        return posts.filter((p) => p.following);
      case "providers":
        return posts.filter((p) => p.author.isProvider);
      case "community":
        return posts.filter((p) => !p.author.isProvider);
      default:
        return posts;
    }
  }, [posts, tab]);

  return (
    <div className="flex flex-col gap-4">
      <Composer />

      <div role="tablist" aria-label="Feed filter" className="flex gap-1 rounded-lg border border-border bg-card p-1 shadow-subtle">
        {tabs.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
              tab === t.key ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
          <p className="text-sm font-medium text-foreground">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "following" ? "Follow people to see their posts here." : "Check back soon for new content."}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {visible.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

function VerifiedBadge() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-label="Verified" className="shrink-0">
      <path d="M8 1.5l1.8 1.3 2.2-.2.7 2.1 1.8 1.3-.7 2.1.7 2.1-1.8 1.3-.7 2.1-2.2-.2L8 14.5l-1.8-1.3-2.2.2-.7-2.1L1.5 10l.7-2.1L1.5 5.8l1.8-1.3.7-2.1 2.2.2L8 1.5z" fill="currentColor" className="text-foreground" opacity="0.9"/>
      <path d="M5.5 8l1.5 1.5 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function DiscoverPeople() {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-subtle">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="text-[15px] font-semibold text-foreground">Discover people</h2>
        <button type="button" className="text-xs text-muted-foreground transition-colors hover:text-foreground">
          See more
        </button>
      </div>
      <p className="mt-0.5 text-[13px] text-muted-foreground">
        Professionals and creators you might like
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {discoverPeople.map((p) => (
          <li key={p.id}>
            <div className="flex items-start gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-accent/50">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold text-foreground">
                {p.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-[13px] font-semibold text-foreground">
                  {p.name}
                  {p.verified ? <VerifiedBadge /> : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">{p.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.area} · {p.followers} followers</p>
              </div>
              <img
                src={p.image}
                alt={p.imageAlt}
                className="h-10 w-10 shrink-0 rounded-md border border-border object-cover"
                loading="lazy"
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
