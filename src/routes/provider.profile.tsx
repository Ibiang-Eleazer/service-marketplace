import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Clock, Eye, MapPin, Pencil, Star } from "lucide-react";
import { useState } from "react";
import { PageContainer } from "@/components/provider/provider-shell";
import { Avatar, Panel, Verified, btn } from "@/components/provider/primitives";
import { feed, jobs, naira, portfolio, provider } from "@/lib/provider-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/provider/profile")({
  component: ProfilePage,
});

const tabs = ["Work", "Services", "Reviews", "Posts"] as const;
const reviews = [
  ...jobs.filter((j) => j.review).map((j) => ({ name: j.customer.name, initials: j.customer.initials, ...j.review!, service: j.service })),
  { name: "Ifeoma C.", initials: "IC", rating: 5, text: "Turned our awkward alcove into the best storage in the house.", service: "Bespoke furniture" },
  { name: "Yusuf A.", initials: "YA", rating: 4, text: "Great work, a day later than planned but kept me updated throughout.", service: "Kitchen installation" },
];

function ProfilePage() {
  const [tab, setTab] = useState<(typeof tabs)[number]>("Work");

  return (
    <PageContainer>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-border-strong px-3 py-2">
        <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
          <Eye className="h-4 w-4" aria-hidden="true" /> This is how customers see your profile.
        </p>
        <button type="button" className={btn.secondary}>
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" /> Edit profile
        </button>
      </div>

      <Panel className="p-5 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start">
          <Avatar initials={provider.initials} size="xl" />
          <div className="min-w-0 flex-1">
            <h1 className="flex items-center gap-1.5 text-2xl font-semibold">
              {provider.name}
              <Verified className="h-5 w-5" />
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {provider.title} · {provider.business}
            </p>
            <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 fill-foreground text-foreground" aria-hidden="true" />
                <span className="font-medium text-foreground">{provider.rating}</span> ({provider.reviewCount} reviews)
              </li>
              <li className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> {provider.location} · {provider.serviceRadiusKm} km
              </li>
              <li className="flex items-center gap-1.5">
                <Briefcase className="h-3.5 w-3.5" aria-hidden="true" /> {provider.yearsExperience} years ·{" "}
                {provider.jobsCompleted} jobs
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> Replies in {provider.responseTime}
              </li>
            </ul>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground text-pretty">{provider.bio}</p>
          </div>
          <div className="flex gap-2 md:flex-col">
            <button type="button" className={cn(btn.primary, "h-9 flex-1 px-4")}>
              Request service
            </button>
            <button type="button" className={cn(btn.secondary, "h-9 flex-1 px-4")}>
              Message
            </button>
          </div>
        </div>
      </Panel>

      <div role="tablist" aria-label="Profile sections" className="mt-6 flex gap-1 border-b border-border">
        {tabs.map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "-mb-px h-10 border-b-2 px-3 text-[13px] transition-colors",
              tab === t ? "border-foreground font-medium text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "Work" ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {portfolio.map((p) => (
              <li key={p.title}>
                <figure className="overflow-hidden rounded-xl border border-border bg-card">
                  <img src={p.image} alt={p.title} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                  <figcaption className="p-3">
                    <p className="text-[13px] font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </figcaption>
                </figure>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "Services" ? (
          <Panel as="div" className="divide-y divide-border">
            {provider.services.map((s) => (
              <div key={s.name} className="flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="text-sm font-medium">{s.name}</p>
                  <p className="text-xs text-muted-foreground">Typically {s.duration}</p>
                </div>
                <p className="text-sm">
                  <span className="text-xs text-muted-foreground">from </span>
                  <span className="font-semibold tabular-nums">{naira(s.from)}</span>
                </p>
              </div>
            ))}
          </Panel>
        ) : null}

        {tab === "Reviews" ? (
          <ul className="grid gap-4 md:grid-cols-2">
            {reviews.map((r) => (
              <li key={r.name}>
                <Panel as="article" className="h-full p-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={r.initials} size="sm" />
                    <div className="flex-1">
                      <p className="text-[13px] font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.service}</p>
                    </div>
                    <p className="flex gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn("h-3 w-3", i < r.rating ? "fill-foreground text-foreground" : "text-border-strong")}
                          aria-hidden="true"
                        />
                      ))}
                    </p>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">&ldquo;{r.text}&rdquo;</p>
                </Panel>
              </li>
            ))}
          </ul>
        ) : null}

        {tab === "Posts" ? (
          <ul className="grid gap-4 sm:grid-cols-2">
            {feed
              .filter((p) => p.isOwn)
              .map((p) => (
                <li key={p.id}>
                  <Panel as="article" className="overflow-hidden">
                    <img src={p.image} alt={p.imageAlt} className="aspect-[16/10] w-full object-cover" loading="lazy" />
                    <div className="p-4">
                      <p className="line-clamp-3 text-sm">{p.caption}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {p.time} · {p.reactions} appreciations
                      </p>
                    </div>
                  </Panel>
                </li>
              ))}
          </ul>
        ) : null}
      </div>
    </PageContainer>
  );
}
