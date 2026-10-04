import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/brand";
import { AiMark } from "@/components/ai-mark";
import { useOnboarding } from "@/lib/onboarding-store";
import { seedNotifications } from "@/lib/feed-data";
import { cn } from "@/lib/utils";

const links = [
  { to: "/home", label: "Home" },
  { to: "/requests", label: "Requests" },
  { to: "/messages", label: "Messages" },
  { to: "/library", label: "Library" },
  { to: "/assistant", label: "Assistant" },
] as const;

export function AssistantStatus({
  working,
  label,
  className,
}: {
  working: boolean;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground shadow-subtle",
        className,
      )}
    >
      <AiMark working={working} size={14} />
      <span className="transition-opacity duration-300">{label}</span>
    </span>
  );
}

export function AppNav({
  working = false,
  statusLabel = "Assistant ready",
}: {
  working?: boolean;
  statusLabel?: string;
}) {
  const { customer } = useOnboarding();
  const name = customer.name.trim() || "Your account";
  const initials =
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join("") || "A";

  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const unreadCount = seedNotifications.filter((n) => n.unread).length;

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-4 px-5 md:px-8">
        <Brand />

        <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground data-[status=active]:text-foreground"
              activeProps={{ className: "bg-accent font-medium" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div ref={wrapRef} className="relative ml-auto flex items-center gap-1.5">
          <AssistantStatus
            working={working}
            label={statusLabel}
            className="hidden xl:inline-flex"
          />

          <Link
            to="/notifications"
            aria-label="Notifications"
            className="relative grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-accent hover:text-foreground"
          >
            <svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path
                d="M4 6.5a4 4 0 1 1 8 0c0 2.2.6 3.4 1.2 4.1.3.4 0 .9-.5.9H3.3c-.5 0-.8-.5-.5-.9C3.4 9.9 4 8.7 4 6.5Z"
                stroke="currentColor"
                strokeWidth="1.2"
              />
              <path d="M6.5 13.2a1.8 1.8 0 0 0 3 0" stroke="currentColor" strokeWidth="1.2" />
            </svg>
            {unreadCount > 0 ? (
              <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-foreground" />
            ) : null}
          </Link>

          <Link
            to="/profile"
            aria-label="Your profile"
            className="grid h-8 w-8 place-items-center rounded-full border border-border-strong bg-card text-[11px] font-semibold text-foreground shadow-subtle transition-transform duration-200 hover:-translate-y-px"
          >
            {initials}
          </Link>

          {menuOpen ? (
            <div className="rise-in absolute right-0 top-11 w-56 rounded-lg border border-border bg-popover p-1.5 shadow-raised">
              <div className="px-2.5 py-2">
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.location || "Location not set"}
                </p>
              </div>
              <div className="my-1 h-px bg-border" />
              <Link
                to="/profile"
                className="block rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                Your profile
              </Link>
              <Link
                to="/library"
                className="block rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                Library
              </Link>
              <button
                type="button"
                className="w-full rounded-md px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Help
              </button>
              <div className="my-1 h-px bg-border" />
              <Link
                to="/"
                className="block rounded-md px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Sign out
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile + tablet nav */}
      <nav
        className="flex items-center gap-0.5 overflow-x-auto border-t border-border px-5 py-1.5 lg:hidden"
        aria-label="Main mobile"
      >
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="shrink-0 rounded-md px-2.5 py-1.5 text-sm text-muted-foreground"
            activeProps={{ className: "bg-accent text-foreground font-medium" }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
