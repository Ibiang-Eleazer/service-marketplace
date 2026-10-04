import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Image as ImageIcon, Video, Sparkles } from "lucide-react";
import { feedStore } from "@/lib/feed-store";
import { customerProfile, composerPrompts } from "@/lib/feed-data";
import { cn } from "@/lib/utils";

export function Composer({ onAskAi }: { onAskAi?: () => void }) {
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const expanded = focused || text.length > 0;

  const placeholder = useMemo(() => {
    return composerPrompts[Math.floor(Math.random() * composerPrompts.length)];
  }, []);

  return (
    <div className="rise-in border-b border-border bg-card px-4 py-3">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-xs font-semibold text-foreground">
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
            placeholder={placeholder}
            className="min-h-10 w-full resize-none bg-transparent text-[15px] leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
          />
          {expanded ? (
            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label="Add image"
                  onClick={() => toast("Image upload coming soon")}
                  className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <ImageIcon className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Add video"
                  onClick={() => toast("Video upload coming soon")}
                  className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Video className="h-4 w-4" aria-hidden="true" />
                </button>
                {onAskAi ? (
                  <button
                    type="button"
                    aria-label="Ask AI for help"
                    onClick={onAskAi}
                    className="flex h-8 items-center gap-1.5 rounded-md px-2 text-[13px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="hidden sm:inline">Ask AI</span>
                  </button>
                ) : null}
              </div>
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
                  "inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-4 text-[13px] font-medium text-background transition-opacity",
                  !text.trim() && "opacity-40",
                )}
              >
                Post
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
