import { createFileRoute } from "@tanstack/react-router";
import { Brand } from "@/components/brand";
import { Button, Input } from "@/components/ui-kit";
import { useOnboarding } from "@/lib/onboarding-store";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "Your assistant — Brand" },
      {
        name: "description",
        content: "Tell your assistant what needs to get done.",
      },
      { property: "og:title", content: "Your assistant — Brand" },
      {
        property: "og:description",
        content: "Tell your assistant what needs to get done.",
      },
    ],
  }),
  component: Assistant,
});

function Assistant() {
  const { customer } = useOnboarding();
  const firstName = customer.name.trim().split(" ")[0];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-10">
        <Brand />
        <span className="text-xs text-muted-foreground">
          {customer.location || "Location not set"}
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center px-6 py-20">
        <div className="rise-in">
          <h1 className="text-3xl font-semibold text-foreground">
            {firstName ? `Hi ${firstName}.` : "Hi there."} What needs to get done?
          </h1>
          <p className="mt-3 text-[0.95rem] text-muted-foreground">
            Describe the problem in your own words. Your assistant will figure out
            the rest and check with you before contacting anyone.
          </p>

          <form
            className="mt-8 flex gap-2"
            onSubmit={(e) => e.preventDefault()}
            aria-label="Describe your task"
          >
            <label htmlFor="task" className="sr-only">
              What needs to get done?
            </label>
            <Input id="task" placeholder="My sink is leaking" className="h-11" />
            <Button size="lg" type="submit">
              Ask
            </Button>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            Provider search is coming next — this prototype stops here.
          </p>
        </div>
      </main>
    </div>
  );
}
