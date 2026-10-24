import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  Bookmark,
  Heart,
  Link2,
  MessageCircle,
  Pencil,
  Repeat2,
  Share2,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { AppNav } from "@/components/app-nav";
import { PostGrid } from "@/components/profile/post-grid";
import { PostDetailModal } from "@/components/profile/post-detail-modal";
import { useFeed } from "@/lib/feed-store";
import { customerProfile, feedAuthors, type FeedPost } from "@/lib/feed-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your profile — Brand" },
      {
        name: "description",
        content:
          "Your identity on the platform — your posts, media, and activity.",
      },
      { property: "og:title", content: "Your profile — Brand" },
      {
        property: "og:description",
        content:
          "Your identity on the platform — your posts, media, and activity.",
      },
    ],
  }),
  component: Profile,
});

type Tab = "posts" | "reposts" | "saved";

function VerifiedBadge({ size = 16 }: { size?: number }) {
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

function Profile() {
  const { posts, savedIds } = useFeed();
  const [tab, setTab] = useState<Tab>("posts");
  const [openPost, setOpenPost] = useState<FeedPost | null>(null);

  const isOwnProfile = true;

  const myPosts = useMemo(
    () => posts.filter((p) => p.author.id === "me" || p.author.id === "chloe"),
    [posts],
  );
  const myReposts = useMemo(
    () =>
      posts.filter(
        (p) => p.repostedBy?.id === "chloe" || p.repostedBy?.id === "me",
      ),
    [posts],
  );
  const savedPosts = useMemo(
    () => posts.filter((p) => savedIds.has(p.id)),
    [posts, savedIds],
  );

  const visiblePosts =
    tab === "posts" ? myPosts : tab === "reposts" ? myReposts : savedPosts;

  const followerCount = customerProfile.followers;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Cover band */}
      <div className="h-32 w-full bg-gradient-to-br from-surface to-muted sm:h-40" />

      <main className="mx-auto w-full max-w-5xl px-4 md:px-8">
        {/* Identity header */}
        <div className="rise-in -mt-16 sm:-mt-20">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-panel sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
              {/* Avatar */}
              <div className="-mt-12 sm:-mt-16">
                <span className="grid h-24 w-24 shrink-0 place-items-center rounded-full border-4 border-card bg-surface text-2xl font-semibold text-foreground shadow-subtle sm:h-28 sm:w-28">
                  {customerProfile.initials}
                </span>
              </div>

              {/* Name + actions */}
              <div className="min-w-0 flex-1 sm:pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
                    {customerProfile.name}
                  </h1>
                  <VerifiedBadge size={18} />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {customerProfile.handle}
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {customerProfile.area}
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center gap-2 sm:pb-1">
                {isOwnProfile ? (
                  <>
                    <button
                      type="button"
                      onClick={() => toast("Opening profile editor")}
                      className="flex h-9 items-center gap-2 rounded-md border border-border-strong bg-card px-4 text-sm font-medium text-foreground shadow-subtle transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-panel"
                    >
                      <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                      Edit profile
                    </button>
                    <button
                      type="button"
                      onClick={() => toast("Profile link copied")}
                      className="flex h-9 items-center gap-2 rounded-md border border-border-strong bg-card px-4 text-sm font-medium text-foreground shadow-subtle transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-panel"
                    >
                      <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Share
                    </button>
                  </>
                ) : (
                  <>
                    <FollowButton />
                    <button
                      type="button"
                      onClick={() => toast("Opening message")}
                      className="flex h-9 items-center gap-2 rounded-md border border-border-strong bg-card px-4 text-sm font-medium text-foreground shadow-subtle transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-panel"
                    >
                      Message
                    </button>
                    <button
                      type="button"
                      onClick={() => toast("Profile link copied")}
                      className="grid h-9 w-9 place-items-center rounded-md border border-border-strong bg-card text-foreground shadow-subtle transition-[transform,box-shadow] hover:-translate-y-px hover:shadow-panel"
                      aria-label="Share profile"
                    >
                      <Share2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bio */}
            <p className="mt-4 text-sm leading-relaxed text-foreground text-pretty">
              {customerProfile.bio}
            </p>

            {/* Website link */}
            {customerProfile.website ? (
              <a
                href={`https://${customerProfile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
              >
                <Link2 className="h-3.5 w-3.5" aria-hidden="true" />
                {customerProfile.website}
              </a>
            ) : null}

            {/* Stats */}
            <div className="mt-5 flex flex-wrap items-center gap-6 border-t border-border pt-4">
              <Stat label="Posts" value={myPosts.length} />
              <Stat label="Followers" value={followerCount} />
              <Stat label="Following" value={customerProfile.following} />
              {isOwnProfile ? (
                <Stat label="Saved" value={savedPosts.length} />
              ) : null}
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div className="sticky top-14 z-20 -mx-4 mt-6 border-b border-border bg-background/85 px-4 backdrop-blur-xl md:mx-0 md:rounded-t-lg md:border-x md:border-t md:px-0">
          <div role="tablist" aria-label="Profile content" className="flex">
            {[
              { key: "posts" as const, label: "Posts", count: myPosts.length },
              {
                key: "reposts" as const,
                label: "Reposts",
                count: myReposts.length,
              },
              ...(isOwnProfile
                ? [
                    {
                      key: "saved" as const,
                      label: "Saved",
                      count: savedPosts.length,
                    },
                  ]
                : []),
            ].map((t) => (
              <button
                key={t.key}
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 border-b-2 px-3 py-3.5 text-sm font-medium transition-colors",
                  tab === t.key
                    ? "border-foreground text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
              >
                {t.label}
                <span
                  className={cn(
                    "tabular-nums text-xs",
                    tab === t.key
                      ? "text-muted-foreground"
                      : "text-muted-foreground/70",
                  )}
                >
                  {t.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Content grid */}
        <div className="py-4 md:py-6">
          <PostGrid
            posts={visiblePosts}
            onOpenPost={setOpenPost}
            emptyMessage={
              tab === "saved"
                ? "Save posts by tapping the bookmark icon."
                : tab === "reposts"
                  ? "Reposts will appear here."
                  : "Share something from your feed to get started."
            }
          />
        </div>

        {/* Following preview */}
        <div className="mt-2 pb-12">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-foreground">
            Following
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["daniel", "zainab", "emeka", "musa"] as const)
              .map((k) => feedAuthors[k])
              .filter((a): a is NonNullable<typeof a> => Boolean(a))
              .map((a) => (
                <Link
                  key={a.id}
                  to="/home"
                  className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-subtle transition-colors hover:bg-accent"
                >
                  <span className="grid h-7 w-7 place-items-center rounded-full border border-border-strong bg-surface text-[10px] font-semibold">
                    {a.initials}
                  </span>
                  <span className="text-[13px] font-medium text-foreground">
                    {a.name}
                  </span>
                </Link>
              ))}
          </div>
        </div>

        <Link
          to="/home"
          className="inline-flex pb-12 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Back to feed
        </Link>
      </main>

      {/* Post detail modal */}
      <PostDetailModal post={openPost} onClose={() => setOpenPost(null)} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="text-lg font-semibold tabular-nums text-foreground">
        {value}
      </span>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function FollowButton() {
  const [following, setFollowing] = useState(false);
  return (
    <button
      type="button"
      aria-pressed={following}
      onClick={() => {
        setFollowing((v) => !v);
        toast(following ? "Unfollowed" : "Following");
      }}
      className={cn(
        "flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium shadow-subtle transition-[transform,box-shadow,background-color,color] hover:-translate-y-px hover:shadow-panel",
        following
          ? "border border-border bg-card text-muted-foreground"
          : "bg-foreground text-background",
      )}
    >
      {following ? (
        <UserCheck className="h-3.5 w-3.5" aria-hidden="true" />
      ) : (
        <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
      )}
      {following ? "Following" : "Follow"}
    </button>
  );
}
