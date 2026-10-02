import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/components/provider/provider-shell";
import { HomeHeader } from "@/components/provider/home/home-header";
import { ActionCenter, useAttentionCount } from "@/components/provider/home/action-center";
import { TodaySchedule } from "@/components/provider/home/today-schedule";
import { QuickPerformance } from "@/components/provider/home/quick-performance";
import { ProfessionalFeed } from "@/components/provider/home/professional-feed";
import { Opportunities } from "@/components/provider/home/opportunities";

export const Route = createFileRoute("/provider/")({
  component: ProviderHome,
});

function ProviderHome() {
  const attention = useAttentionCount();
  return (
    <PageContainer wide>
      <HomeHeader attentionCount={attention} />
      {/* Columns use display:contents on mobile so cards can be re-ordered into one stream. */}
      <div className="mt-6 flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-6">
        <div className="contents lg:flex lg:flex-col lg:gap-6">
          <ActionCenter className="order-1" />
          <ProfessionalFeed className="order-5 mt-4 lg:mt-0" />
        </div>
        <div className="contents lg:sticky lg:top-6 lg:flex lg:flex-col lg:gap-4">
          <TodaySchedule className="order-2" />
          <QuickPerformance className="order-3" />
          <Opportunities className="order-4" />
        </div>
      </div>
    </PageContainer>
  );
}
