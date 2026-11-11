import { useState } from "react";
import { Play } from "lucide-react";
import { Panel, SectionHeader } from "@/components/provider/primitives";
import { cn } from "@/lib/utils";

export type VideoSource = { src: string; type: string };

const chapters = [
  "The daily load of running a service business",
  "Meet the Assistant",
  "Customer enquiries, answered",
  "Scheduling and organisation",
  "Insights and growth",
  "Start your free trial",
];

const POSTER_URL =
  "https://images.pexels.com/photos/5973975/pexels-photo-5973975.jpeg?auto=compress&cs=tinysrgb&h=650&w=940";

export function AssistantProductVideo({
  sources = [],
}: {
  sources?: VideoSource[];
}) {
  const [started, setStarted] = useState(false);
  const hasVideo = sources.length > 0;

  return (
    <Panel className="overflow-hidden p-0" aria-labelledby="video-title">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="relative aspect-video bg-foreground">
          {started && hasVideo ? (
            <video
              className="h-full w-full object-cover"
              controls
              playsInline
              preload="none"
              poster={POSTER_URL}
            >
              {sources.map((s) => (
                <source key={s.src} src={s.src} type={s.type} />
              ))}
            </video>
          ) : (
            <>
              <img
                src={POSTER_URL}
                alt="A tradesperson reviewing work on a laptop in a workshop"
                width={940}
                height={650}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent px-6 text-center">
                <button
                  type="button"
                  disabled={!hasVideo}
                  onClick={() => setStarted(true)}
                  aria-label="Play product overview video"
                  className={cn(
                    "grid h-14 w-14 place-items-center rounded-full bg-background text-foreground shadow-panel transition-transform motion-safe:hover:scale-105",
                    !hasVideo && "cursor-not-allowed opacity-60",
                  )}
                >
                  <Play className="ml-0.5 h-5 w-5" aria-hidden="true" />
                </button>
                {hasVideo ? null : (
                  <p className="max-w-xs text-sm font-medium text-background">
                    Overview video in production. A placeholder is shown until
                    the final film is added.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col gap-4 p-5 md:p-6">
          <SectionHeader
            id="video-title"
            title="See the Assistant at work"
            description="About two minutes: the problems it removes, then a walkthrough of each job it helps with."
          />
          <ol className="flex flex-col gap-2.5">
            {chapters.map((c, i) => (
              <li
                key={c}
                className="flex items-start gap-3 text-[13px] text-muted-foreground"
              >
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-[10px] font-medium text-foreground">
                  {i + 1}
                </span>
                {c}
              </li>
            ))}
          </ol>
          {hasVideo ? null : (
            <p className="mt-auto rounded-lg bg-surface px-3 py-2 text-xs text-muted-foreground">
              Asset still needed: the final explainer film in MP4 and WebM
              formats. It loads only when a viewer presses play.
            </p>
          )}
        </div>
      </div>
    </Panel>
  );
}
