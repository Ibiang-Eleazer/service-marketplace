/**
 * Conversation engine — shared logic for keyboard and hands-off modes.
 * Handles: intent detection, clarification, provider matching, permission
 * interpretation, and natural language command understanding.
 *
 * This is a stateful module-level store so context survives mode switches.
 * No backend — all mock/prototype behavior.
 */

import {
  getClarification,
  matchCategoryLabel,
  resolveIntent,
  type HomeProvider,
  type Intent,
  type MatchCategory,
} from "@/lib/home-data";

// ── Types ──────────────────────────────────────────────────────────

export type OrbState =
  | "idle"
  | "listening"
  | "understanding"
  | "searching"
  | "comparing"
  | "recommending"
  | "waiting-permission"
  | "speaking"
  | "contacted";

export type ConversationPhase =
  | "awaiting-input"
  | "clarifying"
  | "understanding"
  | "searching"
  | "comparing"
  | "recommending"
  | "awaiting-permission"
  | "contacted"
  | "browsing-providers"
  | "chatting-with-provider";

export type MessageRole = "user" | "assistant" | "provider" | "system";

export type ConversationMessage = {
  id: string;
  role: MessageRole;
  text: string;
  when: number;
};

export type ConversationState = {
  phase: ConversationPhase;
  orbState: OrbState;
  messages: ConversationMessage[];
  intent: Intent | null;
  originalInput: string;
  clarifications: Record<string, string>;
  pendingClarification: string | null;
  allProviders: HomeProvider[];
  recommendedProvider: HomeProvider | null;
  selectedProvider: HomeProvider | null;
  showAllProviders: boolean;
  contactSent: boolean;
  chattingProvider: HomeProvider | null;
  chatMessages: { id: string; role: "user" | "provider"; text: string; when: number }[];
  aiStandbyActive: boolean;
};

const initialState: ConversationState = {
  phase: "awaiting-input",
  orbState: "idle",
  messages: [],
  intent: null,
  originalInput: "",
  clarifications: {},
  pendingClarification: null,
  allProviders: [],
  recommendedProvider: null,
  selectedProvider: null,
  showAllProviders: false,
  contactSent: false,
  chattingProvider: null,
  chatMessages: [],
  aiStandbyActive: false,
};

let state: ConversationState = initialState;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function setState(patch: Partial<ConversationState>) {
  state = { ...state, ...patch };
  emit();
}

function uid(prefix = "msg"): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Public API ─────────────────────────────────────────────────────

export const conversation = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  reset() {
    state = { ...initialState, messages: [] };
    emit();
  },
  resetPhase() {
    setState({
      phase: "awaiting-input",
      orbState: "idle",
      intent: null,
      originalInput: "",
      clarifications: {},
      pendingClarification: null,
      allProviders: [],
      recommendedProvider: null,
      selectedProvider: null,
      showAllProviders: false,
      contactSent: false,
      chattingProvider: null,
      chatMessages: [],
      aiStandbyActive: false,
    });
  },
};

// ── Message helpers ────────────────────────────────────────────────

function addMessage(role: MessageRole, text: string) {
  setState({
    messages: [
      ...state.messages,
      { id: uid(), role, text, when: Date.now() },
    ],
  });
}

// ── Natural language understanding ─────────────────────────────────

/**
 * Interpret user intent from free text.
 * Returns the action the user wants to take based on conversation context.
 */
export type UserAction =
  | { type: "new-request"; text: string }
  | { type: "answer-clarification"; text: string }
  | { type: "approve-contact"; providerName?: string }
  | { type: "decline-contact" }
  | { type: "see-more-providers" }
  | { type: "see-all-providers" }
  | { type: "select-provider"; providerName: string }
  | { type: "ask-why"; providerName?: string }
  | { type: "tell-more"; providerName?: string }
  | { type: "chat-with-provider"; providerName?: string }
  | { type: "exit-hands-off" }
  | { type: "unknown"; text: string };

const APPROVAL_PHRASES = [
  "yes", "go ahead", "contact", "contact him", "contact her", "contact them",
  "do it", "sure", "okay", "ok", "please do", "that works", "sounds good",
  "reach out", "send it", "yep", "yeah", "confirm",
];

const DECLINE_PHRASES = [
  "no", "don't", "don't contact", "not yet", "wait", "hold on",
  "i'll think about it", "not now", "nevermind", "nope",
];

