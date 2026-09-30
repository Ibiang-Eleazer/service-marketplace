import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { Button } from "@/components/ui-kit";
import { onboarding } from "@/lib/onboarding-store";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create your account — Brand" },
      {
        name: "description",
        content: "Create an account to start using your assistant.",
      },
      { property: "og:title", content: "Create your account — Brand" },
      {
        property: "og:description",
        content: "Create an account to start using your assistant.",
      },
    ],
  }),
  component: SignUp,
});

const methods = [
  { id: "google", label: "Continue with Google" },
  { id: "apple", label: "Continue with Apple" },
  { id: "email", label: "Continue with email" },
  { id: "phone", label: "Continue with phone" },
];

function SignUp() {
  const navigate = useNavigate();

  return (
    <OnboardingLayout
      onBack={() => navigate({ to: "/" })}
      progress={{ current: 1, total: 4 }}
      title="Create your account"
      description="One account for everything you need done."
    >
      <div className="max-w-sm space-y-2.5">
        {methods.map((m) => (
          <Button
            key={m.id}
            variant={m.id === "google" ? "primary" : "secondary"}
            size="lg"
            className="w-full justify-center"
            onClick={() => {
              onboarding.set({ authMethod: m.id });
              navigate({ to: "/role" });
            }}
          >
            {m.label}
          </Button>
        ))}
        <p className="pt-3 text-xs text-muted-foreground">
          Prototype only — no real account is created.
        </p>
      </div>
    </OnboardingLayout>
  );
}
