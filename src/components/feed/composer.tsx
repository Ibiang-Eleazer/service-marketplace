import { useState } from "react";
import { toast } from "sonner";
import { feedStore } from "@/lib/feed-store";
import { customerProfile } from "@/lib/feed-data";
import { cn } from "@/lib/utils";

export function Composer() {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const expanded = focused || text.length > 0;

  return (
    <div className="rise-in rounded-xl border border-border bg-card shadow-subtle">
      <div className="flex gap-3 p-4">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold text-foreground">
          {customerProfile.initials}
        </span>
        <div className="flex-1">
          <label htmlFor="composer" className="sr-only">
            Share something
          </label>
          <textarea
            id="composer"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            rows={expanded ? 3 : 1}
            placeholder="Share an idea, ask for help, or post something you're working on…"
            className="min-h-9 w-full resize-none bg-transparent text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
        </div>
      </div>
      {expanded ? (
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
          <p className="text-xs text-muted-foreground">
            No categories needed — the platform understands your post.
          </p>
          <button
            type="button"
            disabled={!text.trim()}
            onClick={() => {
              feedStore.addPost(text.trim());
              setText("");
              setFocused(false);
              toast.success("Posted to your feed");
            }}
            className={cn(
              "inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3.5 text-[13px] font-medium text-background transition-opacity",
              !text.trim() && "opacity-40",
            )}
          >
            Post
          </button>
        </div>
      ) : null}
    </div>
  );
}
