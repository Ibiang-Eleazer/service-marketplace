import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { UserPlus, UserCheck, TrendingUp, Sparkles } from "lucide-react";
import { discoverPeople, trendingTopics } from "@/lib/feed-data";
import { feedStore, useFeed } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

function VerifiedBadge() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-label="Verified" className="shrink-0">
      <path d="M8 1.5l1.8 1.3 2.2-.2.7 2.1 1.8 1.3-.7 2.1.7 2.1-1.8 1.3-.7 2.1-2.2-.2L8 14.5l-1.8-1.3-2.2.2-.7-2.1L1.5 10l.7-2.1L1.5 5.8l1.8-1.3.7-2.1 2.2.2L8 1.5z" fill="currentColor" className="text-foreground" opacity="0.9"/>
      <path d="M5.5 8l1.5 1.5 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export function RightSidebar() {
  const { followedIds } = useFeed();

  return (
    <aside className="sticky top-14 hidden flex-col gap-4 py-4 xl:flex">
      {/* People you may want to follow */}
      <PeopleToFollow followedIds={followedIds} />

      {/* Trending on the platform */}
      <TrendingSection />

      {/* AI discovery */}
      <AiDiscovery />
    </aside>
  );
}

function PeopleToFollow({ followedIds }: { followedIds: Set<string> }) {
  const people = discoverPeople.slice(0, 4);
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-subtle">
      <h2 className="text-[15px] font-semibold text-foreground">Who to follow</h2>
      <p className="mt-0.5 text-[13px] text-muted-foreground">People creating work you may like</p>
      <ul className="mt-3 flex flex-col gap-3">
        {people.map((p) => {
          const following = followedIds.has(p.id);
          return (
            <li key={p.id} className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold text-foreground">
                {p.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1 truncate text-[13px] font-semibold text-foreground">
                  {p.name}
                  {p.verified ? <VerifiedBadge /> : null}
                </p>
                <p className="truncate text-xs text-muted-foreground">{p.title}</p>
              </div>
              <button
                type="button"
                aria-pressed={following}
                onClick={() => feedStore.toggleFollow(p.id)}
                className={cn(
                  "flex h-7 shrink-0 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors",
                  following
                    ? "border-border bg-surface text-muted-foreground"
                    : "border-border-strong bg-card text-foreground hover:bg-accent",
                )}
              >
                {following ? <UserCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
      <button type="button" className="mt-3 text-xs text-muted-foreground transition-colors hover:text-foreground">
        See more people
      </button>
    </section>
  );
}

function TrendingSection() {
  return (
    <section className="rounded-xl border border-border bg-card p-4 shadow-subtle">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        <h2 className="text-[15px] font-semibold text-foreground">Popular this week</h2>
      </div>
      <ul className="mt-3 flex flex-col gap-3">
        {trendingTopics.slice(0, 5).map((t) => (
          <li key={t.id}>
            <button
              type="button"
              onClick={() => toast(`Exploring ${t.topic}`)}
              className="w-full text-left transition-opacity hover:opacity-70"
            >
              <p className="text-[11px] uppercase tracking-wider text-muted-foreground">{t.category}</p>
              <p className="text-[13px] font-medium text-foreground">{t.topic}</p>
              <p className="text-xs text-muted-foreground">{t.posts}</p>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AiDiscovery() {
  const navigate = useNavigate();
  return (
    <section className="rounded-xl border border-border bg-gradient-to-b from-card to-surface p-4 shadow-subtle">
      <div className="flex items-center gap-2">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-foreground text-[8px] font-bold text-background">AI</span>
        <h2 className="text-[14px] font-semibold text-foreground">Seeing interior design?</h2>
      </div>
      <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
        Want to discover professionals creating similar work in your area?
      </p>
      <button
        type="button"
        onClick={() => navigate({ to: "/assistant", search: { context: "You've been seeing a lot of interior design and custom furniture in your feed. Want me to find professionals creating similar work in your area?" } })}
        className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-foreground transition-opacity hover:opacity-70"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        Explore with AI
      </button>
    </section>
  );
}
