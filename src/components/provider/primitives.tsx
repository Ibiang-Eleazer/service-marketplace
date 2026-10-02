import { Link } from "@tanstack/react-router";
import { BadgeCheck, Lock, Sparkles } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useProvider } from "@/lib/provider-store";

export function Avatar({
  initials,
  size = "md",
  className,
}: {
  initials: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-12 w-12 text-sm",
    xl: "h-20 w-20 text-xl",
  };
  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-border-strong bg-surface font-semibold text-foreground",
        sizes[size],
        className,
      )}
    >
      {initials}
    </span>
  );
}

export function Verified({ className }: { className?: string }) {
  return (
    <BadgeCheck
      className={cn("h-3.5 w-3.5 shrink-0 text-foreground", className)}
      aria-label="Verified provider"
    />
  );
}

export function Panel({
  className,
  children,
  as: Tag = "section",
  ...rest
}: {
  className?: string;
  children: ReactNode;
  as?: "section" | "div" | "article";
  "aria-labelledby"?: string;
}) {
  return (
    <Tag
      className={cn("rounded-xl border border-border bg-card shadow-subtle", className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function SectionHeader({
  id,
  title,
  description,
  action,
  className,
}: {
  id?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-end justify-between gap-4", className)}>
      <div className="min-w-0">
        <h2 id={id} className="text-[15px] font-semibold text-foreground">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-foreground md:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </header>
  );
}

const tones = {
  neutral: "border-border bg-surface text-muted-foreground",
  positive: "border-emerald-600/20 bg-emerald-600/[0.07] text-emerald-700",
  attention: "border-amber-600/25 bg-amber-500/[0.08] text-amber-700",
  danger: "border-destructive/20 bg-destructive/[0.06] text-destructive",
  strong: "border-primary bg-primary text-primary-foreground",
} as const;

export function Pill({
  tone = "neutral",
  children,
  className,
}: {
  tone?: keyof typeof tones;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-[4px] border border-border-strong px-1 py-px text-[9.5px] font-semibold uppercase tracking-wider text-muted-foreground",
        className,
      )}
    >
      Pro
    </span>
  );
}

/** Wraps Pro-only content. Free providers see a calm explanation instead of a hard wall. */
export function ProGate({
  feature,
  description,
  children,
}: {
  feature: string;
  description: string;
  children: ReactNode;
}) {
  const { plan } = useProvider();
  if (plan === "pro") return <>{children}</>;
  return (
    <Panel className="flex flex-col items-start gap-3 p-6">
      <span className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface">
        <Lock className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </span>
      <div>
        <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
          {feature} <ProBadge />
        </p>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      </div>
      <Link
        to="/provider/settings"
        className="inline-flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
        See Pro plan
      </Link>
    </Panel>
  );
}

export const btn = {
  primary:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-[13px] font-medium text-primary-foreground shadow-subtle transition-colors hover:bg-primary/90 disabled:opacity-40",
  secondary:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-border-strong bg-card px-3 text-[13px] font-medium text-foreground shadow-subtle transition-colors hover:bg-accent disabled:opacity-40",
  ghost:
    "inline-flex h-8 items-center justify-center gap-1.5 rounded-md px-2.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
  icon: "grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
};
