import { createFileRoute } from "@tanstack/react-router";
import { ArrowUpRight, Lightbulb } from "lucide-react";
import { useState } from "react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { PageContainer } from "@/components/provider/provider-shell";
import { PageHeader, Panel, ProGate, SectionHeader } from "@/components/provider/primitives";
import { monthlyRevenue } from "@/lib/provider-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/analytics")({
  component: AnalyticsPage,
});

const ranges = ["7 days", "30 days", "6 months", "12 months"] as const;

const kpis = [
  { label: "Revenue", value: "₦3.9M", delta: "+15%" },
  { label: "Jobs completed", value: "14", delta: "+27%" },
  { label: "Acceptance rate", value: "86%", delta: "+4 pts" },
  { label: "Avg. response", value: "12 min", delta: "−6 min" },
  { label: "Profile views", value: "3,990", delta: "+28%" },
  { label: "Request → booking", value: "41%", delta: "+3 pts" },
];

const revenueConfig = { revenue: { label: "Revenue (₦M)", color: "var(--color-foreground)" } } satisfies ChartConfig;
const requestsConfig = { requests: { label: "Requests", color: "var(--color-foreground)" } } satisfies ChartConfig;

const services = [
  { name: "Kitchen installation", jobs: 3, revenue: "₦2.2M", share: 56 },
  { name: "Custom wardrobes", jobs: 5, revenue: "₦1.1M", share: 28 },
  { name: "Bespoke furniture", jobs: 2, revenue: "₦420k", share: 11 },
  { name: "Repair & refinishing", jobs: 4, revenue: "₦180k", share: 5 },
];

const insights = [
  "Posts with finished-room photos drive 3× more profile views than workshop shots.",
  "Requests from Ikoyi convert at 58% — consider featuring Ikoyi projects.",
  "You decline most Sunday requests. Turning Sunday off would raise your acceptance rate to 91%.",
];

function AnalyticsPage() {
  const [range, setRange] = useState<(typeof ranges)[number]>("6 months");

  return (
    <PageContainer wide>
      <PageHeader
        title="Analytics"
        description="How your business and professional presence are growing."
        actions={
          <div role="radiogroup" aria-label="Date range" className="flex rounded-md border border-border bg-card p-0.5 shadow-subtle">
            {ranges.map((r) => (
              <button
                key={r}
                role="radio"
                aria-checked={range === r}
                onClick={() => setRange(r)}
                className={cn(
                  "h-7 rounded-[5px] px-2.5 text-xs font-medium transition-colors",
                  range === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <Panel key={k.label} as="div" className="p-4">
            <dt className="text-xs text-muted-foreground">{k.label}</dt>
            <dd className="mt-1.5 text-xl font-semibold tabular-nums">{k.value}</dd>
            <p className="mt-0.5 inline-flex items-center text-[11px] font-medium text-emerald-700">
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
              {k.delta}
            </p>
          </Panel>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Panel className="p-4 md:p-5" aria-labelledby="rev-title">
          <SectionHeader id="rev-title" title="Revenue" description="Monthly, in millions of naira" />
          <ChartContainer config={revenueConfig} className="mt-4 h-56 w-full">
            <AreaChart data={monthlyRevenue} margin={{ left: 0, right: 0, top: 8 }}>
              <defs>
                <linearGradient id="revFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="var(--color-revenue)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area dataKey="revenue" type="monotone" stroke="var(--color-revenue)" strokeWidth={2} fill="url(#revFill)" />
            </AreaChart>
          </ChartContainer>
        </Panel>

        <Panel className="p-4 md:p-5" aria-labelledby="req-title">
          <SectionHeader id="req-title" title="Requests received" description="Monthly" />
          <ChartContainer config={requestsConfig} className="mt-4 h-56 w-full">
            <BarChart data={monthlyRevenue} margin={{ left: 0, right: 0, top: 8 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Bar dataKey="requests" fill="var(--color-requests)" radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ChartContainer>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <ProGate
          feature="Service performance"
          description="See which services earn the most, convert best, and where your time is best spent."
        >
          <Panel className="p-4 md:p-5" aria-labelledby="svc-title">
            <SectionHeader id="svc-title" title="Service performance" description="Share of revenue" />
            <ul className="mt-4 flex flex-col gap-4">
              {services.map((s) => (
                <li key={s.name}>
                  <div className="flex items-baseline justify-between gap-2 text-[13px]">
                    <span className="font-medium">{s.name}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {s.jobs} jobs · <span className="font-medium text-foreground">{s.revenue}</span>
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-foreground" style={{ width: `${s.share}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </ProGate>

        <ProGate feature="AI insights" description="Personalised recommendations based on your bookings, posts and reviews.">
          <Panel className="p-4 md:p-5" aria-labelledby="ins-title">
            <SectionHeader id="ins-title" title="Insights" description="Generated from the last 6 months" />
            <ul className="mt-4 flex flex-col gap-3">
              {insights.map((t) => (
                <li key={t} className="flex gap-2.5 text-[13px] leading-relaxed">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </Panel>
        </ProGate>
      </div>
    </PageContainer>
  );
}
