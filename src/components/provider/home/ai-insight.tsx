import { Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles } from "lucide-react";
import { AiMark } from "@/components/ai-mark";
import { Panel, btn } from "@/components/provider/primitives";
import { cn } from "@/lib/utils";

const insight = {
  title: "AI Insight",
  text: "Your recent posts about custom furniture are getting 3× more engagement than your other posts. Consider sharing more wardrobe and furniture work.",
};

export function AiInsight({ className }: { className?: string }) {
  return (
    <Panel className={cn("overflow-hidden p-4 md:p-5", className)} aria-labelledby="insight-title">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-surface">
          <AiMark working={false} size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <p id="insight-title" className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            {insight.title}
          </p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">
            {insight.text}
          </p>
          <Link
            to="/provider/analytics"
            className={cn(btn.ghost, "mt-3 -ml-2.5")}
          >
            Explore insight
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Panel>
  );
}
