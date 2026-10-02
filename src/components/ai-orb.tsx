import { useEffect, useRef } from "react";
import type { OrbState } from "@/lib/conversation-engine";
import { cn } from "@/lib/utils";

/**
 * AI Orb — a central animated interface element for hands-off mode.
 * Uses SVG + CSS animations to morph between states.
 * Subtly responds to audio amplitude when listening (if mic data available).
 */

const STATE_COLORS: Record<OrbState, { core: string; glow: string; ring: string }> = {
  idle: { core: "oklch(0.55 0.012 265)", glow: "oklch(0.65 0.015 265)", ring: "oklch(0.7 0.01 265)" },
  listening: { core: "oklch(0.5 0.02 250)", glow: "oklch(0.6 0.025 250)", ring: "oklch(0.65 0.02 250)" },
  understanding: { core: "oklch(0.55 0.025 200)", glow: "oklch(0.65 0.03 200)", ring: "oklch(0.7 0.02 200)" },
  searching: { core: "oklch(0.5 0.02 180)", glow: "oklch(0.6 0.025 180)", ring: "oklch(0.65 0.02 180)" },
  comparing: { core: "oklch(0.52 0.02 220)", glow: "oklch(0.62 0.025 220)", ring: "oklch(0.68 0.02 220)" },
  recommending: { core: "oklch(0.45 0.025 160)", glow: "oklch(0.55 0.03 160)", ring: "oklch(0.6 0.025 160)" },
  "waiting-permission": { core: "oklch(0.5 0.015 60)", glow: "oklch(0.6 0.02 60)", ring: "oklch(0.65 0.015 60)" },
  speaking: { core: "oklch(0.5 0.025 30)", glow: "oklch(0.6 0.03 30)", ring: "oklch(0.65 0.025 30)" },
  contacted: { core: "oklch(0.5 0.025 150)", glow: "oklch(0.6 0.03 150)", ring: "oklch(0.65 0.025 150)" },
};

const STATE_LABELS: Record<OrbState, string> = {
  idle: "Ready",
  listening: "Listening",
  understanding: "Understanding",
  searching: "Searching",
  comparing: "Comparing",
  recommending: "Recommending",
  "waiting-permission": "Waiting for your decision",
  speaking: "Speaking",
  contacted: "Request sent",
};

