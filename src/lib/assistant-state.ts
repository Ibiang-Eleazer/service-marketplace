/**
 * Visual state model for the assistant's Hands-off presence.
 * Any part of the app (mock workflow today, voice/AI pipeline later) can drive
 * the orb by producing one of these states.
 */

export const ASSISTANT_STATES = [
  "idle",
  "listening",
  "understanding",
  "searching",
  "comparing",
  "recommending",
  "waiting_for_permission",
  "speaking",
] as const;

export type AssistantState = (typeof ASSISTANT_STATES)[number];

export const ASSISTANT_STATE_META: Record<
  AssistantState,
  { label: string; caption: string }
> = {
  idle: {
    label: "Ready",
    caption: "Tell me what you need whenever you're ready.",
  },
  listening: {
    label: "Listening",
    caption: "Go ahead, I'm listening.",
  },
  understanding: {
    label: "Understanding",
    caption: "Working out what kind of help you need.",
  },
  searching: {
    label: "Searching",
    caption: "Looking for providers who serve your area.",
  },
  comparing: {
    label: "Comparing",
    caption: "Weighing skills, distance, availability and experience.",
  },
  recommending: {
    label: "Recommending",
    caption: "I've found someone who looks like a good fit.",
  },
  waiting_for_permission: {
    label: "Waiting for you",
    caption: "I won't contact anyone until you say so.",
  },
  speaking: {
    label: "Speaking",
    caption: "Here's what I understood.",
  },
};

export type WorkflowDecision = "pending" | "approved" | "declined";

/**
 * Maps the existing RequestWorkflow stages (0–7) to a Hands-off visual state.
 * 0–1 understanding · 2 explains what it understood · 3–4 finding/found ·
 * 5 comparing · 6 recommendation · 7 permission.
 */
export function assistantStateFromWorkflow(
  stage: number | null,
  decision: WorkflowDecision,
): AssistantState {
  if (stage === null) return "idle";
  if (decision !== "pending") return "idle";
  if (stage <= 1) return "understanding";
  if (stage === 2) return "speaking";
  if (stage <= 4) return "searching";
  if (stage === 5) return "comparing";
  if (stage === 6) return "recommending";
  return "waiting_for_permission";
}
