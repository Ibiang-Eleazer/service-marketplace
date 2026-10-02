import { forwardRef } from "react";

export const ExitHandsOffButton = forwardRef<
  HTMLButtonElement,
  { onExit: () => void }
>(function ExitHandsOffButton({ onExit }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onExit}
      className="group inline-flex h-9 items-center gap-2.5 rounded-md border border-border-strong bg-card px-3 text-sm font-medium text-foreground shadow-subtle transition-[transform,box-shadow,background-color] duration-200 hover:-translate-y-px hover:bg-accent hover:shadow-panel"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 16 16"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="1.5"
          y="4"
          width="13"
          height="8"
          rx="1.5"
          stroke="currentColor"
          strokeWidth="1.2"
        />
        <path
          d="M4 7h.01M6.5 7h.01M9 7h.01M11.5 7h.01M5 9.5h6"
          stroke="currentColor"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </svg>
      Back to keyboard
      <kbd className="hidden rounded border border-border px-1.5 py-px font-mono text-[10px] text-muted-foreground sm:inline">
        Esc
      </kbd>
    </button>
  );
});
