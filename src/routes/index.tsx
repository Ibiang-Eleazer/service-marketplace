import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, type CSSProperties } from "react";
import { Brand } from "@/components/brand";
import { Arrow, Button } from "@/components/ui-kit";
import { AssistantDemo, type DemoHandle } from "@/components/assistant-demo";
import { HowItWorks } from "@/components/how-it-works";
import { useReveal } from "@/hooks/use-reveal";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Tell us what needs to get done — Brand" },
      {
        name: "description",
        content:
          "An AI assistant that understands what you need, finds trusted providers nearby, compares your options, and helps you take the next step.",
      },
      { property: "og:title", content: "Tell us what needs to get done — Brand" },
      {
        property: "og:description",
        content:
          "An AI assistant that helps you get real-world tasks done, from finding trusted providers to taking the next step.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Welcome,
});

const d = (ms: number) => ({ animationDelay: `${ms}ms` }) as CSSProperties;

function Welcome() {
  const navigate = useNavigate();
  const demo = useRef<DemoHandle>(null);
  const closing = useReveal<HTMLDivElement>();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-background/85 px-6 py-4 backdrop-blur md:px-10">
        <Brand />
        <Button variant="ghost" onClick={() => navigate({ to: "/signup" })}>
          Sign in
        </Button>
      </header>

      <main className="mx-auto grid w-full max-w-6xl items-center gap-14 px-6 py-16 md:px-10 lg:min-h-[calc(100vh-65px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-20 lg:py-20">
        <div className="max-w-lg">
          <p className="rise-in text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground" style={d(0)}>
            AI assistant for the physical world
          </p>
          <h1 className="rise-in mt-5 text-4xl font-semibold leading-[1.08] text-foreground md:text-[3.25rem]" style={d(90)}>
            Tell us what needs to get done.
          </h1>
          <p className="rise-in mt-5 text-[1.05rem] leading-relaxed text-muted-foreground" style={d(180)}>
            Your assistant understands what you need, finds trusted providers
            nearby, compares your options, and asks before taking the next step.
          </p>
          <div className="rise-in mt-9 flex flex-wrap items-center gap-3" style={d(270)}>
            <Button size="lg" onClick={() => navigate({ to: "/signup" })}>
              Get started
              <Arrow />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => {
                demo.current?.replay();
                document
                  .getElementById("demo")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" });
              }}
            >
              Watch it again
            </Button>
          </div>
          <p className="rise-in mt-8 max-w-sm text-sm leading-relaxed text-muted-foreground" style={d(360)}>
            The assistant always asks before it contacts anyone on your behalf.
          </p>
        </div>

        <div id="demo" className="rise-in" style={d(200)}>
          <AssistantDemo handleRef={demo} />
        </div>
      </main>

      <HowItWorks />

      <section className="border-t border-border">
        <div
          ref={closing.ref}
          data-visible={closing.visible}
          className="reveal mx-auto flex w-full max-w-6xl flex-col items-start justify-between gap-6 px-6 py-16 md:flex-row md:items-center md:px-10"
        >
          <h2 className="max-w-md text-2xl font-semibold text-foreground">
            Tell it what's wrong. It takes it from there — with your permission.
          </h2>
          <Button size="lg" onClick={() => navigate({ to: "/signup" })}>
            Get started
            <Arrow />
          </Button>
        </div>
      </section>
    </div>
  );
}
