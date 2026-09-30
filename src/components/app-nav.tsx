import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Brand } from "@/components/brand";
import { AiMark } from "@/components/ai-mark";
import { useOnboarding } from "@/lib/onboarding-store";
import { cn } from "@/lib/utils";

const links = [
  { to: "/home", label: "Home" },
  { to: "/requests", label: "Requests" },
  { to: "/messages", label: "Messages" },
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
  const [notifOpen, setNotifOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-5 md:px-8">
        <Brand />

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
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

        <div ref={wrapRef} className="relative ml-auto flex items-center gap-2">
          <AssistantStatus
            working={working}
            label={statusLabel}
            className="hidden md:inline-flex"
          />

          <button
            type="button"
            aria-label="Notifications"
            aria-expanded={notifOpen}
            onClick={() => {
              setNotifOpen((v) => !v);
              setMenuOpen(false);
            }}
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
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-foreground" />
          </button>

          <button
            type="button"
            aria-label="Account"
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen((v) => !v);
              setNotifOpen(false);
            }}
            className="grid h-8 w-8 place-items-center rounded-full border border-border-strong bg-card text-[11px] font-semibold text-foreground shadow-subtle transition-transform duration-200 hover:-translate-y-px"
          >
            {initials}
          </button>

          {notifOpen ? (
            <div className="rise-in absolute right-0 top-11 w-72 rounded-lg border border-border bg-popover p-1.5 shadow-raised">
              <p className="px-2.5 py-1.5 text-[11px] uppercase tracking-wider text-muted-foreground">
                Notifications
              </p>
              {[
                ["Northside Plumbing replied", "12 min ago"],
                ["Your cooling request needs a decision", "1 h ago"],
                ["Electrical repair marked complete", "Last week"],
              ].map(([t, w]) => (
                <div key={t} className="rounded-md px-2.5 py-2 hover:bg-accent">
                  <p className="text-sm text-foreground">{t}</p>
                  <p className="text-xs text-muted-foreground">{w}</p>
                </div>
              ))}
            </div>
          ) : null}

          {menuOpen ? (
            <div className="rise-in absolute right-0 top-11 w-56 rounded-lg border border-border bg-popover p-1.5 shadow-raised">
              <div className="px-2.5 py-2">
                <p className="text-sm font-medium text-foreground">{name}</p>
                <p className="text-xs text-muted-foreground">
                  {customer.location || "Location not set"}
                </p>
              </div>
              <div className="my-1 h-px bg-border" />
              {["Account settings", "Saved providers", "Help"].map((item) => (
                <button
                  key={item}
                  type="button"
                  className="w-full rounded-md px-2.5 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {item}
                </button>
              ))}
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

      <nav
        className="flex items-center gap-1 border-t border-border px-5 py-1.5 sm:hidden"
        aria-label="Main mobile"
      >
        {links.map((l) => (
          <Link
            key={l.to}
            to={l.to}
            className="rounded-md px-2.5 py-1.5 text-sm text-muted-foreground"
            activeProps={{ className: "bg-accent text-foreground font-medium" }}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