const SEE_MORE_PHRASES = [
  "see more", "other providers", "more providers", "show me more",
  "see all", "show everyone", "all providers", "what else",
  "other options", "see the others", "who else",
];

const WHY_PHRASES = [
  "why", "why this", "why did you", "what makes", "tell me more about",
  "why choose", "why recommend", "explain",
];

const CHAT_PHRASES = [
  "chat with", "talk to", "message", "chat", "i want to talk",
  "let me chat", "connect me",
];

const EXIT_PHRASES = [
  "exit", "leave hands off", "turn off", "stop hands off", "close",
  "go back", "exit hands off", "end hands off",
];

export function interpretUserInput(text: string): UserAction {
  const lower = text.toLowerCase().trim();
  if (!lower) return { type: "unknown", text };

  // Check exit first (only relevant in hands-off)
  if (EXIT_PHRASES.some((p) => lower.includes(p))) {
    return { type: "exit-hands-off" };
  }

  const phase = state.phase;

  // If we're awaiting permission
  if (phase === "awaiting-permission") {
    if (APPROVAL_PHRASES.some((p) => lower === p || lower.startsWith(p + " "))) {
      // Check if they named a specific provider
      const named = findProviderInText(lower);
      return { type: "approve-contact", providerName: named?.name };
    }
    if (DECLINE_PHRASES.some((p) => lower === p || lower.startsWith(p + " "))) {
      return { type: "decline-contact" };
    }
    if (SEE_MORE_PHRASES.some((p) => lower.includes(p))) {
      return { type: "see-more-providers" };
    }
    if (WHY_PHRASES.some((p) => lower.includes(p))) {
      const named = findProviderInText(lower);
      return { type: "ask-why", providerName: named?.name };
    }
    if (CHAT_PHRASES.some((p) => lower.includes(p))) {
      const named = findProviderInText(lower);
      return { type: "chat-with-provider", providerName: named?.name };
    }
    // "contact [name]" — selecting a different provider and approving
    const named = findProviderInText(lower);
    if (named && (lower.includes("contact") || lower.includes("reach out to"))) {
      return { type: "approve-contact", providerName: named.name };
    }
    // "select" or "choose" without approval
    if (named && (lower.includes("select") || lower.includes("choose") || lower.includes("i want") || lower.includes("i'd rather"))) {
      return { type: "select-provider", providerName: named.name };
    }
  }

  // If we're in recommending phase, similar checks
  if (phase === "recommending") {
    if (SEE_MORE_PHRASES.some((p) => lower.includes(p))) {
      return { type: "see-more-providers" };
    }
    if (CHAT_PHRASES.some((p) => lower.includes(p))) {
      const named = findProviderInText(lower);
      return { type: "chat-with-provider", providerName: named?.name };
    }
    if (APPROVAL_PHRASES.some((p) => lower === p || lower.startsWith(p + " "))) {
      const named = findProviderInText(lower);
      return { type: "approve-contact", providerName: named?.name };
    }
  }

  // If clarifying, treat as answer
  if (phase === "clarifying") {
    return { type: "answer-clarification", text };
  }

  // If browsing providers
  if (phase === "browsing-providers") {
    const named = findProviderInText(lower);
    if (named) {
      if (APPROVAL_PHRASES.some((p) => lower.includes(p))) {
        return { type: "approve-contact", providerName: named.name };
      }
      return { type: "select-provider", providerName: named.name };
    }
    if (WHY_PHRASES.some((p) => lower.includes(p))) {
      return { type: "ask-why", providerName: named?.name };
    }
    if (CHAT_PHRASES.some((p) => lower.includes(p))) {
      return { type: "chat-with-provider" };
    }
  }

  // If chatting with provider
  if (phase === "chatting-with-provider") {
    return { type: "unknown", text };
  }

  // If contacted, allow new request
  if (phase === "contacted" || phase === "awaiting-input") {
    return { type: "new-request", text };
  }

  return { type: "new-request", text };
}

function findProviderInText(text: string): HomeProvider | undefined {
  const providers = state.allProviders;
  if (providers.length === 0) return undefined;
  // Check by name (first name match)
  for (const p of providers) {
    const firstName = p.name.split(" ")[0]!.toLowerCase();
    if (text.includes(firstName)) return p;
  }
  // Check by full name
  for (const p of providers) {
    if (text.includes(p.name.toLowerCase())) return p;
  }
  return undefined;
}

// ── Conversation flow control ──────────────────────────────────────

/**
 * Process a new user request. Entry point for both keyboard and hands-off modes.
 * Returns the first response the assistant should give.
 */
