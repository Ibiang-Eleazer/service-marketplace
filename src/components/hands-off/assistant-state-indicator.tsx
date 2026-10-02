import {
  ASSISTANT_STATE_META,
  type AssistantState,
} from "@/lib/assistant-state";

export function AssistantStateIndicator({ state }: { state: AssistantState }) {
  const meta = ASSISTANT_STATE_META[state];
  return (
    <div className="text-center" role="status" aria-live="polite">
      <p
        key={`label-${state}`}
        className="rise-in font-mono text-[11px] uppercase tracking-[0.18em] text-foreground"
      >
        {meta.label}
      </p>
      <p
        key={`caption-${state}`}
        className="rise-in mt-2 text-sm text-muted-foreground"
        style={{ animationDelay: "60ms" }}
      >
        {meta.caption}
      </p>
    </div>
  );
}
