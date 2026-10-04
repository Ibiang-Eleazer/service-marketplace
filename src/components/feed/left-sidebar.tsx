import { Link } from "@tanstack/react-router";
import { Home, Wrench, MessageSquare, Bookmark, Bell, User, Sparkles } from "lucide-react";
import { useOnboarding } from "@/lib/onboarding-store";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/requests", label: "Requests", icon: Wrench },
  { to: "/messages", label: "Messages", icon: MessageSquare },
  { to: "/library", label: "Library", icon: Bookmark },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User },
] as const;

export function LeftSidebar({ onAskAi }: { onAskAi: () => void }) {
  const { customer } = useOnboarding();
  const name = customer.name.trim() || "Your account";
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") || "A";

  return (
    <nav className="sticky top-14 flex flex-col gap-0.5 py-4" aria-label="Primary">
      {navItems.map((item) => {
    const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground data-[status=active]:bg-accent data-[status=active]:text-foreground data-[status=active]:font-medium"
            activeProps={{ className: "bg-accent text-foreground font-medium" }}
          >
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}

      {/* AI entry point — not a tab, an action */}
      <button
        type="button"
        onClick={onAskAi}
        className="mt-3 flex items-center gap-3 rounded-lg border border-border-strong bg-card px-3 py-2.5 text-sm font-medium text-foreground shadow-subtle transition-[transform,box-shadow] duration-200 hover:-translate-y-px hover:shadow-panel"
      >
        <span className="grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-foreground text-[8px] font-bold text-background">
          AI
        </span>
        <span className="truncate">What can I get done?</span>
      </button>

      {/* Profile mini */}
      <Link
        to="/profile"
        className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-card p-2.5 transition-colors hover:bg-accent"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border-strong bg-surface text-[11px] font-semibold text-foreground">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="truncate text-[13px] font-medium text-foreground">{name}</p>
          <p className="truncate text-xs text-muted-foreground">{customer.location || "Location not set"}</p>
        </div>
      </Link>
    </nav>
  );
}
