import { Link } from "@tanstack/react-router";
import { Bell, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AvailabilityControl } from "@/components/provider/availability-control";
import { Avatar, btn } from "@/components/provider/primitives";
import { provider } from "@/lib/provider-data";

const notifications = [
  { title: "New request: Custom wardrobe installation", time: "9 min ago" },
  { title: "Amaka Nwosu sent you a message", time: "9 min ago" },
  { title: "Your Ikoyi wardrobe post passed 240 reactions", time: "2 h ago" },
  { title: "Payout of ₦940,000 is available", time: "Yesterday" },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function HomeHeader({ attentionCount }: { attentionCount: number }) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div className="flex items-center gap-3.5">
        <Avatar initials={provider.initials} size="lg" />
        <div>
          <h1 className="text-xl font-semibold text-foreground md:text-[22px]">
            {greeting()}, {provider.firstName}.
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {attentionCount > 0 ? (
              <>
                You have{" "}
                <span className="font-medium text-foreground">
                  {attentionCount} {attentionCount === 1 ? "thing" : "things"}
                </span>{" "}
                that need your attention.
              </>
            ) : (
              "You're all caught up. Nice work."
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="hidden lg:block">
          <AvailabilityControl variant="inline" />
        </div>
        <Link to="/provider/messages" className={`${btn.icon} relative`} aria-label="Messages, 3 unread">
          <MessageSquare className="h-4 w-4" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-foreground" />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className={`${btn.icon} relative`} aria-label="Notifications, 4 new">
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="text-xs font-medium text-muted-foreground">
              Notifications
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.map((n) => (
              <DropdownMenuItem key={n.title} className="flex-col items-start gap-0.5 py-2">
                <span className="text-[13px] text-foreground">{n.title}</span>
                <span className="text-xs text-muted-foreground">{n.time}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
