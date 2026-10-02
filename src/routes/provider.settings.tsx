import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { PageContainer } from "@/components/provider/provider-shell";
import { PageHeader, Panel, SectionHeader, btn } from "@/components/provider/primitives";
import { provider } from "@/lib/provider-data";
import { providerStore, useProvider } from "@/lib/provider-store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/settings")({
  component: SettingsPage,
});

const plans = [
  {
    key: "free" as const,
    name: "Free",
    price: "₦0",
    features: ["Requests, jobs & calendar", "Messages & payouts", "Professional feed", "Basic analytics", "12% platform fee"],
  },
  {
    key: "pro" as const,
    name: "Pro",
    price: "₦9,500/mo",
    features: ["Everything in Free", "AI Assistant & Hands-off mode", "Advanced analytics & insights", "Priority in local search", "8% platform fee"],
  },
];

const notificationPrefs = ["New requests", "Messages", "Booking changes", "Payouts", "Feed activity"];

function SettingsPage() {
  const { plan } = useProvider();
  const [notify, setNotify] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationPrefs.map((n) => [n, n !== "Feed activity"])),
  );

  return (
    <PageContainer>
      <PageHeader title="Settings" description="Plan, notifications and service area." />

      <section aria-labelledby="plan-title" className="mt-6">
        <SectionHeader id="plan-title" title="Plan" description="Switch anytime. Changes apply immediately." />
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {plans.map((p) => {
            const current = plan === p.key;
            return (
              <Panel key={p.key} as="div" className={cn("flex flex-col p-5", current && "ring-2 ring-foreground")}>
                <div className="flex items-baseline justify-between">
                  <p className="text-base font-semibold">{p.name}</p>
                  <p className="text-sm font-semibold tabular-nums">{p.price}</p>
                </div>
                <ul className="mt-4 flex flex-1 flex-col gap-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[13px]">
                      <Check className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  disabled={current}
                  className={cn(current ? btn.secondary : btn.primary, "mt-5 h-9")}
                  onClick={() => {
                    providerStore.setPlan(p.key);
                    toast.success(`You're on ${p.name}`);
                  }}
                >
                  {current ? "Current plan" : `Switch to ${p.name}`}
                </button>
              </Panel>
            );
          })}
        </div>
      </section>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <Panel className="p-5" aria-labelledby="notif-title">
          <SectionHeader id="notif-title" title="Notifications" />
          <ul className="mt-3">
            {notificationPrefs.map((n) => (
              <li key={n} className="flex items-center justify-between border-t border-border py-2.5 first:border-t-0">
                <label htmlFor={`n-${n}`} className="text-[13px]">
                  {n}
                </label>
                <Switch id={`n-${n}`} checked={notify[n]} onCheckedChange={(v) => setNotify((s) => ({ ...s, [n]: v }))} />
              </li>
            ))}
          </ul>
        </Panel>

        <Panel className="p-5" aria-labelledby="area-title">
          <SectionHeader id="area-title" title="Service area" />
          <dl className="mt-3 flex flex-col gap-3 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Base</dt>
              <dd className="font-medium">{provider.location}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Radius</dt>
              <dd className="font-medium">{provider.serviceRadiusKm} km</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Also covers</dt>
              <dd className="text-right font-medium">Ikoyi, VI, Ajah, Ikeja GRA</dd>
            </div>
          </dl>
          <button type="button" className={cn(btn.secondary, "mt-4")}>
            Edit service area
          </button>
        </Panel>
      </div>
    </PageContainer>
  );
}
