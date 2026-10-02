import { useEffect, useRef } from "react";
import type { AssistantState } from "@/lib/assistant-state";
import { cn } from "@/lib/utils";

/**
 * A single ink-like form that morphs between assistant states.
 * Every state is a set of numeric shape parameters; the renderer eases the
 * current parameters toward the target each frame, so all transitions are
 * continuous rather than swapping between separate animations.
 */

type OrbShape = {
  /** Base radius as a fraction of half the canvas. */
  radius: number;
  /** Organic edge deformation. */
  wobble: number;
  /** Speed of the edge deformation. */
  speed: number;
  /** Breathing amplitude. */
  breathe: number;
  /** How strongly the audio level drives the form (0 = ignored). */
  reactive: number;
  /** Separation of the form into three evaluated possibilities. */
  split: number;
  /** One possibility absorbing the others. */
  lead: number;
  /** Elongation into a bulb-like silhouette. */
  bulb: number;
  /** Inner point of light. */
  core: number;
  /** Magnifying lens drifting over the form. */
  lens: number;
  /** Thin outer ring. */
  halo: number;
  /** Opening in the outer ring, waiting to be closed. */
  haloGap: number;
  /** Expanding rings. */
  ripple: number;
};

const SHAPES: Record<AssistantState, OrbShape> = {
  idle: {
    radius: 0.4,
    wobble: 0.018,
    speed: 0.25,
    breathe: 0.018,
    reactive: 0,
    split: 0,
    lead: 0,
    bulb: 0,
    core: 0,
    lens: 0,
    halo: 0.35,
    haloGap: 0,
    ripple: 0,
  },
  listening: {
    radius: 0.42,
    wobble: 0.03,
    speed: 0.6,
    breathe: 0.008,
    reactive: 1,
    split: 0,
    lead: 0,
    bulb: 0,
    core: 0.15,
    lens: 0,
    halo: 0.15,
    haloGap: 0,
    ripple: 1,
  },
  understanding: {
    radius: 0.36,
    wobble: 0.02,
    speed: 0.45,
    breathe: 0.012,
    reactive: 0,
    split: 0,
    lead: 0,
    bulb: 1,
    core: 1,
    lens: 0,
    halo: 0,
    haloGap: 0,
    ripple: 0,
  },
  searching: {
    radius: 0.24,
    wobble: 0.012,
    speed: 0.35,
    breathe: 0.01,
    reactive: 0,
    split: 0,
    lead: 0,
    bulb: 0,
    core: 0.35,
    lens: 1,
    halo: 0,
    haloGap: 0,
    ripple: 0,
  },
  comparing: {
    radius: 0.25,
    wobble: 0.03,
    speed: 0.5,
    breathe: 0,
    reactive: 0,
    split: 1,
    lead: 0,
    bulb: 0,
    core: 0,
    lens: 0,
    halo: 0,
    haloGap: 0,
    ripple: 0,
  },
  recommending: {
    radius: 0.37,
    wobble: 0.01,
    speed: 0.25,
    breathe: 0.01,
    reactive: 0,
    split: 0,
    lead: 1,
    bulb: 0,
    core: 0.85,
    lens: 0,
    halo: 1,
    haloGap: 0,
    ripple: 0.55,
  },
  waiting_for_permission: {
    radius: 0.36,
    wobble: 0.008,
    speed: 0.18,
    breathe: 0.028,
    reactive: 0,
    split: 0,
    lead: 1,
    bulb: 0,
    core: 0.4,
    lens: 0,
    halo: 1,
    haloGap: 1,
    ripple: 0,
  },
  speaking: {
    radius: 0.42,
    wobble: 0.05,
    speed: 1.1,
    breathe: 0,
    reactive: 1,
    split: 0,
    lead: 0,
    bulb: 0,
    core: 0.3,
    lens: 0,
    halo: 0.1,
    haloGap: 0,
    ripple: 0.3,
  },
};

const SHAPE_KEYS = Object.keys(SHAPES.idle) as (keyof OrbShape)[];
const TAU = Math.PI * 2;
const INK = "24, 25, 30";
const INK_HIGHLIGHT = "86, 88, 98";
const PAPER = "252, 252, 253";

/** Returns a 0–1 level, e.g. microphone RMS or TTS output amplitude. */
export type AudioLevelSource = () => number;

