/** Restrained visual language for the assistant: a core dot with expanding rings while working. */
export function AiMark({ working, size = 20 }: { working: boolean; size?: number }) {
  return (
    <span
      aria-hidden="true"
      className="relative inline-grid shrink-0 place-items-center"
      style={{ width: size, height: size }}
    >
      {working ? (
        <>
          <span className="ai-ring absolute inset-0 rounded-full border border-foreground/40" />
          <span
            className="ai-ring absolute inset-0 rounded-full border border-foreground/30"
            style={{ animationDelay: "1.2s" }}
          />
        </>
      ) : (
        <span className="absolute inset-[3px] rounded-full border border-border-strong" />
      )}
      <span
        className={
          "h-1.5 w-1.5 rounded-full bg-foreground transition-transform duration-300 " +
          (working ? "ai-breathe" : "")
        }
      />
    </span>
  );
}

/** Tiny waveform used as a processing indicator. */
export function AiWave() {
  return (
    <span aria-hidden="true" className="inline-flex h-3 items-end gap-[2px]">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className="wave-bar h-full w-[2px] rounded-full bg-muted-foreground"
          style={{ animationDelay: `${i * 0.14}s` }}
        />
      ))}
    </span>
  );
}
