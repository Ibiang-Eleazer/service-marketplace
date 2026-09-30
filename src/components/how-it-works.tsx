import type { CSSProperties, ReactNode } from "react";
import { useReveal } from "@/hooks/use-reveal";
import { AiMark, AiWave } from "@/components/ai-mark";

const stages: { n: string; title: string; body: string; visual: ReactNode }[] = [
  {
    n: "01",
    title: "Tell us what's wrong.",
    body: "Describe it the way you'd tell a friend. No categories, no forms.",
    visual: <TypingVisual />,
  },
  {
    n: "02",
    title: "We figure out what you need.",
    body: "The assistant interprets your request and identifies the right kind of help.",
    visual: <InterpretVisual />,
  },
  {
    n: "03",
    title: "We find relevant people nearby.",
    body: "Trusted providers around you are matched on skill, distance and availability.",
    visual: <MapVisual />,
  },
  {
    n: "04",
    title: "You stay in control.",
    body: "Compare the options side by side. Nobody is contacted until you say so.",
    visual: <ControlVisual />,
  },
];

export function HowItWorks() {
  const head = useReveal<HTMLDivElement>();
  const grid = useReveal<HTMLDivElement>(0.15);

  return (
    <section className="border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 md:px-10 lg:py-28">
        <div
          ref={head.ref}
          data-visible={head.visible}
          className="reveal max-w-xl"
        >
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            How it works
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight text-foreground md:text-4xl">
            From a sentence to the right person.
          </h2>
        </div>

        <div ref={grid.ref} className="relative mt-14">
          {/* connecting line */}
          <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-border lg:block" />
          <div
            data-visible={grid.visible}
            className="draw-line absolute left-0 right-0 top-[7px] hidden h-px bg-foreground/60 lg:block"
          />
          <ol className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {stages.map((s, i) => (
              <li
                key={s.n}
                data-visible={grid.visible}
                className="reveal"
                style={{ "--reveal-delay": `${i * 140}ms` } as CSSProperties}
              >
                <span className="relative z-10 block h-[15px] w-[15px] rounded-full border border-foreground/60 bg-surface p-[3px]">
                  <span className="block h-full w-full rounded-full bg-foreground" />
                </span>
                <p className="mt-5 font-mono text-[11px] tracking-wider text-muted-foreground">
                  {s.n}
                </p>
                <h3 className="mt-2 text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                <div className="mt-6 h-36 overflow-hidden rounded-lg border border-border bg-card p-4 shadow-subtle transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-panel">
                  {grid.visible ? s.visual : null}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function TypingVisual() {
  const text = "My sink is leaking.";
  return (
    <div className="flex h-full flex-col justify-end gap-3">
      <div className="flex justify-end">
        <p className="rise-in rounded-lg rounded-br-sm bg-primary px-3 py-1.5 text-xs text-primary-foreground" style={{ animationDelay: "900ms" }}>
          {text}
        </p>
      </div>
      <div className="flex h-8 items-center rounded-md border border-input px-2.5 text-xs text-muted-foreground">
        <span
          className="overflow-hidden whitespace-nowrap"
          style={{ animation: "type-in 0.9s steps(19) 0.1s both" }}
        >
          {text}
        </span>
        <span className="caret ml-px h-3.5 w-px bg-foreground" />
      </div>
      <style>{`@keyframes type-in{from{max-width:0}to{max-width:12rem}}`}</style>
    </div>
  );
}

function InterpretVisual() {
  return (
    <div className="flex h-full flex-col justify-center gap-3">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <AiMark working size={14} />
        Interpreting
        <AiWave />
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["Plumbing", "Leak repair", "Urgent-ish"].map((c, i) => (
          <span
            key={c}
            className="rise-in rounded-full border border-border bg-surface px-2 py-0.5 text-[11px] text-foreground"
            style={{ animationDelay: `${600 + i * 180}ms` }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function MapVisual() {
  const dots = [
    [24, 30],
    [72, 26],
    [64, 74],
    [30, 72],
  ];
  return (
    <div className="relative -m-4 h-[calc(100%+2rem)] bg-surface">
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2">
        <span className="ai-ring absolute inset-0 rounded-full border border-foreground/30" />
        <span className="ai-ring absolute inset-0 rounded-full border border-foreground/20" style={{ animationDelay: "1.2s" }} />
        <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-foreground" />
      </div>
      {dots.map(([x, y], i) => (
        <span
          key={i}
          className="pop-in absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-card bg-muted-foreground"
          style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${500 + i * 260}ms` }}
        />
      ))}
    </div>
  );
}

function ControlVisual() {
  return (
    <div className="flex h-full flex-col justify-between">
      <div className="space-y-1.5">
        {[
          ["Marcus Bell", "Today", true],
          ["Ada Okafor", "Today", false],
        ].map(([name, when, best], i) => (
          <div
            key={name as string}
            className={
              "rise-in flex items-center justify-between rounded-md border px-2.5 py-1.5 text-[11px] " +
              (best ? "border-foreground/70 text-foreground" : "border-border text-muted-foreground")
            }
            style={{ animationDelay: `${300 + i * 150}ms` }}
          >
            <span className="font-medium">{name}</span>
            <span>{when}</span>
          </div>
        ))}
      </div>
      <div className="rise-in flex items-center gap-2" style={{ animationDelay: "1000ms" }}>
        <span className="text-[11px] text-foreground">Contact them?</span>
        <span className="ml-auto rounded bg-primary px-2 py-0.5 text-[10px] text-primary-foreground">Yes</span>
        <span className="rounded border border-border-strong px-2 py-0.5 text-[10px] text-foreground">Not yet</span>
      </div>
    </div>
  );
}
