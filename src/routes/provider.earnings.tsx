import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownToLine, Landmark } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PageContainer } from "@/components/provider/provider-shell";
import { PageHeader, Panel, Pill, SectionHeader, btn } from "@/components/provider/primitives";
import { earningsSeries, naira, payouts } from "@/lib/provider-data";

export const Route = createFileRoute("/provider/earnings")({
  component: EarningsPage,
});

const config = { value: { label: "Earnings", color: "var(--color-foreground)" } } satisfies ChartConfig;

const stats = [
  { label: "Available to withdraw", value: naira(940000), hint: "From 1 completed job" },
  { label: "Pending", value: naira(765000), hint: "Released after customer confirms" },
  { label: "This month", value: naira(3_900_000), hint: "+15% vs September" },
  { label: "Platform fee", value: "8%", hint: "Pro plan rate · Free is 12%" },
];

function EarningsPage() {
  const weekTotal = earningsSeries.reduce((n, d) => n + d.value, 0);
  return (
    <PageContainer wide>
      <PageHeader
        title="Earnings"
        description="What you've earned, what's on the way, and where it goes."
        actions={
          <button
            type="button"
            className={btn.primary}
            onClick={() => toast.success("Withdrawal started", { description: "₦940,000 to GTBank ••4821 · arrives today" })}
          >
            <ArrowDownToLine className="h-3.5 w-3.5" aria-hidden="true" /> Withdraw ₦940,000
          </button>
        }
      />

      <dl className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((s, i) => (
          <Panel key={s.label} as="div" className={i === 0 ? "bg-foreground p-4 text-background" : "p-4"}>
            <dt className={i === 0 ? "text-xs text-background/70" : "text-xs text-muted-foreground"}>{s.label}</dt>
            <dd className="mt-1.5 text-xl font-semibold tabular-nums md:text-2xl">{s.value}</dd>
            <p className={i === 0 ? "mt-1 text-xs text-background/70" : "mt-1 text-xs text-muted-foreground"}>{s.hint}</p>
          </Panel>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Panel className="p-4 md:p-5" aria-labelledby="week-title">
          <SectionHeader id="week-title" title="This week" description={`${naira(weekTotal)} across 5 jobs`} />
          <ChartContainer config={config} className="mt-4 h-56 w-full">
            <BarChart data={earningsSeries} margin={{ left: 0, right: 0, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(v) => naira(Number(v))} />} />
              <Bar dataKey="value" fill="var(--color-value)" radius={[4, 4, 0, 0]} maxBarSize={36} />
            </BarChart>
          </ChartContainer>
        </Panel>

        <Panel className="p-4 md:p-5" aria-labelledby="method-title">
          <SectionHeader id="method-title" title="Payout method" />
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-border p-3">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-surface">
              <Landmark className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="flex-1">
              <p className="text-[13px] font-medium">GTBank •••• 4821</p>
              <p className="text-xs text-muted-foreground">Daniel Okafor · Instant payouts on</p>
            </div>
            <button type="button" className={btn.ghost}>
              Change
            </button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Payments are held securely until the customer confirms the job is done, then released within minutes.
          </p>
        </Panel>
      </div>

      <Panel className="mt-6 overflow-hidden" aria-labelledby="history-title">
        <div className="px-4 py-3.5 md:px-5">
          <SectionHeader id="history-title" title="Payout history" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-[13px]">
            <thead>
              <tr className="border-y border-border bg-surface text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium md:px-5">Job</th>
                <th className="px-4 py-2 font-medium">Date</th>
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 text-right font-medium md:px-5">Amount</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-b-0">
                  <td className="px-4 py-3 md:px-5">
                    <p className="font-medium">{p.job}</p>
                    <p className="text-xs text-muted-foreground">{p.id}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.date}</td>
                  <td className="px-4 py-3">
                    <Pill tone={p.status === "Paid" ? "positive" : "attention"}>{p.status}</Pill>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums md:px-5">{naira(p.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </PageContainer>
  );
}