export function processNewRequest(text: string): {
  response: string;
  needsClarification: boolean;
  clarificationQuestion: string | null;
  clarificationOptions: string[] | null;
} {
  const intent = resolveIntent(text);

  addMessage("user", text);
  setState({
    phase: "understanding",
    orbState: "understanding",
    intent,
    originalInput: text,
    clarifications: {},
    recommendedProvider: null,
    selectedProvider: null,
    showAllProviders: false,
    contactSent: false,
    allProviders: [...intent.providers, ...intent.moreProviders],
  });

  // Check if clarification is needed
  const clarification = getClarification(text, intent);

  if (clarification) {
    setState({
      phase: "clarifying",
      orbState: "speaking",
      pendingClarification: clarification.id,
    });
    addMessage("assistant", clarification.question);
    return {
      response: clarification.question,
      needsClarification: true,
      clarificationQuestion: clarification.question,
      clarificationOptions: clarification.options ?? null,
    };
  }

  // No clarification needed — proceed to understanding summary
  return processUnderstanding();
}

/**
 * Process a clarification answer and determine next step.
 */
export function processClarificationAnswer(answer: string): {
  response: string;
  done: boolean;
} {
  const field = getClarificationField(state.pendingClarification);
  if (field) {
    setState({
      clarifications: { ...state.clarifications, [field]: answer },
      pendingClarification: null,
    });
  }
  addMessage("user", answer);

  // Check if another clarification is needed
  if (state.intent) {
    const nextClarification = getClarification(state.originalInput + " " + Object.values(state.clarifications).join(" "), state.intent);
    if (nextClarification && nextClarification.id !== state.pendingClarification) {
      setState({
        pendingClarification: nextClarification.id,
        orbState: "speaking",
      });
      addMessage("assistant", nextClarification.question);
      return { response: nextClarification.question, done: false };
    }
  }

  return processUnderstanding();
}

function getClarificationField(clarificationId: string | null): string | null {
  if (!clarificationId) return null;
  const map: Record<string, string> = {
    "leak-nature": "leakNature",
    "cooling-nature": "coolingNature",
    "property-type": "propertyType",
    "safety-check": "safetyConcern",
    "item-count": "itemCount",
  };
  return map[clarificationId] ?? null;
}

/**
 * Build understanding summary and proceed to search.
 */
function processUnderstanding(): { response: string; done: boolean; clarificationQuestion: string | null; clarificationOptions: string[] | null; needsClarification: boolean } {
  const intent = state.intent!;

  const understandingLines: string[] = [intent.summary];

  // Include clarification answers in the understanding
  const cl = state.clarifications;
  if (cl.leakNature) understandingLines.push(`Leak pattern: ${cl.leakNature.toLowerCase()}.`);
  if (cl.coolingNature) understandingLines.push(`Issue: ${cl.coolingNature.toLowerCase()}.`);
  if (cl.propertyType) understandingLines.push(`Property: ${cl.propertyType.toLowerCase()}.`);
  if (cl.safetyConcern && cl.safetyConcern !== "No, nothing like that")
    understandingLines.push(`Safety note: ${cl.safetyConcern.toLowerCase()}.`);
  if (cl.itemCount) understandingLines.push(`Items: ${cl.itemCount.toLowerCase()}.`);

  understandingLines.push(`Priority: ${determinePriority()}.`);

  const understandingText = `Here's what I understand:\n\n${understandingLines.map((l, i) => i === 0 ? l : `• ${l}`).join("\n")}\n\nI'll use this to find suitable ${intent.tradeLabel}s.`;

  addMessage("assistant", understandingText);

  // Move to searching
  setState({
    phase: "searching",
    orbState: "searching",
  });

  return {
    response: understandingText,
    needsClarification: false,
    clarificationQuestion: null,
    clarificationOptions: null,
  };
}

function determinePriority(): string {
  const cl = state.clarifications;
  if (cl.safetyConcern && cl.safetyConcern !== "No, nothing like that") return "Urgent";
  if (cl.leakNature === "It's continuous") return "Urgent";
  return "Normal";
}

/**
 * Advance to the searching/comparing/recommending phase.
 * Returns spoken/text response for the recommendation.
 */
