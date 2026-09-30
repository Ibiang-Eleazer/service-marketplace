import type { ReactNode } from "react";
import { Brand } from "@/components/brand";
import { Arrow, Button } from "@/components/ui-kit";

export function StepProgress({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="flex items-center gap-3" aria-label={`Step ${current} of ${total}`}>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={
              "h-1 w-8 rounded-full transition-colors duration-300 " +
              (i < current ? "bg-primary" : "bg-border")
            }
          />
        ))}
      </div>
      <span className="text-xs tabular-nums text-muted-foreground">
        {current} / {total}
      </span>
    </div>
  );
}

export function OnboardingLayout({
  onBack,
  backLabel = "Back",
  progress,
  eyebrow,
  title,
  description,
  children,
  footer,
}: {
  onBack?: (() => void) | undefined;
  backLabel?: string | undefined;
  progress?: { current: number; total: number } | undefined;
  eyebrow?: string | undefined;
  title: string;
  description?: string | undefined;
  children?: ReactNode | undefined;
  footer?: ReactNode | undefined;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4 md:px-10">
        <Brand />
        {progress ? <StepProgress {...progress} /> : null}
      </header>

      <main className="flex flex-1 justify-center px-6 py-12 md:px-10 md:py-20">
        <div key={title} className="rise-in w-full max-w-xl">
          {onBack ? (
            <Button
              variant="ghost"
              size="md"
              onClick={onBack}
              className="-ml-3 mb-6"
            >
              <Arrow back />
              {backLabel}
            </Button>
          ) : null}

          {eyebrow ? (
            <p className="mb-3 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}

          <h1 className="text-3xl font-semibold text-foreground md:text-[2.1rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-3 max-w-md text-[0.95rem] leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}

          {children ? <div className="mt-10">{children}</div> : null}
          {footer ? <div className="mt-10">{footer}</div> : null}
        </div>
      </main>
    </div>
  );
}
