import { Outlet, createFileRoute } from "@tanstack/react-router";
import { ProviderShell } from "@/components/provider/provider-shell";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/provider")({
  head: () => ({
    meta: [
      { title: "Provider workspace — Brand" },
      {
        name: "description",
        content: "Manage requests, jobs, schedule, earnings and your professional presence.",
      },
    ],
  }),
  component: ProviderLayout,
});

function ProviderLayout() {
  return (
    <ProviderShell>
      <Outlet />
      <Toaster position="bottom-center" />
    </ProviderShell>
  );
}