export function processSearchAndRecommend(): {
  response: string;
  recommended: HomeProvider;
  allProviders: HomeProvider[];
} {
  const intent = state.intent!;

  // Simulate searching → comparing → recommending
  setState({
    phase: "searching",
    orbState: "searching",
  });

  const allProviders = [...intent.providers, ...intent.moreProviders];
  const recommended = intent.providers[0]!;

  setState({
    phase: "comparing",
    orbState: "comparing",
    allProviders,
  });

  // Build recommendation text
  const matchCat = intent.matchCategories?.[recommended.id] ?? "strong-overall";
  const categoryLabel = matchCategoryLabel(matchCat);

  const response = `I found ${allProviders.length} ${intent.tradeLabel}s who can help. ${recommended.name} looks like a strong match because ${recommended.reason.toLowerCase()} Would you like me to contact ${recommended.name.split(" ")[0]}?`;

  setState({
    phase: "recommending",
    orbState: "recommending",
    recommendedProvider: recommended,
    selectedProvider: recommended,
  });

  addMessage("assistant", response);

  return { response, recommended, allProviders };
}

/**
 * Transition to awaiting permission for a specific provider.
 */
export function askPermission(provider?: HomeProvider): string {
  const p = provider ?? state.selectedProvider ?? state.recommendedProvider!;
  setState({
    phase: "awaiting-permission",
    orbState: "waiting-permission",
    selectedProvider: p,
  });
  const response = `Would you like me to contact ${p.name}?`;
  addMessage("assistant", response);
  return response;
}

/**
 * User approved contact — simulate sending request.
 */
export function approveContact(providerName?: string): string {
  const provider = providerName
    ? state.allProviders.find((p) => p.name.split(" ")[0]?.toLowerCase() === providerName.toLowerCase() || p.name.toLowerCase() === providerName.toLowerCase()) ?? state.selectedProvider!
    : state.selectedProvider ?? state.recommendedProvider!;

  const response = `Okay. I've sent ${provider.name} a request. You'll get a message when they respond.`;
  addMessage("assistant", response);
  setState({
    phase: "contacted",
    orbState: "contacted",
    contactSent: true,
    selectedProvider: provider,
    recommendedProvider: provider,
  });
  return response;
}

/**
 * User declined contact.
 */
export function declineContact(): string {
  const response = "No problem. I'll keep this request ready for whenever you decide. Your other options are still available.";
  addMessage("assistant", response);
  setState({
    phase: "browsing-providers",
    orbState: "idle",
  });
  return response;
}

/**
 * Show all providers (expand the list).
 */
export function showAllProviders(): string {
  setState({
    phase: "browsing-providers",
    orbState: "idle",
    showAllProviders: true,
  });
  const count = state.allProviders.length;
  const response = `Here are all ${count} providers I found. You can select any of them, or ask me about any specific one.`;
  addMessage("assistant", response);
  return response;
}

/**
 * Select a different provider.
 */
export function selectProvider(providerName: string): string {
  const provider = state.allProviders.find(
    (p) =>
      p.name.split(" ")[0]?.toLowerCase() === providerName.toLowerCase() ||
      p.name.toLowerCase() === providerName.toLowerCase(),
  );
  if (!provider) {
    const response = `I couldn't find a provider named ${providerName}. Could you check the name?`;
    addMessage("assistant", response);
    return response;
  }

  setState({
    selectedProvider: provider,
    phase: "awaiting-permission",
    orbState: "waiting-permission",
  });
  const response = `Got it. Would you like me to contact ${provider.name} instead?`;
  addMessage("assistant", response);
  return response;
}

/**
 * Explain why a provider was recommended.
 */
export function explainWhy(providerName?: string): string {
  const provider = providerName
    ? state.allProviders.find((p) => p.name.split(" ")[0]?.toLowerCase() === providerName.toLowerCase() || p.name.toLowerCase() === providerName.toLowerCase()) ?? state.selectedProvider ?? state.recommendedProvider!
    : state.selectedProvider ?? state.recommendedProvider!;

  const intent = state.intent!;
  const matchCat = intent.matchCategories?.[provider.id] ?? "strong-overall";
  const categoryLabel = matchCategoryLabel(matchCat);

  const response = `${provider.name} is a ${categoryLabel.toLowerCase()}. ${provider.reason} ${provider.experience} of experience, rated ${provider.rating.toFixed(1)} stars from ${provider.reviews} reviews, and ${provider.availability.toLowerCase()}.`;

  addMessage("assistant", response);
  return response;
}

/**
 * Start chatting with a provider.
 */