export function AiOrb({
  state,
  size = 200,
  amplitude = 0,
  className,
}: {
  state: OrbState;
  size?: number;
  /** Audio amplitude 0-1 for subtle reactivity */
  amplitude?: number;
  className?: string;
}) {
  const colors = STATE_COLORS[state] ?? STATE_COLORS.idle;
  const label = STATE_LABELS[state];
  const orbRef = useRef<SVGSVGElement>(null);

  // Apply amplitude-based scale to the core via CSS variable
  useEffect(() => {
    if (orbRef.current) {
      const scale = 1 + amplitude * 0.04;
      orbRef.current.style.setProperty("--orb-reactivity", scale.toString());
    }
  }, [amplitude]);

  const animClass = getOrbAnimationClass(state);

  return (
    <div
      className={cn("relative flex flex-col items-center justify-center", className)}
      style={{ width: size, height: size + 40 }}
    >
      <svg
        ref={orbRef}
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        aria-hidden="true"
        style={{ "--orb-reactivity": "1" } as React.CSSProperties}
      >
        {/* Outer glow */}
        <circle
          cx="100"
          cy="100"
          r="90"
          fill={colors.glow}
          opacity={0.08}
          className="orb-glow"
          style={{ transformOrigin: "100px 100px" }}
        />

        {/* Pulsing rings */}
        {state === "listening" || state === "speaking" ? (
          <>
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke={colors.ring}
              strokeWidth="1"
              opacity={0.3}
              className="orb-ring-1"
              style={{ transformOrigin: "100px 100px" }}
            />
            <circle
              cx="100"
              cy="100"
              r="70"
              fill="none"
              stroke={colors.ring}
              strokeWidth="1"
              opacity={0.2}
              className="orb-ring-2"
              style={{ transformOrigin: "100px 100px" }}
            />
          </>
        ) : null}

        {/* Searching: orbiting elements */}
        {state === "searching" ? (
          <>
            <circle cx="100" cy="40" r="3" fill={colors.ring} opacity={0.6} className="orb-orbit-1" style={{ transformOrigin: "100px 100px" }} />
            <circle cx="160" cy="100" r="2.5" fill={colors.ring} opacity={0.5} className="orb-orbit-2" style={{ transformOrigin: "100px 100px" }} />
            <circle cx="100" cy="160" r="2" fill={colors.ring} opacity={0.4} className="orb-orbit-3" style={{ transformOrigin: "100px 100px" }} />
            <circle cx="40" cy="100" r="2.5" fill={colors.ring} opacity={0.5} className="orb-orbit-4" style={{ transformOrigin: "100px 100px" }} />
          </>
        ) : null}

        {/* Understanding: radiating spokes */}
        {state === "understanding" ? (
          <>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <line
                key={deg}
                x1={100 + Math.cos((deg * Math.PI) / 180) * 55}
                y1={100 + Math.sin((deg * Math.PI) / 180) * 55}
                x2={100 + Math.cos((deg * Math.PI) / 180) * 75}
                y2={100 + Math.sin((deg * Math.PI) / 180) * 75}
                stroke={colors.ring}
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity={0.4}
                className="orb-spoke"
                style={{ transformOrigin: "100px 100px", animationDelay: `${deg * 4}ms` }}
              />
            ))}
          </>
        ) : null}

        {/* Comparing: multiple interacting elements */}
        {state === "comparing" ? (
          <>
            <circle cx="80" cy="90" r="12" fill={colors.core} opacity={0.15} className="orb-compare-1" />
            <circle cx="120" cy="90" r="12" fill={colors.core} opacity={0.15} className="orb-compare-2" />
            <circle cx="80" cy="115" r="12" fill={colors.core} opacity={0.12} className="orb-compare-3" />
            <circle cx="120" cy="115" r="12" fill={colors.core} opacity={0.12} className="orb-compare-4" />
          </>
        ) : null}

        {/* Core orb */}
        <circle
          cx="100"
          cy="100"
          r="55"
          fill={colors.core}
          opacity={0.12}
          className={cn("orb-core-bg", animClass)}
          style={{ transformOrigin: "100px 100px" }}
        />

        {/* Inner gradient circle */}
        <defs>
          <radialGradient id="orb-gradient" cx="0.35" cy="0.35">
            <stop offset="0%" stopColor={colors.glow} stopOpacity={0.4} />
            <stop offset="60%" stopColor={colors.core} stopOpacity={0.15} />
            <stop offset="100%" stopColor={colors.core} stopOpacity={0.05} />
          </radialGradient>
        </defs>
        <circle
          cx="100"
          cy="100"
          r="55"
          fill="url(#orb-gradient)"
          className={animClass}
          style={{ transformOrigin: "100px 100px", transform: "scale(var(--orb-reactivity, 1))" }}
        />

        {/* Bright center dot */}
        <circle
          cx="100"
          cy="100"
          r="8"
          fill={colors.glow}
          opacity={0.7}
          className="orb-center-dot"
          style={{ transformOrigin: "100px 100px" }}
        />

        {/* Recommending: checkmark-like form */}
        {state === "recommending" ? (
          <path
            d="M 85 100 L 96 112 L 118 88"
            stroke={colors.glow}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity={0.6}
            className="orb-checkmark"
            style={{ transformOrigin: "100px 100px" }}
          />
        ) : null}

        {/* Waiting for permission: stable ring */}
        {state === "waiting-permission" ? (
          <circle
            cx="100"
            cy="100"
            r="72"
            fill="none"
            stroke={colors.ring}
            strokeWidth="1.5"
            opacity={0.25}
            className="orb-waiting-ring"
            style={{ transformOrigin: "100px 100px" }}
          />
        ) : null}

        {/* Contacted: completion burst */}
        {state === "contacted" ? (
          <>
            {[0, 60, 120, 180, 240, 300].map((deg) => (
              <line
                key={deg}
                x1={100 + Math.cos((deg * Math.PI) / 180) * 60}
                y1={100 + Math.sin((deg * Math.PI) / 180) * 60}
                x2={100 + Math.cos((deg * Math.PI) / 180) * 78}
                y2={100 + Math.sin((deg * Math.PI) / 180) * 78}
                stroke={colors.glow}
                strokeWidth="2"
                strokeLinecap="round"
                opacity={0.5}
                className="orb-burst"
                style={{ transformOrigin: "100px 100px", animationDelay: `${deg * 8}ms` }}
              />
            ))}
          </>
        ) : null}
      </svg>

      {/* State label */}
      <span
        className="mt-3 text-xs font-medium text-muted-foreground transition-opacity duration-500"
        key={label}
      >
        {label}
      </span>
    </div>
  );
}

function getOrbAnimationClass(state: OrbState): string {
  switch (state) {
    case "idle":
      return "orb-idle";
    case "listening":
      return "orb-listening";
    case "understanding":
      return "orb-understanding";
    case "searching":
      return "orb-searching";
    case "comparing":
      return "orb-comparing";
    case "recommending":
      return "orb-recommending";
    case "waiting-permission":
      return "orb-waiting";
    case "speaking":
      return "orb-speaking";
    case "contacted":
      return "orb-contacted";
    default:
      return "orb-idle";
  }
}
