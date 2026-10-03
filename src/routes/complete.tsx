import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { Button } from "@/components/ui-kit";
import { useOnboarding } from "@/lib/onboarding-store";

export const Route = createFileRoute("/complete")({
  head: () => ({
    meta: [
      { title: "You're ready — Brand" },
      { name: "description", content: "Your setup is complete." },
      { property: "og:title", content: "You're ready — Brand" },
      { property: "og:description", content: "Your setup is complete." },
    ],
  }),
  component: Complete,
});

function Complete() {
  const navigate = useNavigate();
  const { role } = useOnboarding();
  const isProvider = role === "provider";

  return (
    <OnboardingLayout
      onBack={() =>
        navigate({ to: isProvider ? "/setup/provider" : "/setup/customer" })
      }
      backLabel="Back to setup"
      progress={isProvider ? { current: 7, total: 7 } : { current: 5, total: 5 }}
      eyebrow="Setup complete"
      title={isProvider ? "Your profile is ready." : "You're ready."}
      description={
        isProvider
          ? "People will be able to find you when they need the services you provide."
          : "Whenever something needs to get done, just tell your assistant."
      }
      footer={
        <Button
          size="lg"
          onClick={() => navigate({ to: isProvider ? "/provider" : "/home" })}
        >
          {isProvider ? "Go to my workspace" : "Go to my assistant"}
        </Button>
      }
    />
  );
}
