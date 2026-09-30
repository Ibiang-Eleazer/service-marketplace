import { createFileRoute } from "@tanstack/react-router";
import { Brand } from "@/components/brand";
import { useOnboarding } from "@/lib/onboarding-store";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your service profile — Brand" },
      {
        name: "description",
        content: "The profile people see when they need your services.",
      },
      { property: "og:title", content: "Your service profile — Brand" },
      {
        property: "og:description",
        content: "The profile people see when they need your services.",
      },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { provider } = useOnboarding();
  const skills = provider.skills
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border px-6 py-4 md:px-10">
        <Brand />
        <span className="text-xs text-muted-foreground">Provider profile</span>
      </header>

      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
        <div className="rise-in rounded-xl border border-border bg-card p-7 shadow-panel">
          <h1 className="text-2xl font-semibold text-foreground">
            {provider.name || "Your business"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {provider.category || "Service category"} ·{" "}
            {provider.area || "Service area"}
          </p>

          {provider.description ? (
            <p className="mt-5 text-[0.95rem] leading-relaxed text-foreground">
              {provider.description}
            </p>
          ) : null}

          {skills.length ? (
            <ul className="mt-6 flex flex-wrap gap-2">
              {skills.map((s) => (
                <li
                  key={s}
                  className="rounded-md border border-border px-2.5 py-1 text-xs text-muted-foreground"
                >
                  {s}
                </li>
              ))}
            </ul>
          ) : null}

          <dl className="mt-7 grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Experience
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {provider.experience || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                Availability
              </dt>
              <dd className="mt-1 text-sm text-foreground">
                {provider.availability || "—"}
              </dd>
            </div>
          </dl>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Prototype profile — discovery and messaging come later.
        </p>
      </main>
    </div>
  );
}