export function startProviderChat(providerName?: string): string {
  const provider = providerName
    ? state.allProviders.find((p) => p.name.split(" ")[0]?.toLowerCase() === providerName.toLowerCase() || p.name.toLowerCase() === providerName.toLowerCase()) ?? state.selectedProvider ?? state.recommendedProvider!
    : state.selectedProvider ?? state.recommendedProvider!;

  setState({
    phase: "chatting-with-provider",
    orbState: "idle",
    chattingProvider: provider,
    aiStandbyActive: true,
    chatMessages: [
      {
        id: uid("chat"),
        role: "provider",
        text: `Hi! Thanks for reaching out. I'm ${provider.name.split(" ")[0]}. When did you first notice the issue?`,
        when: Date.now(),
      },
    ],
  });

  const response = `I'll step back and let you talk directly with ${provider.name}. I'm here if you need me to clarify or explain anything.`;
  addMessage("assistant", response);
  return response;
}

/**
 * Send a message to the provider in chat mode.
 * Returns the provider's simulated reply.
 */
export function sendProviderMessage(text: string): { providerReply: string; aiAssist: string | null } {
  setState({
    chatMessages: [
      ...state.chatMessages,
      { id: uid("chat"), role: "user", text, when: Date.now() },
    ],
  });

  // Simulate provider reply based on context
  const intent = state.intent;
  let providerReply = "Thanks for the info. I'll take a look at it when I arrive. Does tomorrow work for you?";

  if (text.toLowerCase().includes("picture") || text.toLowerCase().includes("photo")) {
    providerReply = "Could you send me a photo of the area? That'll help me understand what we're working with.";
  } else if (text.toLowerCase().includes("when") || text.toLowerCase().includes("tomorrow") || text.toLowerCase().includes("today")) {
    providerReply = "I can come by tomorrow morning, around 9 AM. Does that work for you?";
  } else if (text.toLowerCase().includes("price") || text.toLowerCase().includes("cost") || text.toLowerCase().includes("quote")) {
    providerReply = "For a standard call-out it'll be a flat fee, plus any parts if needed. I'll give you a full quote before starting any work.";
  } else if (text.toLowerCase().includes("which part") || text.toLowerCase().includes("where")) {
    providerReply = "If you could show me the area underneath the sink where you noticed the leak, that would be most helpful.";
  }

  setState({
    chatMessages: [
      ...state.chatMessages,
      { id: uid("chat"), role: "provider", text: providerReply, when: Date.now() },
    ],
  });

  // AI assist: if the provider's message might need clarification
  let aiAssist: string | null = null;
  if (providerReply.includes("photo") || providerReply.includes("area")) {
    aiAssist = `${state.chattingProvider?.name.split(" ")[0]} is asking for a photo of the problem area so they can prepare the right tools.`;
  }

  return { providerReply, aiAssist };
}

/**
 * AI assists during provider chat (clarifies what the provider meant).
 */
export function aiAssistInChat(): string {
  const lastProviderMsg = [...state.chatMessages].reverse().find((m) => m.role === "provider");
  if (!lastProviderMsg) return "I'm here if you need help understanding anything.";

  const provider = state.chattingProvider;
  const firstName = provider?.name.split(" ")[0] ?? "The provider";

  if (lastProviderMsg.text.includes("photo") || lastProviderMsg.text.includes("area")) {
    const assist = `${firstName} is asking for a picture of the area underneath the sink where you noticed the leak. This helps them bring the right tools.`;
    addMessage("assistant", assist);
    return assist;
  }
  if (lastProviderMsg.text.includes("tomorrow") || lastProviderMsg.text.includes("morning")) {
    const assist = `${firstName} is proposing a time for the visit. You can accept, suggest a different time, or ask them about other options.`;
    addMessage("assistant", assist);
    return assist;
  }
  if (lastProviderMsg.text.includes("quote") || lastProviderMsg.text.includes("fee")) {
    const assist = `${firstName} is explaining their pricing. A flat call-out fee is standard. You can ask for a detailed breakdown before agreeing to anything.`;
    addMessage("assistant", assist);
    return assist;
  }

  const assist = `${firstName} is asking about the issue. Feel free to describe what's happening in your own words.`;
  addMessage("assistant", assist);
  return assist;
}

/**
 * Exit provider chat mode.
 */
export function exitProviderChat(): string {
  setState({
    phase: "awaiting-permission",
    orbState: "waiting-permission",
    chattingProvider: null,
    aiStandbyActive: false,
  });
  const response = "I'm back. We can continue where we left off, or you can start a new request.";
  addMessage("assistant", response);
  return response;
}
