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

function VerifiedBadge({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-label="Verified" className="shrink-0">
      <path d="M8 1.5l1.8 1.3 2.2-.2.7 2.1 1.8 1.3-.7 2.1.7 2.1-1.8 1.3-.7 2.1-2.2-.2L8 14.5l-1.8-1.3-2.2.2-.7-2.1L1.5 10l.7-2.1L1.5 5.8l1.8-1.3.7-2.1 2.2.2L8 1.5z" fill="currentColor" className="text-foreground" opacity="0.9"/>
      <path d="M5.5 8l1.5 1.5 3-3" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function PostMenu({ post, onAskAi }: { post: FeedPost; onAskAi?: () => void }) {
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
            {onAskAi ? (
              <button
                type="button"
                onClick={() => { onAskAi(); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-accent"
              >
                <Sparkles className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                Ask AI about this
              </button>
            ) : null}
            <button
              type="button"
              onClick={() => { toast("Link copied to clipboard"); setOpen(false); }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-accent"
            >
              Copy link
            </button>
            <button
              type="button"
              onClick={() => { toast(`Opening ${post.author.name}'s profile`); setOpen(false); }}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-accent"
            >
              View profile
            </button>
            {post.author.isProvider ? (
              <button
                type="button"
                onClick={() => { toast(`Viewing more work from ${post.author.name.split(" ")[0]}`); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-accent"
              >
                See more work
              </button>
            ) : null}
            {(post.intent === "showcase" || post.intent === "discovery") && post.author.isProvider ? (
              <button
                type="button"
                onClick={() => { toast("Finding similar professionals…"); setOpen(false); }}
                className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-accent"
              >
                Find someone similar
              </button>
            ) : null}
            {(post.intent === "need" || post.intent === "question") && !post.author.isProvider ? (
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

export function PostCard({ post, onAskAi }: { post: FeedPost; onAskAi?: () => void }) {
  const [showComments, setShowComments] = useState(false);

  return (
    <article className="rise-in border-b border-border px-4 py-3 transition-colors duration-200 hover:bg-accent/30">
      {/* Repost indicator */}
      {post.repostedBy ? (
        <div className="mb-2 flex items-center gap-1.5 pl-7 text-xs text-muted-foreground">
          <Repeat2 className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-medium">{post.repostedBy.name}</span>
          <span>reposted</span>
        </div>
      ) : null}

      <div className="flex items-start gap-3">
        {/* Avatar */}
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold text-foreground">
          {post.author.initials}
        </span>

        {/* Content */}
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-1.5">
            <span className="truncate text-[14px] font-semibold text-foreground">
              {post.author.name}
            </span>
            {post.author.verified ? <VerifiedBadge /> : null}
            {post.author.isProvider ? (
              <span className="rounded-[4px] border border-border px-1 py-px text-[9px] font-medium uppercase tracking-wider text-muted-foreground">
                Pro
              </span>
            ) : null}
            <span className="text-xs text-muted-foreground">· {post.time}</span>
            <div className="ml-auto">
              <PostMenu post={post} onAskAi={onAskAi} />
            </div>
          </div>
          <p className="truncate text-xs text-muted-foreground">{post.author.title}</p>

          {/* Text */}
          <p className="mt-2 text-[14px] leading-relaxed text-foreground text-pretty">
            {post.text}
          </p>

          {/* Images */}
          {post.images.length > 0 ? (
            <div className={cn(
              "mt-3 overflow-hidden rounded-lg border border-border",
              post.images.length === 1 ? "grid grid-cols-1" :
              post.images.length === 2 ? "grid grid-cols-2 gap-0.5" :
              "grid grid-cols-2 gap-0.5",
            )}>
              {post.images.map((img, i) => (
                <img
                  key={i}
                  src={img.src}
                  alt={img.alt}
                  className={cn(
                    "w-full bg-surface object-cover",
                    post.images.length === 1
                      ? "aspect-[16/10]"
                      : post.images.length === 2
                        ? "aspect-[4/3]"
                        : i === 0
                          ? "aspect-[4/3] col-span-2"
                          : "aspect-square",
                  )}
                  loading="lazy"
                />
              ))}
            </div>
          ) : null}

          {/* Project metadata */}
          {post.projectMeta ? (
            <div className="mt-2.5">
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
                {post.projectMeta}
              </span>
            </div>
          ) : null}

          {/* AI contextual suggestion — subtle */}
          {post.intent === "showcase" && post.author.isProvider ? (
            <button
              type="button"
              onClick={() => toast("AI is finding similar professionals for you…")}
              className="mt-2.5 flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="grid h-4 w-4 place-items-center rounded-full border border-border-strong text-[8px] font-bold">AI</span>
              Find someone who can make something like this
            </button>
          ) : null}
          {(post.intent === "need" || post.intent === "question") && !post.author.isProvider ? (
            <button
              type="button"
              onClick={() => toast("AI is helping you get this done…")}
              className="mt-2.5 flex items-center gap-1.5 text-[12px] text-muted-foreground transition-colors hover:text-foreground"
            >
              <span className="grid h-4 w-4 place-items-center rounded-full border border-border-strong text-[8px] font-bold">AI</span>
              Help me get this done
            </button>
          ) : null}

          {/* Action row */}
          <div className="mt-3 flex items-center gap-1">
            <button
              type="button"
              aria-pressed={post.liked}
              aria-label={post.liked ? "Unlike" : "Like"}
              onClick={() => feedStore.toggleLike(post.id)}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium transition-all duration-150",
                post.liked ? "text-foreground scale-105" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              <Heart className={cn("h-[18px] w-[18px] transition-all", post.liked && "fill-foreground scale-110")} aria-hidden="true" />
              <span className="tabular-nums">{post.likes > 0 ? post.likes : ""}</span>
            </button>
            <button
              type="button"
              aria-label="Comment"
              onClick={() => setShowComments((v) => !v)}
              className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="tabular-nums">{post.comments > 0 ? post.comments : ""}</span>
            </button>
            <button
              type="button"
              aria-label="Repost"
              onClick={() => toast.success("Reposted to your feed")}
              className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Repeat2 className="h-[18px] w-[18px]" aria-hidden="true" />
              <span className="tabular-nums">{post.reposts > 0 ? post.reposts : ""}</span>
            </button>
            <button
              type="button"
              aria-pressed={post.saved}
              aria-label="Save"
              onClick={() => {
                feedStore.toggleSave(post.id);
                toast(post.saved ? "Removed from library" : "Saved to library");
              }}
              className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Bookmark className={cn("h-[18px] w-[18px]", post.saved && "fill-foreground")} aria-hidden="true" />
            </button>
            <div className="ml-auto flex items-center gap-1.5">
              <button
                type="button"
                aria-pressed={post.following}
                onClick={() => feedStore.toggleFollow(post.author.id)}
                className={cn(
                  "flex h-7 items-center gap-1 rounded-md border px-2.5 text-xs font-medium transition-colors",
                  post.following
                    ? "border-border bg-surface text-muted-foreground"
                    : "border-border-strong bg-card text-foreground hover:bg-accent",
                )}
              >
                {post.following ? <UserCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />}
                <span className="hidden sm:inline">{post.following ? "Following" : "Follow"}</span>
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

          {/* Inline comments */}
          {showComments ? (
            <div className="mt-3 border-t border-border pt-3">
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
        </div>
      </div>
    </article>
  );
}
