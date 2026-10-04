import { useMemo, useState } from "react";
import { Composer } from "@/components/feed/composer";
import { PostCard } from "@/components/feed/post-card";
import { useFeed } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

type Tab = "for-you" | "following" | "providers" | "community";

const tabs: { key: Tab; label: string }[] = [
  { key: "for-you", label: "For you" },
  { key: "following", label: "Following" },
  { key: "providers", label: "Professionals" },
  { key: "community", label: "Community" },
];

export function Feed({ onAskAi }: { onAskAi?: () => void }) {
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
    <div className="flex flex-col">
      {/* Tab bar — sticky within the feed column */}
      <div className="sticky top-14 z-10 border-b border-border bg-background/85 backdrop-blur-xl">
        <div role="tablist" aria-label="Feed filter" className="flex">
          {tabs.map((t) => (
            <button
              key={t.key}
              role="tab"
              aria-selected={tab === t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 border-b-2 px-2.5 py-3 text-[13px] font-medium transition-colors",
                tab === t.key
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Composer */}
      <Composer onAskAi={onAskAi} />

      {/* Posts — continuous stream */}
      {visible.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <p className="text-sm font-medium text-foreground">Nothing here yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {tab === "following" ? "Follow people to see their posts here." : "Check back soon for new content."}
          </p>
        </div>
      ) : (
        <div className="border-b border-border">
          {visible.map((post) => (
            <PostCard key={post.id} post={post} onAskAi={onAskAi} />
          ))}
        </div>
      )}
    </div>
  );
}
