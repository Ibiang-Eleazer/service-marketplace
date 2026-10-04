import { useState } from "react";
import { toast } from "sonner";
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Repeat2,
  Sparkles,
  UserPlus,
  UserCheck,
} from "lucide-react";
import type { FeedPost } from "@/lib/feed-data";
import { feedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

function intentLabel(intent?: FeedPost["intent"]) {
  switch (intent) {
    case "showcase": return "Work";
    case "need": return "Looking for help";
    case "question": return "Question";
    case "discovery": return "Inspiration";
    case "idea": return "Idea";
    default: return null;
  }
}

function VerifiedBadge() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-label="Verified" className="shrink-0">
      <path d="M8 1.5l1.8 1.3 2.2-.2.7 2.1 1.8 1.3-.7 2.1.7 2.1-1.8 1.3-.7 2.1-2.2-.2L8 14.5l-1.8-1.3-2.2.2-.7-2.1L1.5 10l.7-2.1L1.5 5.8l1.8-1.3.7-2.1 2.2.2L8 1.5z" fill="currentColor" className="text-foreground" opacity="0.9"/>
      <path d="M5.5 8l1.5 1.5 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PostMenu({ post }: { post: FeedPost }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-label="More actions"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
      </button>
      {open ? (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="rise-in absolute right-0 top-9 z-20 w-56 rounded-lg border border-border bg-popover p-1.5 shadow-raised">
            <button
              type="button"
              onClick={() => { toast(`Asked AI about ${post.author.name.split(" ")[0]}'s post`); setOpen(false); }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-accent"
            >
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
              Ask AI about this
            </button>
            <button
              type="button"
              onClick={() => { toast("Link copied to clipboard"); setOpen(false); }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-accent"
            >
              Copy link
            </button>
            {post.author.isProvider ? (
              <button
                type="button"
                onClick={() => { toast(`Opening ${post.author.name}'s profile`); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-accent"
              >
                View profile
              </button>
            ) : null}
            {post.intent === "showcase" || post.intent === "discovery" ? (
              <button
                type="button"
                onClick={() => { toast("Finding similar professionals…"); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-accent"
              >
                Find someone similar
              </button>
            ) : null}
            {post.intent === "need" || post.intent === "question" ? (
              <button
                type="button"
                onClick={() => { toast("AI is helping you get this done"); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-accent"
              >
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                Help me get this done
              </button>
            ) : null}
          </div>
        </>
      ) : null}
    </div>
  );
}

export function PostCard({ post }: { post: FeedPost }) {
  const [showComments, setShowComments] = useState(false);
  const label = intentLabel(post.intent);

  return (
    <article className="rise-in rounded-xl border border-border bg-card shadow-subtle transition-[transform,box-shadow,border-color] duration-300 hover:border-border-strong hover:shadow-panel">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold text-foreground">
          {post.author.initials}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[13px] font-semibold text-foreground">
              {post.author.name}
            </span>
            {post.author.verified ? <VerifiedBadge /> : null}
            {post.author.isProvider ? (
              <span className="rounded-[4px] border border-border px-1 py-px text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                Pro
              </span>
            ) : null}
          </div>
          <p className="truncate text-xs text-muted-foreground">
            {post.author.title} · {post.time} ago
          </p>
        </div>
        <PostMenu post={post} />
      </div>

      {/* Text */}
      <p className="px-4 pb-3 text-[0.95rem] leading-relaxed text-foreground text-pretty">
        {post.text}
      </p>

      {/* Intent label */}
      {label ? (
        <div className="px-4 pb-3">
          <span className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
            {label}
          </span>
        </div>
      ) : null}

      {/* Images */}
      {post.images.length > 0 ? (
        <div className={cn(
          "grid gap-0.5",
          post.images.length === 1 ? "grid-cols-1" : "grid-cols-2",
        )}>
          {post.images.map((img, i) => (
            <img
              key={i}
              src={img.src}
              alt={img.alt}
              className={cn(
                "w-full border-y border-border bg-surface object-cover",
                post.images.length === 1 ? "aspect-[4/3] md:aspect-[16/10]" : "aspect-square",
              )}
              loading="lazy"
            />
          ))}
        </div>
      ) : null}

      {/* Stats */}
      <div className="flex items-center gap-3 px-4 pt-3 text-xs text-muted-foreground">
        <span className="tabular-nums">{post.likes} likes</span>
        <span className="tabular-nums">{post.comments} comments</span>
        <span className="tabular-nums">{post.reposts} reposts</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 px-2 py-2">
        <button
          type="button"
          aria-pressed={post.liked}
          aria-label={post.liked ? "Unlike" : "Like"}
          onClick={() => feedStore.toggleLike(post.id)}
          className={cn(
            "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium transition-colors",
            post.liked ? "text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
          )}
        >
          <Heart className={cn("h-4 w-4", post.liked && "fill-foreground")} aria-hidden="true" />
          <span className="hidden sm:inline">Like</span>
        </button>
        <button
          type="button"
          aria-label="Comment"
          onClick={() => setShowComments((v) => !v)}
          className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Comment</span>
        </button>
        <button
          type="button"
          aria-label="Repost"
          onClick={() => toast.success("Reposted to your feed")}
          className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Repeat2 className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Repost</span>
        </button>
        <button
          type="button"
          aria-pressed={post.saved}
          aria-label="Save"
          onClick={() => {
            feedStore.toggleSave(post.id);
            toast(post.saved ? "Removed from library" : "Saved to library");
          }}
          className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <Bookmark className={cn("h-4 w-4", post.saved && "fill-foreground")} aria-hidden="true" />
          <span className="hidden sm:inline">Save</span>
        </button>
        <div className="ml-auto flex items-center gap-1.5 pr-2">
          <button
            type="button"
            aria-pressed={post.following}
            onClick={() => feedStore.toggleFollow(post.author.id)}
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition-colors",
              post.following
                ? "border-border bg-surface text-muted-foreground"
                : "border-border-strong bg-card text-foreground hover:bg-accent",
            )}
          >
            {post.following ? (
              <><UserCheck className="h-3.5 w-3.5" aria-hidden="true" /> <span className="hidden sm:inline">Following</span></>
            ) : (
              <><UserPlus className="h-3.5 w-3.5" aria-hidden="true" /> <span className="hidden sm:inline">Follow</span></>
            )}
          </button>
          {post.author.isProvider ? (
            <button
              type="button"
              onClick={() => toast(`Opening message with ${post.author.name.split(" ")[0]}`)}
              className="flex h-7 items-center rounded-md border border-border-strong bg-card px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              Message
            </button>
          ) : null}
        </div>
      </div>

      {/* AI contextual action bar */}
      {(post.intent === "showcase" || post.intent === "discovery") && post.author.isProvider ? (
        <div className="border-t border-border px-4 py-2.5">
          <button
            type="button"
            onClick={() => toast("AI is finding similar professionals for you…")}
            className="flex items-center gap-2 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="grid h-4 w-4 place-items-center rounded-full border border-border-strong text-[8px] font-bold">AI</span>
            Find someone who can make something like this
          </button>
        </div>
      ) : null}
      {(post.intent === "need" || post.intent === "question") && !post.author.isProvider ? (
        <div className="border-t border-border px-4 py-2.5">
          <button
            type="button"
            onClick={() => toast("AI is helping you get this done…")}
            className="flex items-center gap-2 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
          >
            <span className="grid h-4 w-4 place-items-center rounded-full border border-border-strong text-[8px] font-bold">AI</span>
            Help me get this done
          </button>
        </div>
      ) : null}

      {/* Inline comments (mock) */}
      {showComments ? (
        <div className="border-t border-border p-4">
          <div className="flex gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-[10px] font-semibold">
              CA
            </span>
            <input
              type="text"
              placeholder="Write a comment…"
              className="h-9 min-w-0 flex-1 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-ring"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.currentTarget.value.trim()) {
                  toast.success("Comment posted");
                  e.currentTarget.value = "";
                  setShowComments(false);
                }
              }}
            />
          </div>
        </div>
      ) : null}
    </article>
  );
}
