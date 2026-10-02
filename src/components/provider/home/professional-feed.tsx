import { Link } from "@tanstack/react-router";
import {
  BarChart3,
  Bookmark,
  Heart,
  ImagePlus,
  MessageCircle,
  Repeat2,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Avatar, Panel, Verified, btn } from "@/components/provider/primitives";
import { feed as seedFeed, provider, type Post } from "@/lib/provider-data";
import { cn } from "@/lib/utils";

function Composer({ onPost }: { onPost: (text: string, category: string) => void }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState(provider.services[0].name);
  const [focused, setFocused] = useState(false);
  const expanded = focused || text.length > 0;

  return (
    <Panel className="p-4" aria-labelledby="composer-title">
      <h2 id="composer-title" className="sr-only">
        Share your work
      </h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!text.trim()) return;
          onPost(text.trim(), category);
          setText("");
          setFocused(false);
        }}
      >
        <div className="flex gap-3">
          <Avatar initials={provider.initials} />
          <label htmlFor="composer" className="sr-only">
            Describe your recent work
          </label>
          <textarea
            id="composer"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            rows={expanded ? 3 : 1}
            placeholder="Share a recent project, what you built, how you solved it…"
            className="min-h-9 flex-1 resize-none rounded-lg bg-surface px-3 py-2 text-sm outline-none transition-[height] placeholder:text-muted-foreground focus:bg-background focus:ring-1 focus:ring-border-strong"
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-1 pl-12">
          <button type="button" className={btn.ghost} onClick={() => toast("Photo upload opens your gallery")}>
            <ImagePlus className="h-4 w-4" aria-hidden="true" /> Photo
          </button>
          <button type="button" className={btn.ghost} onClick={() => toast("Video upload opens your gallery")}>
            <Video className="h-4 w-4" aria-hidden="true" /> Video
          </button>
          {expanded ? (
            <>
              <label htmlFor="composer-category" className="sr-only">
                Service category
              </label>
              <select
                id="composer-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="h-8 rounded-md border border-border bg-card px-2 text-[13px] text-foreground"
              >
                {provider.services.map((s) => (
                  <option key={s.name}>{s.name}</option>
                ))}
              </select>
            </>
          ) : null}
          <button type="submit" disabled={!text.trim()} className={cn(btn.primary, "ml-auto")}>
            Post
          </button>
        </div>
      </form>
    </Panel>
  );
}

function compact(n: number) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

function PostCard({ post }: { post: Post }) {
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);

  return (
    <Panel as="article" className="overflow-hidden" aria-labelledby={`post-${post.id}`}>
      <div className="flex items-start gap-3 p-4">
        <Avatar initials={post.author.initials} />
        <div className="min-w-0 flex-1">
          <p id={`post-${post.id}`} className="flex items-center gap-1 text-[13px] font-semibold text-foreground">
            {post.author.name}
            {post.author.verified ? <Verified /> : null}
            {post.isOwn ? <span className="font-normal text-muted-foreground"> · You</span> : null}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {post.author.title} · {post.time}
          </p>
        </div>
        <span className="rounded-full border border-border px-2 py-0.5 text-[11px] text-muted-foreground">
          {post.category}
        </span>
      </div>

      <p className="px-4 pb-3 text-sm leading-relaxed text-foreground text-pretty">{post.caption}</p>

      {post.image ? (
        <img
          src={post.image}
          alt={post.imageAlt}
          className="aspect-[4/3] w-full border-y border-border bg-surface object-cover md:aspect-[16/10]"
          loading="lazy"
        />
      ) : null}

      <div className="flex items-center gap-3 px-4 pt-3 text-xs text-muted-foreground">
        <span>{compact(post.reactions + (liked ? 1 : 0))} appreciations</span>
        <span>{post.comments} comments</span>
        <span>{post.shares} shares</span>
      </div>

      <div className="flex items-center gap-0.5 px-2 py-2">
        <button
          type="button"
          aria-pressed={liked}
          onClick={() => setLiked((v) => !v)}
          className={cn(btn.ghost, liked && "text-foreground")}
        >
          <Heart className={cn("h-4 w-4", liked && "fill-foreground")} aria-hidden="true" />
          <span className="hidden sm:inline">Appreciate</span>
        </button>
        <button type="button" className={btn.ghost}>
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Comment</span>
        </button>
        <button type="button" className={btn.ghost} onClick={() => toast("Link copied")}>
          <Repeat2 className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Share</span>
        </button>
        <button
          type="button"
          aria-pressed={saved}
          aria-label={saved ? "Unsave" : "Save"}
          onClick={() => setSaved((v) => !v)}
          className={cn(btn.icon, saved && "text-foreground")}
        >
          <Bookmark className={cn("h-4 w-4", saved && "fill-foreground")} aria-hidden="true" />
        </button>
        <div className="ml-auto flex items-center gap-1.5 pr-2">
          {post.isOwn ? (
            <Link to="/provider/analytics" className={btn.secondary}>
              <BarChart3 className="h-3.5 w-3.5" aria-hidden="true" /> Insights
            </Link>
          ) : (
            <>
              <button type="button" className={cn(btn.ghost, "hidden md:inline-flex")}>
                View profile
              </button>
              <button
                type="button"
                className={btn.secondary}
                onClick={() => toast(`Request sent to ${post.author.name.split(" ")[0]}`)}
              >
                Request service
              </button>
            </>
          )}
        </div>
      </div>
    </Panel>
  );
}

export function ProfessionalFeed({ className }: { className?: string }) {
  const [posts, setPosts] = useState(seedFeed);
  const [filter, setFilter] = useState<"all" | "mine">("all");
  const visible = filter === "mine" ? posts.filter((p) => p.isOwn) : posts;

  return (
    <section className={cn("flex flex-col gap-4", className)} aria-labelledby="feed-title">
      <div className="flex items-center justify-between">
        <h2 id="feed-title" className="text-[15px] font-semibold text-foreground">
          Professional feed
        </h2>
        <div role="tablist" aria-label="Feed filter" className="flex rounded-md bg-surface p-0.5">
          {(["all", "mine"] as const).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={cn(
                "h-7 rounded-[5px] px-2.5 text-xs font-medium transition-colors",
                filter === f ? "bg-card text-foreground shadow-subtle" : "text-muted-foreground",
              )}
            >
              {f === "all" ? "Network" : "My posts"}
            </button>
          ))}
        </div>
      </div>

      <Composer
        onPost={(caption, category) => {
          setPosts((p) => [
            {
              id: `new-${p.length}`,
              author: { name: provider.name, title: "Master carpenter", initials: provider.initials, verified: true },
              category,
              image: "",
              imageAlt: "",
              caption,
              time: "Just now",
              reactions: 0,
              comments: 0,
              shares: 0,
              isOwn: true,
            },
            ...p,
          ]);
          toast.success("Posted to your profile and the feed");
        }}
      />

      {visible.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </section>
  );
}
