import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { Button, Field, Input, Select } from "@/components/ui-kit";
import { locations } from "@/lib/mock-providers";
import { onboarding, useOnboarding } from "@/lib/onboarding-store";

export const Route = createFileRoute("/setup/customer")({
  head: () => ({
    meta: [
      { title: "Personalize your experience — Brand" },
      {
        name: "description",
        content: "Tell your assistant your name and general location.",
      },
      { property: "og:title", content: "Personalize your experience — Brand" },
      {
        property: "og:description",
        content: "Tell your assistant your name and general location.",
      },
    ],
  }),
  component: CustomerSetup,
});

function CustomerSetup() {
  const navigate = useNavigate();
  const { customer } = useOnboarding();
  const [step, setStep] = useState(0);

  const canContinue = step === 0 ? customer.name.trim().length > 0 : !!customer.location;

  return (
    <OnboardingLayout
      onBack={() => (step === 0 ? navigate({ to: "/role" }) : setStep(step - 1))}
      progress={{ current: 3 + step, total: 5 }}
      eyebrow={step === 0 ? "About you" : "Where you are"}
      title="Let's personalize your experience."
      description={
        step === 0
          ? "First, what should your assistant call you?"
          : "A general area is enough for now — no precise location needed."
      }
      footer={
        <Button
          size="lg"
          disabled={!canContinue}
          onClick={() => (step === 0 ? setStep(1) : navigate({ to: "/complete" }))}
        >
          {step === 0 ? "Continue" : "Finish setup"}
        </Button>
      }
    >
      <div className="max-w-sm">
        {step === 0 ? (
          <Field label="Your name" htmlFor="name">
            <Input
              id="name"
              autoFocus
              value={customer.name}
              placeholder="Alex Morgan"
              onChange={(e) => onboarding.setCustomer({ name: e.target.value })}
            />
          </Field>
        ) : (
          <Field
            label="General location"
            htmlFor="location"
            hint="You can set a precise address later, when it's needed."
          >
            <Select
              id="location"
              value={customer.location}
              onChange={(e) => onboarding.setCustomer({ location: e.target.value })}
            >
              <option value="">Select an area</option>
              {locations.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </Select>
          </Field>
        )}
      </div>
    </OnboardingLayout>
  );
}