export function AssistantOrb({
  state,
  getAudioLevel,
  className,
}: {
  state: AssistantState;
  /** Optional live level source. Without it, listening/speaking use a simulated level. */
  getAudioLevel?: AudioLevelSource | undefined;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stateRef = useRef(state);
  const levelSourceRef = useRef(getAudioLevel);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    levelSourceRef.current = getAudioLevel;
  }, [getAudioLevel]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    const shape: OrbShape = { ...SHAPES[stateRef.current] };
    let level = 0;
    let time = 0;
    let phase = 0;
    let last = performance.now();
    let raf = 0;

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const tempo = reduceMotion ? 0.3 : 1;
      time += dt * tempo;

      const target = SHAPES[stateRef.current];
      const ease = 1 - Math.exp(-dt * 3);
      for (const key of SHAPE_KEYS) {
        shape[key] += (target[key] - shape[key]) * ease;
      }
      phase += dt * tempo * shape.speed;

      const rawLevel =
        levelSourceRef.current?.() ?? simulatedLevel(stateRef.current, time);
      level += (clamp01(rawLevel) - level) * (1 - Math.exp(-dt * 10));

      drawOrb(ctx, canvas.width, canvas.height, dpr, {
        shape,
        time,
        phase,
        level: level * shape.reactive * (reduceMotion ? 0.4 : 1),
      });
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={cn("block h-full w-full", className)}
    />
  );
}

function clamp01(v: number) {
  return Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));
}

/** Placeholder level until a real microphone / TTS source is connected. */
function simulatedLevel(state: AssistantState, t: number) {
  if (state === "listening") {
    return (
      0.3 +
      0.22 * Math.sin(t * 2.1) * Math.sin(t * 0.7 + 1) +
      0.1 * Math.sin(t * 5.3)
    );
  }
  if (state === "speaking") {
    const syllable = Math.max(0, Math.sin(t * 6.4));
    const phrase = 0.55 + 0.45 * Math.sin(t * 1.25);
    return 0.15 + 0.75 * syllable * phrase;
  }
  return 0;
}

const ink = (a: number, rgb = INK) => `rgba(${rgb}, ${Math.max(0, a)})`;

type Frame = { shape: OrbShape; time: number; phase: number; level: number };

type Form = { x: number; y: number; r: number; alpha: number; seed: number };

