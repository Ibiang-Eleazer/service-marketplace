import type { FeedPost } from "@/lib/feed-data";
import {
  Heart,
  MessageCircle,
  ImageIcon,
  HelpCircle,
  Repeat2,
} from "lucide-react";

function postKindHint(post: FeedPost) {
  if (post.images.length > 0) return { icon: ImageIcon, label: "Photo" };
  if (post.intent === "need" || post.intent === "question")
    return { icon: HelpCircle, label: "Question" };
  return { icon: Repeat2, label: "Post" };
}

export function PostGrid({
  posts,
  onOpenPost,
  emptyMessage,
}: {
  posts: FeedPost[];
  onOpenPost: (post: FeedPost) => void;
  emptyMessage?: string;
}) {
  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-16 text-center">
        <p className="text-sm font-medium text-foreground">Nothing here yet</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {emptyMessage ?? "Posts will appear here."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3 md:gap-2 lg:grid-cols-4">
      {posts.map((post) => {
        const Hint = postKindHint(post);
        const hasImage = post.images.length > 0;
        return (
          <button
            key={post.id}
            type="button"
            onClick={() => onOpenPost(post)}
            className="group relative aspect-square overflow-hidden rounded-lg border border-border bg-surface text-left transition-[transform,border-color,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-panel"
          >
            {hasImage ? (
              <img
                src={post.images[0]!.src}
                alt={post.images[0]!.alt}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center p-4">
                <p className="line-clamp-4 text-[13px] leading-relaxed text-muted-foreground">
                  {post.text}
                </p>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/55 via-foreground/0 to-foreground/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            {/* Hover stats */}
            <div className="absolute bottom-2 left-2 flex items-center gap-3 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
              <span className="flex items-center gap-1 text-[11px] font-medium">
                <Heart className="h-3 w-3" aria-hidden="true" />
                <span className="tabular-nums">{post.likes}</span>
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium">
                <MessageCircle className="h-3 w-3" aria-hidden="true" />
                <span className="tabular-nums">{post.comments}</span>
              </span>
            </div>

            {/* Kind hint badge (top-right) */}
            {!hasImage && (
              <div className="absolute right-2 top-2 rounded-md border border-border bg-card/90 px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider text-muted-foreground shadow-subtle backdrop-blur-sm">
                <Hint.icon
                  className="mr-0.5 inline h-2.5 w-2.5"
                  aria-hidden="true"
                />
                {Hint.label}
              </div>
            )}

            {/* Multi-image indicator */}
            {hasImage && post.images.length > 1 && (
              <div className="absolute right-2 top-2">
                <span className="flex items-center gap-1 rounded-md border border-border bg-card/90 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground shadow-subtle backdrop-blur-sm">
                  <ImageIcon className="h-2.5 w-2.5" aria-hidden="true" />
                  {post.images.length}
                </span>
              </div>
            )}

            {/* Repost indicator */}
            {post.repostedBy && (
              <div className="absolute left-2 top-2">
                <span className="flex items-center gap-1 rounded-md border border-border bg-card/90 px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground shadow-subtle backdrop-blur-sm">
                  <Repeat2 className="h-2.5 w-2.5" aria-hidden="true" />
                  Repost
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}
