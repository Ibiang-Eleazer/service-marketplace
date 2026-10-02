import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Briefcase,
  CalendarDays,
  Home,
  MessageSquare,
  MoreHorizontal,
  Settings,
  Sparkles,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { Brand } from "@/components/brand";
import { AiMark } from "@/components/ai-mark";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, ProBadge } from "@/components/provider/primitives";
import { AvailabilityControl } from "@/components/provider/availability-control";
import { provider } from "@/lib/provider-data";
import { useProvider } from "@/lib/provider-store";
import { cn } from "@/lib/utils";

type NavItem = {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  pro?: boolean;
  exact?: boolean;
};

const groups: { label: string; items: NavItem[] }[] = [
  {
    label: "Work",
    items: [
      { to: "/provider", label: "Home", icon: Home, exact: true },
      { to: "/provider/jobs", label: "Jobs", icon: Briefcase, badge: 3 },
      { to: "/provider/calendar", label: "Calendar", icon: CalendarDays },
      { to: "/provider/messages", label: "Messages", icon: MessageSquare, badge: 3 },
      { to: "/provider/earnings", label: "Earnings", icon: Wallet },
    ],
  },
  {
    label: "Presence",
    items: [
      { to: "/provider/profile", label: "Profile", icon: UserRound },
      { to: "/provider/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Intelligence",
    items: [{ to: "/provider/assistant", label: "AI Assistant", icon: Sparkles, pro: true }],
  },
];

const allItems = groups.flatMap((g) => g.items);
const mobilePrimary = ["/provider", "/provider/jobs", "/provider/calendar", "/provider/messages"];

function useIsActive() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (item: Pick<NavItem, "to" | "exact">) =>
    item.exact
      ? pathname === item.to || pathname === `${item.to}/`
      : pathname === item.to || pathname.startsWith(`${item.to}/`);
}

function SidebarLink({ item }: { item: NavItem }) {
  const isActive = useIsActive()(item);
  const Icon = item.icon;
  return (
    <Link
      to={item.to}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "group flex h-8 items-center gap-2.5 rounded-md px-2.5 text-[13px] transition-colors",
        isActive
          ? "bg-card font-medium text-foreground shadow-subtle ring-1 ring-border"
          : "text-muted-foreground hover:bg-accent hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" strokeWidth={isActive ? 2 : 1.75} aria-hidden="true" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge ? (
        <span className="min-w-5 rounded-full bg-foreground px-1.5 text-center text-[10px] font-semibold leading-[18px] text-background">
          {item.badge}
        </span>
      ) : null}
      {item.pro ? <ProBadge /> : null}
    </Link>
  );
}

function Sidebar() {
  const { plan } = useProvider();
  return (
    <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
      <div className="flex h-14 items-center px-4">
        <Brand />
        <span className="ml-2 rounded-[4px] bg-foreground/[0.06] px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Provider
        </span>
      </div>

      <div className="px-3 pb-2">
        <AvailabilityControl variant="block" />
      </div>

      <nav aria-label="Provider" className="flex-1 overflow-y-auto px-3 py-2">
        {groups.map((g) => (
          <div key={g.label} className="mb-4">
            <p className="px-2.5 pb-1.5 text-[11px] font-medium text-muted-foreground/80">
              {g.label}
            </p>
            <div className="flex flex-col gap-0.5">
              {g.items.map((item) => (
                <SidebarLink key={item.to} item={item} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-2 border-t border-border p-3">
        {plan === "free" ? (
          <Link
            to="/provider/settings"
            className="rounded-lg border border-border bg-card p-3 text-left shadow-subtle transition-colors hover:bg-accent"
          >
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-foreground">
              <AiMark working={false} size={14} /> Try Brand Pro
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              AI assistant, Hands-off mode and deeper analytics.
            </p>
          </Link>
        ) : null}
        <SidebarLink item={{ to: "/provider/settings", label: "Settings", icon: Settings }} />
        <div className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5">
          <Avatar initials={provider.initials} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-foreground">{provider.name}</p>
            <p className="truncate text-[11px] text-muted-foreground">
              {plan === "pro" ? "Pro plan" : "Free plan"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function MobileTabBar() {
  const isActive = useIsActive();
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = mobilePrimary.map((to) => allItems.find((i) => i.to === to)!);
  const secondary = [
    ...allItems.filter((i) => !mobilePrimary.includes(i.to)),
    { to: "/provider/settings", label: "Settings", icon: Settings },
  ];
  const moreActive = secondary.some((i) => isActive(i));

  return (
    <>
      <nav
        aria-label="Provider mobile"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
      >
        <div className="mx-auto grid max-w-lg grid-cols-5">
          {primary.map((item) => {
            const active = isActive(item);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex h-14 flex-col items-center justify-center gap-1 text-[10.5px] transition-colors",
                  active ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                <span className="relative">
                  <Icon className="h-5 w-5" strokeWidth={active ? 2.1 : 1.6} aria-hidden="true" />
                  {item.badge ? (
                    <span className="absolute -right-2 -top-1 min-w-4 rounded-full bg-foreground px-1 text-center text-[9px] font-semibold leading-4 text-background">
                      {item.badge}
                    </span>
                  ) : null}
                </span>
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setMoreOpen(true)}
            aria-haspopup="dialog"
            className={cn(
              "flex h-14 flex-col items-center justify-center gap-1 text-[10.5px]",
              moreActive ? "font-medium text-foreground" : "text-muted-foreground",
            )}
          >
            <MoreHorizontal className="h-5 w-5" strokeWidth={1.6} aria-hidden="true" />
            More
          </button>
        </div>
      </nav>

      <Sheet open={moreOpen} onOpenChange={setMoreOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 pb-8">
          <SheetHeader className="px-0">
            <SheetTitle className="text-left text-base">More</SheetTitle>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-2">
            {secondary.map((item) => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className={cn(
                    "flex flex-col items-start gap-3 rounded-xl border p-3 text-[13px] transition-colors",
                    active
                      ? "border-foreground/20 bg-accent font-medium text-foreground"
                      : "border-border bg-card text-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="h-[18px] w-[18px]" strokeWidth={1.75} aria-hidden="true" />
                  <span className="flex items-center gap-1.5">
                    {item.label}
                    {"pro" in item && item.pro ? <ProBadge /> : null}
                  </span>
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}

function MobileTopBar() {
  return (
    <div className="sticky top-0 z-30 flex h-13 items-center gap-3 border-b border-border bg-background/90 px-4 py-2.5 backdrop-blur-xl lg:hidden">
      <Brand />
      <div className="ml-auto">
        <AvailabilityControl variant="compact" />
      </div>
    </div>
  );
}

export function ProviderShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileTopBar />
        <main className="flex-1 pb-24 lg:pb-0">{children}</main>
      </div>
      <MobileTabBar />
    </div>
  );
}

export function PageContainer({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-6 md:px-8 md:py-8",
        wide ? "max-w-[1400px]" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