function drawOrb(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  { shape: s, time: t, phase, level }: Frame,
) {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const cx = width / dpr / 2;
  const cy = height / dpr / 2;
  const half = Math.min(cx, cy);
  const breath = 1 + s.breathe * Math.sin(t * 1.1);
  const R = half * s.radius * breath * (1 + level * 0.08);
  const wobble = s.wobble + level * 0.055;
  const lift = s.bulb * R * 0.12;

  drawGroundShadow(ctx, cx, cy + half * 0.82, R);

  if (s.ripple > 0.01) {
    for (let i = 0; i < 2; i++) {
      const p = (t / 2.8 + i / 2) % 1;
      ctx.beginPath();
      ctx.arc(cx, cy, R * (1.1 + p * 0.85), 0, TAU);
      ctx.strokeStyle = ink(s.ripple * (1 - p) * (0.14 + level * 0.18));
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  if (s.halo > 0.01) drawHalo(ctx, cx, cy, R * 1.42, s);

  const forms: Form[] = [0, 1, 2].map((i) => {
    const angle = t * 0.3 + (i * TAU) / 3 - Math.PI / 2;
    const distance = s.split * R * 0.95;
    const weigh = 1 + s.split * 0.14 * Math.sin(t * 1.4 - (i * TAU) / 3);
    const leadScale = i === 0 ? 1 : 1 - s.lead;
    return {
      x: cx + Math.cos(angle) * distance,
      y: cy - lift + Math.sin(angle) * distance,
      r: R * (1 - 0.2 * s.split) * weigh * leadScale,
      alpha: 1 - 0.46 * s.split,
      seed: i * 1.7,
    };
  });

  const paintForms = () => {
    for (const form of forms) {
      if (form.r < 0.5) continue;
      traceForm(ctx, form, wobble, phase, s.bulb);
      const g = ctx.createRadialGradient(
        form.x - form.r * 0.35,
        form.y - form.r * 0.45,
        form.r * 0.05,
        form.x,
        form.y,
        form.r * 1.3,
      );
      g.addColorStop(0, ink(form.alpha, INK_HIGHLIGHT));
      g.addColorStop(1, ink(form.alpha));
      ctx.fillStyle = g;
      ctx.fill();
    }
  };

  paintForms();

  if (s.bulb > 0.05) {
    const baseY = cy - lift + R * 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - R * 0.2, baseY);
    ctx.lineTo(cx + R * 0.2, baseY);
    ctx.strokeStyle = ink(s.bulb * 0.3);
    ctx.lineWidth = 1.25;
    ctx.lineCap = "round";
    ctx.stroke();
  }

  if (s.core > 0.01) {
    const thinking = s.bulb > 0.2 ? 0.78 + 0.22 * Math.sin(t * 2.3) : 1;
    const lx = cx;
    const ly = cy - lift - R * (0.1 + 0.2 * s.bulb);
    const lr = R * (0.34 + 0.14 * s.bulb);
    const a = s.core * thinking;
    const g = ctx.createRadialGradient(lx, ly, 0, lx, ly, lr);
    g.addColorStop(0, `rgba(255, 255, 255, ${0.42 * a})`);
    g.addColorStop(0.45, `rgba(255, 255, 255, ${0.12 * a})`);
    g.addColorStop(1, "rgba(255, 255, 255, 0)");
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, TAU);
    ctx.fillStyle = g;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(lx, ly, Math.max(1.2, R * 0.032), 0, TAU);
    ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * a})`;
    ctx.fill();
  }

  if (s.lens > 0.01) {
    const lx = cx + Math.cos(t * 0.7) * half * 0.13 * s.lens;
    const ly = cy + Math.sin(t * 0.91) * half * 0.09 * s.lens;
    const lr = half * (0.12 + 0.18 * s.lens);

    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, TAU);
    ctx.clip();
    ctx.globalAlpha = s.lens;
    ctx.fillStyle = `rgba(${PAPER}, 0.92)`;
    ctx.fill();
    ctx.translate(lx, ly);
    ctx.scale(1.5, 1.5);
    ctx.translate(-lx, -ly);
    paintForms();
    ctx.restore();

    ctx.beginPath();
    ctx.arc(lx, ly, lr, 0, TAU);
    ctx.strokeStyle = ink(0.75 * s.lens);
    ctx.lineWidth = 1.25;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(lx, ly, lr * 0.88, Math.PI * 1.05, Math.PI * 1.45);
    ctx.strokeStyle = ink(0.18 * s.lens);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function traceForm(
  ctx: CanvasRenderingContext2D,
  { x: fx, y: fy, r, seed }: Form,
  wobble: number,
  phase: number,
  bulb: number,
) {
  const steps = 120;
  ctx.beginPath();
  for (let j = 0; j <= steps; j++) {
    const th = (j / steps) * TAU;
    const n =
      0.55 * Math.sin(3 * th + phase * 1.1 + seed) +
      0.3 * Math.sin(5 * th - phase * 0.8 + seed * 1.9) +
      0.15 * Math.sin(2 * th + phase * 1.6 + seed * 0.6);
    const rr = r * (1 + wobble * n);
    let x = Math.cos(th) * rr;
    let y = Math.sin(th) * rr;
    if (bulb > 0 && y > 0) {
      const v = Math.min(1, y / r);
      x *= 1 - bulb * 0.46 * Math.pow(v, 1.2);
      y *= 1 + bulb * 0.3;
    }
    if (j === 0) ctx.moveTo(fx + x, fy + y);
    else ctx.lineTo(fx + x, fy + y);
  }
  ctx.closePath();
}

function drawHalo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  s: OrbShape,
) {
  const gap = s.haloGap * 0.55;
  const start = -Math.PI / 2 + gap / 2;
  const end = -Math.PI / 2 + TAU - gap / 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, start, end);
  ctx.strokeStyle = ink(s.halo * 0.3);
  ctx.lineWidth = 1;
  ctx.lineCap = "round";
  ctx.stroke();

  if (s.haloGap > 0.05) {
    for (const a of [start, end]) {
      ctx.beginPath();
      ctx.arc(
        cx + Math.cos(a) * radius,
        cy + Math.sin(a) * radius,
        1.8,
        0,
        TAU,
      );
      ctx.fillStyle = ink(s.haloGap * s.halo * 0.6);
      ctx.fill();
    }
  }
}

function drawGroundShadow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, 0.14);
  const g = ctx.createRadialGradient(0, 0, 0, 0, 0, R * 1.1);
  g.addColorStop(0, ink(0.07));
  g.addColorStop(1, ink(0));
  ctx.beginPath();
  ctx.arc(0, 0, R * 1.1, 0, TAU);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.restore();
}
