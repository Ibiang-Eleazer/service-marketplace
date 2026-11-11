import { Check } from "lucide-react";
import { Panel, SectionHeader, btn } from "@/components/provider/primitives";
import { PRO_PRICE_LABEL, TRIAL_DAYS } from "@/lib/assistant-plans";

const proIncludes = [
  "AI Assistant with drafted replies, schedule plans and insights",
  "Hands-off mode with a one-tap approval queue",
  "Advanced analytics and insights",
  "8% platform fee instead of 12%",
];

const terms: { label: string; value: string }[] = [
  {
    label: "What you get",
    value: `Full Pro access to the AI Assistant and Hands-off mode for ${TRIAL_DAYS} days.`,
  },
  {
    label: "When it starts and ends",
    value: `It starts when you activate it and ends ${TRIAL_DAYS} days later. Your exact dates appear once activation is connected.`,
  },
  {
    label: "When it expires",
    value:
      "To be confirmed. You will be told exactly what changes before the trial starts.",
  },
  {
    label: "Payment method",
    value:
      "Not yet confirmed. It will be stated before you activate the trial.",
  },
  {
    label: "Price and renewal",
    value: `After the trial, Pro is ${PRO_PRICE_LABEL}, as listed in Settings. Whether it renews automatically is not yet confirmed and will be shown before you activate.`,
  },
  {
    label: "Cancelling",
    value: "Switch back to Free at any time in Settings.",
  },
];

export function AssistantTrialCard() {
  return (
    <Panel
      className="grid gap-6 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
      aria-labelledby="trial-title"
    >
      <div className="flex flex-col gap-5">
        <SectionHeader
          id="trial-title"
          title="Start your free 3-day trial"
          description="Try the Assistant on your own business before you decide. Nothing starts until you choose to activate it."
        />
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Included in Pro
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {proIncludes.map((item) => (
              <li key={item} className="flex items-start gap-2 text-[13px]">
                <Check
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <button
            type="button"
            disabled
            className={`${btn.primary} h-10 w-full justify-center text-sm`}
          >
            Start your free 3-day trial
          </button>
          <p className="text-xs text-muted-foreground">
            Trial activation is not connected yet, so no trial has been started
            and no payment is taken.
          </p>
        </div>
      </div>

      <dl className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
        {terms.map((t) => (
          <div key={t.label} className="flex flex-col gap-1 px-4 py-3">
            <dt className="text-xs font-medium text-foreground">{t.label}</dt>
            <dd className="text-[13px] leading-relaxed text-muted-foreground">
              {t.value}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
