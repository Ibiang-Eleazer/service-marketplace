import { createFileRoute, Link } from "@tanstack/react-router";
import { AppNav } from "@/components/app-nav";
import { PostCard } from "@/components/feed/post-card";
import { useFeed } from "@/lib/feed-store";
import { customerProfile, feedAuthors } from "@/lib/feed-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Brand" },
      {
        name: "description",
        content: "Your identity on the platform — your posts, media, and activity.",
      },
      { property: "og:title", content: "Your profile — Brand" },
      {
        property: "og:description",
        content: "Your identity on the platform — your posts, media, and activity.",
      },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { posts } = useFeed();
  const myPosts = posts.filter((p) => p.author.id === "me" || p.author.id === "chloe");

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto w-full max-w-3xl px-5 py-12 md:px-8">
        {/* Profile header */}
        <div className="rise-in rounded-xl border border-border bg-card p-6 shadow-panel md:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
            <span className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-lg font-semibold text-foreground">
              {customerProfile.initials}
            </span>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-semibold text-foreground">
                {customerProfile.name}
              </h1>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {customerProfile.handle} · {customerProfile.area}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground">
                {customerProfile.bio}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex gap-6 border-t border-border pt-5">
            <Stat label="Posts" value={customerProfile.posts} />
            <Stat label="Followers" value={customerProfile.followers} />
            <Stat label="Following" value={customerProfile.following} />
            <Stat label="Saved" value={customerProfile.saved} />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-8 flex gap-1 rounded-lg border border-border bg-card p-1 shadow-subtle">
          {["Posts", "Media", "Saved", "Activity"].map((tab, i) => (
            <button
              key={tab}
              className={cn(
                "flex-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                i === 0 ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Posts */}
        <div className="mt-6 flex flex-col gap-4">
          {myPosts.length > 0 ? (
            myPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-foreground">No posts yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Share something from your feed to get started.
              </p>
            </div>
          )}
        </div>

        {/* Following preview */}
        <div className="mt-10">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Following
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {[feedAuthors.daniel, feedAuthors.zainab, feedAuthors.emeka, feedAuthors.musa].map((a) => (
              <Link
                key={a.id}
                to="/home"
                className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-subtle transition-colors hover:bg-accent"
              >
                <span className="grid h-7 w-7 place-items-center rounded-full border border-border-strong bg-surface text-[10px] font-semibold">
                  {a.initials}
                </span>
                <span className="text-[13px] font-medium text-foreground">{a.name}</span>
              </Link>
            ))}
          </div>
        </div>

        <Link
          to="/home"
          className="mt-12 inline-flex text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to feed
        </Link>
      </main>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <span className="text-lg font-semibold tabular-nums text-foreground">{value}</span>
      <span className="ml-1.5 text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
