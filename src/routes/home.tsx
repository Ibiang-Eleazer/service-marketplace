import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import { AppNav } from "@/components/app-nav";
import { Feed } from "@/components/feed/feed";
import { LeftSidebar } from "@/components/feed/left-sidebar";
import { RightSidebar } from "@/components/feed/right-sidebar";

export const Route = createFileRoute("/home")({
  head: () => ({
    meta: [
      { title: "Home — Brand" },
      {
        name: "description",
        content:
          "Discover people, work, and ideas. Ask AI to turn what you see into something done.",
      },
      { property: "og:title", content: "Home — Brand" },
      {
        property: "og:description",
        content:
          "Discover people, work, and ideas. Ask AI to turn what you see into something done.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const navigate = useNavigate();

  const goToAssistant = useCallback(() => {
    navigate({ to: "/assistant" });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />

      {/* Three-column layout */}
      <div className="mx-auto flex w-full max-w-[1400px] gap-0 px-5 md:px-8">
        {/* Left sidebar */}
        <div className="hidden w-56 shrink-0 lg:block">
          <LeftSidebar onAskAi={goToAssistant} />
        </div>

        {/* Center feed */}
        <main className="min-w-0 flex-1 border-x border-border">
          <Feed onAskAi={goToAssistant} />
        </main>

        {/* Right sidebar */}
        <div className="hidden w-80 shrink-0 xl:block">
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
