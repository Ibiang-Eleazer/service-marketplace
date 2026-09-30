import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { Button } from "@/components/ui-kit";
import { onboarding, useOnboarding, type Role } from "@/lib/onboarding-store";

export const Route = createFileRoute("/role")({
  head: () => ({
    meta: [
      { title: "How will you use the platform? — Brand" },
      {
        name: "description",
        content: "Choose whether you need something done or provide services.",
      },
      { property: "og:title", content: "How will you use the platform? — Brand" },
      {
        property: "og:description",
        content: "Choose whether you need something done or provide services.",
      },
    ],
  }),
  component: RoleSelection,
});

const options: { id: Role; title: string; description: string }[] = [
  {
    id: "customer",
    title: "I need something done",
    description: "Find trusted people to solve problems for you.",
  },
  {
    id: "provider",
    title: "I provide services",
    description: "Get discovered by people who need your skills.",
  },
];

function RoleSelection() {
  const navigate = useNavigate();
  const { role } = useOnboarding();

  return (
    <OnboardingLayout
      onBack={() => navigate({ to: "/signup" })}
      progress={{ current: 2, total: 4 }}
      title="How will you use the platform?"
      description="You can change this later."
      footer={
        <Button
          size="lg"
          disabled={!role}
          onClick={() =>
            navigate({
              to: role === "provider" ? "/setup/provider" : "/setup/customer",
            })
          }
        >
          Continue
        </Button>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {options.map((option) => {
          const selected = role === option.id;
          return (
            <button
              key={option.id}
              type="button"
              aria-pressed={selected}
              onClick={() => onboarding.set({ role: option.id })}
              className={
                "rounded-lg border p-5 text-left transition-all duration-150 " +
                (selected
                  ? "border-foreground bg-card shadow-raised"
                  : "border-border bg-card shadow-subtle hover:border-border-strong hover:shadow-panel")
              }
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-foreground">
                  {option.title}
                </h2>
                <span
                  aria-hidden="true"
                  className={
                    "mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border text-[9px] " +
                    (selected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border-strong")
                  }
                >
                  {selected ? "✓" : ""}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {option.description}
              </p>
            </button>
          );
        })}
      </div>
    </OnboardingLayout>
  );
}
