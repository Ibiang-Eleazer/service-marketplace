import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bookmark,
  Heart,
  MessageCircle,
  Repeat2,
  UserPlus,
  UserCheck,
  X,
} from "lucide-react";
import type { FeedPost } from "@/lib/feed-data";
import { feedStore } from "@/lib/feed-store";
import { cn } from "@/lib/utils";

function VerifiedBadge({ size = 14 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-label="Verified"
      className="shrink-0"
    >
      <path
        d="M8 1.5l1.8 1.3 2.2-.2.7 2.1 1.8 1.3-.7 2.1.7 2.1-1.8 1.3-.7 2.1-2.2-.2L8 14.5l-1.8-1.3-2.2.2-.7-2.1L1.5 10l.7-2.1L1.5 5.8l1.8-1.3.7-2.1 2.2.2L8 1.5z"
        fill="currentColor"
        className="text-foreground"
        opacity="0.9"
      />
      <path
        d="M5.5 8l1.5 1.5 3-3"
        stroke="white"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PostDetailModal({
  post,
  onClose,
}: {
  post: FeedPost | null;
  onClose: () => void;
}) {
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!post) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [post, onClose]);

  if (!post) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Post by ${post.author.name}`}
    >
      <div
        className="rise-in flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-raised sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold text-foreground">
            {post.author.initials}
          </span>
          <div className="min-w-0 flex-1">
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
            </div>
            <p className="truncate text-xs text-muted-foreground">
              {post.author.handle} · {post.author.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          {/* Images */}
          {post.images.length > 0 ? (
            <div
              className={cn(
                "grid",
                post.images.length === 1
                  ? "grid-cols-1"
                  : post.images.length === 2
                    ? "grid-cols-2 gap-0.5"
                    : "grid-cols-2 gap-0.5",
              )}
            >
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

          <div className="px-4 py-4">
            {post.repostedBy ? (
              <div className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Repeat2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="font-medium">{post.repostedBy.name}</span>
                <span>reposted this</span>
              </div>
            ) : null}

            <p className="text-[15px] leading-relaxed text-foreground text-pretty">
              {post.text}
            </p>

            {post.projectMeta ? (
              <div className="mt-3">
                <span className="inline-flex items-center gap-1 rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-muted-foreground">
                  {post.projectMeta}
                </span>
              </div>
            ) : null}

            <p className="mt-3 text-xs text-muted-foreground">{post.time}</p>

            {/* Stats */}
            <div className="mt-4 flex items-center gap-4 border-y border-border py-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Heart
                  className={cn(
                    "h-4 w-4",
                    post.liked && "fill-foreground text-foreground",
                  )}
                  aria-hidden="true"
                />
                <span className="tabular-nums">{post.likes}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                <span className="tabular-nums">{post.comments}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Repeat2 className="h-4 w-4" aria-hidden="true" />
                <span className="tabular-nums">{post.reposts}</span>
              </span>
            </div>

            {/* Actions */}
            <div className="mt-3 flex items-center gap-2">
              <button
                type="button"
                aria-pressed={post.liked}
                onClick={() => feedStore.toggleLike(post.id)}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                  post.liked
                    ? "border-foreground/20 bg-foreground/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-all",
                    post.liked && "fill-foreground scale-110",
                  )}
                  aria-hidden="true"
                />
                {post.liked ? "Liked" : "Like"}
              </button>
              <button
                type="button"
                onClick={() => setShowComments((v) => !v)}
                className="flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                Comment
              </button>
              <button
                type="button"
                onClick={() => toast.success("Reposted to your feed")}
                className="flex h-9 items-center gap-2 rounded-md border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Repeat2 className="h-4 w-4" aria-hidden="true" />
                Repost
              </button>
              <button
                type="button"
                aria-pressed={post.saved}
                onClick={() => {
                  feedStore.toggleSave(post.id);
                  toast(
                    post.saved ? "Removed from library" : "Saved to library",
                  );
                }}
                className={cn(
                  "flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors",
                  post.saved
                    ? "border-foreground/20 bg-foreground/5 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Bookmark
                  className={cn("h-4 w-4", post.saved && "fill-foreground")}
                  aria-hidden="true"
                />
                {post.saved ? "Saved" : "Save"}
              </button>
              <button
                type="button"
                onClick={() => toast("Link copied to clipboard")}
                className="ml-auto flex h-9 items-center rounded-md border border-border bg-card px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Share
              </button>
            </div>

            {/* Follow + Message */}
            <div className="mt-2 flex items-center gap-2">
              <button
                type="button"
                aria-pressed={post.following}
                onClick={() => feedStore.toggleFollow(post.author.id)}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-md border px-3 text-xs font-medium transition-colors",
                  post.following
                    ? "border-border bg-surface text-muted-foreground"
                    : "border-border-strong bg-card text-foreground hover:bg-accent",
                )}
              >
                {post.following ? (
                  <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                {post.following ? "Following" : "Follow"}
              </button>
              {post.author.isProvider ? (
                <button
                  type="button"
                  onClick={() =>
                    toast(
                      `Opening message with ${post.author.name.split(" ")[0]}`,
                    )
                  }
                  className="flex h-8 items-center rounded-md border border-border-strong bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  Message
                </button>
              ) : null}
            </div>

            {/* Inline comment box */}
            {showComments ? (
              <div className="mt-4 border-t border-border pt-3">
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
      </div>
    </div>
  );
}
