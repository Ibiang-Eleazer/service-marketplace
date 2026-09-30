import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { OnboardingLayout } from "@/components/onboarding-layout";
import { Button, Field, Input, Select, Textarea } from "@/components/ui-kit";
import {
  availabilityOptions,
  experienceOptions,
  locations,
  serviceCategories,
} from "@/lib/mock-providers";
import { onboarding, useOnboarding } from "@/lib/onboarding-store";

export const Route = createFileRoute("/setup/provider")({
  head: () => ({
    meta: [
      { title: "Build your service profile — Brand" },
      {
        name: "description",
        content: "Set up the profile people see when they need your services.",
      },
      { property: "og:title", content: "Build your service profile — Brand" },
      {
        property: "og:description",
        content: "Set up the profile people see when they need your services.",
      },
    ],
  }),
  component: ProviderSetup,
});

const eyebrows = ["Identity", "What you do", "Where and when", "Your profile"];

function ProviderSetup() {
  const navigate = useNavigate();
  const { provider } = useOnboarding();
  const [step, setStep] = useState(0);
  const set = onboarding.setProvider;

  const valid = [
    provider.name.trim().length > 0,
    !!provider.category && provider.skills.trim().length > 0,
    !!provider.area && !!provider.availability && !!provider.experience,
    provider.description.trim().length > 0,
  ][step];

  return (
    <OnboardingLayout
      onBack={() => (step === 0 ? navigate({ to: "/role" }) : setStep(step - 1))}
      progress={{ current: 3 + step, total: 7 }}
      eyebrow={eyebrows[step]}
      title="Let's build your service profile."
      description="Four short steps. Everything can be edited later."
      footer={
        <Button
          size="lg"
          disabled={!valid}
          onClick={() => (step === 3 ? navigate({ to: "/complete" }) : setStep(step + 1))}
        >
          {step === 3 ? "Finish setup" : "Continue"}
        </Button>
      }
    >
      <div className="max-w-md space-y-6">
        {step === 0 ? (
          <Field label="Name or business name" htmlFor="pname">
            <Input
              id="pname"
              autoFocus
              value={provider.name}
              placeholder="Northside Plumbing"
              onChange={(e) => set({ name: e.target.value })}
            />
          </Field>
        ) : null}

        {step === 1 ? (
          <>
            <Field label="Main service category" htmlFor="category">
              <Select
                id="category"
                value={provider.category}
                onChange={(e) => set({ category: e.target.value })}
              >
                <option value="">Select a category</option>
                {serviceCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </Select>
            </Field>
            <Field
              label="Skills and services offered"
              htmlFor="skills"
              hint="Separate with commas."
            >
              <Input
                id="skills"
                value={provider.skills}
                placeholder="Leak repair, pipe fitting, boiler servicing"
                onChange={(e) => set({ skills: e.target.value })}
              />
            </Field>
          </>
        ) : null}

        {step === 2 ? (
          <>
            <Field label="General service area" htmlFor="area">
              <Select
                id="area"
                value={provider.area}
                onChange={(e) => set({ area: e.target.value })}
              >
                <option value="">Select an area</option>
                {locations.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Experience" htmlFor="experience">
              <Select
                id="experience"
                value={provider.experience}
                onChange={(e) => set({ experience: e.target.value })}
              >
                <option value="">Select experience</option>
                {experienceOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Availability" htmlFor="availability">
              <Select
                id="availability"
                value={provider.availability}
                onChange={(e) => set({ availability: e.target.value })}
              >
                <option value="">Select availability</option>
                {availabilityOptions.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
            </Field>
          </>
        ) : null}

        {step === 3 ? (
          <Field
            label="Short description"
            htmlFor="description"
            hint="One or two sentences on what you do well."
          >
            <Textarea
              id="description"
              value={provider.description}
              placeholder="Licensed plumber handling emergency leaks and full bathroom fittings across the city."
              onChange={(e) => set({ description: e.target.value })}
            />
          </Field>
        ) : null}
      </div>
    </OnboardingLayout>
  );
}
