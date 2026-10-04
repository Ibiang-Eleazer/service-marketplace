import { createFileRoute } from "@tanstack/react-router";
import { Bookmark } from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PostCard } from "@/components/feed/post-card";
import { useSavedPosts } from "@/lib/feed-store";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "Library — Brand" },
      {
        name: "description",
        content: "Your saved posts, people, and inspiration.",
      },
      { property: "og:title", content: "Library — Brand" },
      {
        property: "og:description",
        content: "Your saved posts, people, and inspiration.",
      },
    ],
  }),
  component: Library,
});

function Library() {
  const savedPosts = useSavedPosts();

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto w-full max-w-2xl px-5 py-12 md:px-8">
        <h1 className="rise-in text-2xl font-semibold text-foreground">Library</h1>
        <p className="rise-in mt-2 text-sm text-muted-foreground">
          Your personal collection — saved posts, inspiration, and ideas.
        </p>

        {/* Category tabs (placeholder for future expansion) */}
        <div className="mt-8 flex gap-1 rounded-lg border border-border bg-card p-1 shadow-subtle">
          <button className="flex-1 rounded-md bg-foreground px-2.5 py-1.5 text-[13px] font-medium text-background">
            Saved posts
          </button>
          <button className="flex-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
            Saved people
          </button>
          <button className="flex-1 rounded-md px-2.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground">
            Inspiration
          </button>
        </div>

        {/* Saved posts */}
        <div className="mt-6">
          {savedPosts.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
              <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-border bg-surface">
                <Bookmark className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              </span>
              <p className="mt-4 text-sm font-medium text-foreground">
                Nothing saved yet
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                Tap the bookmark icon on any post to save it here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savedPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
