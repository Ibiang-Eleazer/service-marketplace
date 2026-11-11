import type { HomeProvider, Intent } from "./home-data";

export type TaskMode = "conversational" | "clarification" | "planned";

export type TaskState =
  | "understanding"
  | "clarifying"
  | "planning"
  | "ready"
  | "searching"
  | "comparing"
  | "approval"
  | "in_progress"
  | "blocked"
  | "completed";

export type StepState =
  | "pending"
  | "ready"
  | "running"
  | "waiting_for_user"
  | "succeeded"
  | "failed"
  | "skipped"
  | "cancelled";

export type StepKind = "clarify" | "search" | "compare" | "contact";

export type SearchOutcome =
  { ok: true; providers: HomeProvider[] } | { ok: false; error: string };

export type PlanStep = {
  id: string;
  title: string;
  kind: StepKind;
  dependsOn: string[];
  state: StepState;
  query: string | null;
  attempts: number;
  error: string | null;
};

export type ApprovalStatus = "requested" | "approved" | "declined" | "used";

export type Approval = {
  id: string;
  stepId: string;
  recipient: string;
  description: string;
  status: ApprovalStatus;
};

export type PendingQuestion = { field: string; text: string };

export type Assumption = { id: string; text: string };

export type AssistantTask = {
  id: string;
  goal: string;
  mode: TaskMode;
  state: TaskState;
  confirmed: string[];
  assumptions: Assumption[];
  unknowns: string[];
  answers: Record<string, string>;
  question: PendingQuestion | null;
  steps: PlanStep[];
  approvals: Approval[];
  searchResults: Record<string, SearchOutcome>;
  history: string[];
  blocker: string | null;
  evidence: string[];
};

const TASK_TRANSITIONS: Record<TaskState, readonly TaskState[]> = {
  understanding: ["clarifying", "planning", "ready", "blocked"],
  clarifying: ["understanding", "blocked"],
  planning: ["understanding", "ready", "blocked"],
  ready: [
    "understanding",
    "clarifying",
    "planning",
    "searching",
    "comparing",
    "approval",
    "in_progress",
    "blocked",
    "completed",
  ],
  searching: ["understanding", "comparing", "ready", "blocked"],
  comparing: ["understanding", "ready", "approval", "blocked"],
  approval: ["understanding", "in_progress", "ready", "blocked"],
  in_progress: [
    "understanding",
    "searching",
    "comparing",
    "approval",
    "ready",
    "blocked",
    "completed",
  ],
  blocked: [
    "understanding",
    "clarifying",
    "planning",
    "ready",
    "searching",
    "in_progress",
  ],
  completed: ["understanding"],
};

const STEP_TRANSITIONS: Record<StepState, readonly StepState[]> = {
  pending: ["ready", "skipped", "cancelled"],
  ready: ["running", "waiting_for_user", "skipped", "cancelled"],
  waiting_for_user: ["ready", "skipped", "cancelled"],
  running: ["succeeded", "failed", "cancelled"],
  failed: ["ready", "skipped", "cancelled"],
  succeeded: [],
  skipped: [],
  cancelled: [],
};

export function transitionTask(
  task: AssistantTask,
  to: TaskState,
): AssistantTask {
  if (task.state === to) return task;
  if (!TASK_TRANSITIONS[task.state].includes(to)) {
    throw new Error(`Invalid task transition: ${task.state} to ${to}`);
  }
  return { ...task, state: to };
}

function transitionStep(step: PlanStep, to: StepState): PlanStep {
  if (step.state === to) return step;
  if (!STEP_TRANSITIONS[step.state].includes(to)) {
    throw new Error(`Invalid step transition: ${step.state} to ${to}`);
  }
  return { ...step, state: to };
}

function updateStep(
  task: AssistantTask,
  stepId: string,
  change: (step: PlanStep) => PlanStep,
): AssistantTask {
  const existing = task.steps.find((s) => s.id === stepId);
  if (!existing) throw new Error(`Unknown step: ${stepId}`);
  return {
    ...task,
    steps: task.steps.map((s) => (s.id === stepId ? change(existing) : s)),
  };
}

const PLAN_REQUEST =
  /\b(make|create|build|give|write|draw up)\b.*\bplan\b|\bplan (this|it|out)\b|\bstep[- ]by[- ]step\b/i;
const MULTI_STEP =
  /\b(renovat\w*|remodel\w*|refurbish\w*|move (house|flat|apartment)|several|multiple|coordinate|and then|after that|followed by)\b/i;
const QUESTION_START =
  /^(what|who|when|where|why|how|is|are|can|does|do|did|will|should)\b/i;
const ACTION_WORDS =
  /\b(find|need|book|send|get|help|arrange|hire|contact|call|organi[sz]e|clean|assemble|repair)\b/i;
const LOCATION_WORDS =
  /\b(kitchen|bathroom|toilet|shower|outside|outdoor|garden|basement|laundry|bedroom|living room|hallway|roof)\b/i;
const RENOVATION_WORDS = /\b(renovat\w*|remodel\w*|refurbish\w*)\b/i;

const TRADE_RULES: { query: string; pattern: RegExp }[] = [
  {
    query: "electrician",
    pattern: /\b(electric\w*|socket|wiring|lights?|lighting)\b/i,
  },
  {
    query: "plumber",
    pattern: /\b(plumb\w*|sink|tap|pipes?|leak\w*|drain)\b/i,
  },
  {
    query: "carpenter",
    pattern:
      /\b(carpent\w*|wardrobe|cabinets?|shel(f|ves|ving)|built-in|wood\w*)\b/i,
  },
  { query: "painter", pattern: /paint\w*|decorat\w*/i },
  { query: "cleaning service", pattern: /\b(clean\w*|tidy)\b/i },
];

const RENOVATION_DEFAULT_TRADES = ["electrician", "carpenter", "painter"];

export type Classification = {
  mode: TaskMode;
  question: PendingQuestion | null;
  trades: string[];
  assumedTrades: boolean;
  reason: string;
};

function matchesKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const suffix = keyword.length > 3 ? "" : "\\b";
  return new RegExp(`\\b${escaped}${suffix}`, "i").test(text);
}

/** Transparent rules: keyword and phrase matching, no AI model. */
export function classifyRequest(
  goal: string,
  intents: Intent[],
  answers: Record<string, string>,
): Classification {
  const text = goal.trim();
  const trades = TRADE_RULES.filter((r) => r.pattern.test(text)).map(
    (r) => r.query,
  );
  const planRequested = PLAN_REQUEST.test(text);

  if (planRequested || MULTI_STEP.test(text) || trades.length >= 2) {
    const renovation = RENOVATION_WORDS.test(text);
    const assumedTrades = trades.length === 0 && renovation;
    const resolvedTrades = assumedTrades ? RENOVATION_DEFAULT_TRADES : trades;
    return {
      mode: "planned",
      question: answers["scope"]
        ? null
        : {
            field: "scope",
            text: "Which parts of the job should I include? You can also say 'looks right'.",
          },
      trades: resolvedTrades,
      assumedTrades,
      reason: "Several steps or providers are involved.",
    };
  }

  const intent = intents.find((i) =>
    i.match.some((k) => matchesKeyword(text, k)),
  );
  if (intent) {
    const isQuestion = QUESTION_START.test(text) || text.endsWith("?");
    if (isQuestion && !ACTION_WORDS.test(text)) {
      return {
        mode: "conversational",
        question: null,
        trades: [],
        assumedTrades: false,
        reason: "A question, not a request.",
      };
    }
    if (!answers["location"] && !LOCATION_WORDS.test(text)) {
      return {
        mode: "clarification",
        question: {
          field: "location",
          text: "Where is the problem? For example the kitchen, the bathroom, or another room.",
        },
        trades: [intent.tradeLabel],
        assumedTrades: false,
        reason: "The location affects which professional to send.",
      };
    }
    return {
      mode: "conversational",
      question: null,
      trades: [intent.tradeLabel],
      assumedTrades: false,
      reason: "A single, clear request.",
    };
  }

  return {
    mode: "conversational",
    question: null,
    trades: [],
    assumedTrades: false,
    reason: "No provider request detected.",
  };
}

function withArticle(noun: string): string {
  return /^[aeiou]/i.test(noun) ? `an ${noun}` : `a ${noun}`;
}

function buildSteps(
  trades: string[],
  answers: Record<string, string>,
): PlanStep[] {
  const steps: PlanStep[] = [];
  const scopeId = "step-scope";
  steps.push({
    id: scopeId,
    title: "Confirm the scope",
    kind: "clarify",
    dependsOn: [],
    state: answers["scope"] ? "succeeded" : "waiting_for_user",
    query: null,
    attempts: 0,
    error: null,
  });
  const searchQueries: (string | null)[] = trades.length > 0 ? trades : [null];
  searchQueries.forEach((query, index) => {
    steps.push({
      id: `step-search-${index + 1}`,
      title: query ? `Find ${withArticle(query)}` : "Find professionals",
      kind: "search",
      dependsOn: [scopeId],
      state: "pending",
      query,
      attempts: 0,
      error: null,
    });
  });
  const searchStepIds = steps
    .filter((s) => s.kind === "search")
    .map((s) => s.id);
  steps.push({
    id: "step-compare",
    title: "Compare the options",
    kind: "compare",
    dependsOn: searchStepIds,
    state: "pending",
    query: null,
    attempts: 0,
    error: null,
  });
  steps.push({
    id: "step-contact",
    title: "Contact the professionals you choose",
    kind: "contact",
    dependsOn: ["step-compare"],
    state: "pending",
    query: null,
    attempts: 0,
    error: null,
  });
  return steps;
}

/** Recomputes mode, question and plan from the goal and known answers. Keeps facts and history. */
export function applyGoal(
  task: AssistantTask,
  intents: Intent[],
): AssistantTask {
  const c = classifyRequest(task.goal, intents, task.answers);
  const assumptions = c.assumedTrades
    ? addAssumption(
        task.assumptions,
        `Assumed the job needs ${c.trades.join(", ")} (correct it by editing the goal).`,
      )
    : task.assumptions;
  const planSteps =
    c.mode === "planned" ? buildSteps(c.trades, task.answers) : [];
  const target: TaskState = c.question
    ? "clarifying"
    : c.mode === "planned"
      ? "planning"
      : "ready";

  const reset: AssistantTask = {
    ...task,
    mode: c.mode,
    question: c.question,
    assumptions,
    steps: planSteps,
    blocker: null,
    unknowns: c.question ? [c.question.text] : [],
  };
  const base =
    task.state === "understanding"
      ? reset
      : transitionTask(reset, "understanding");
  const moved = transitionTask(base, target);
  const planned =
    moved.mode === "planned" && !moved.question
      ? transitionTask(moved, "ready")
      : moved;
  return refreshReadySteps(planned);
}

function addAssumption(existing: Assumption[], text: string): Assumption[] {
  if (existing.some((a) => a.text === text)) return existing;
  return [...existing, { id: `assumption-${existing.length + 1}`, text }];
}

export function createTask(goal: string, intents: Intent[]): AssistantTask {
  const task: AssistantTask = {
    id: crypto.randomUUID(),
    goal: goal.trim(),
    mode: "conversational",
    state: "understanding",
    confirmed: [`Goal: ${goal.trim()}`],
    assumptions: [],
    unknowns: [],
    answers: {},
    question: null,
    steps: [],
    approvals: [],
    searchResults: {},
    history: [`Started: ${goal.trim()}`],
    blocker: null,
    evidence: [],
  };
  return applyGoal(task, intents);
}

/** Adds new information. Can move a task from conversational or clarification to planned. */
export function addInformation(
  task: AssistantTask,
  text: string,
  intents: Intent[],
): AssistantTask {
  const value = text.trim();
  const next = {
    ...task,
    goal: `${task.goal}. ${value}`,
    confirmed: [...task.confirmed, `Also: ${value}`],
    history: [...task.history, `Added: ${value}`],
  };
  return applyGoal(next, intents);
}

/** Replaces the goal. Keeps answers and confirmed facts; rebuilds the plan. */
export function editGoal(
  task: AssistantTask,
  goal: string,
  intents: Intent[],
): AssistantTask {
  const value = goal.trim();
  const next = {
    ...task,
    goal: value,
    history: [...task.history, `Goal changed: ${value}`],
  };
  return applyGoal(next, intents);
}

/** Answers the question awaiting the user and re-evaluates the task. */
export function answerQuestion(
  task: AssistantTask,
  answer: string,
  intents: Intent[],
): AssistantTask {
  if (!task.question) throw new Error("No question is awaiting an answer");
  const { field } = task.question;
  const value = answer.trim();
  const answers = { ...task.answers, [field]: value };
  const next = {
    ...task,
    answers,
    confirmed: [
      ...task.confirmed,
      `${field === "location" ? "Location" : "Scope"}: ${value}`,
    ],
    history: [...task.history, `Answered: ${value}`],
  };
  return applyGoal(next, intents);
}

/** Combines the goal with the known location into the prompt used for the provider comparison. */
export function workflowPrompt(task: AssistantTask): string {
  const extras = Object.entries(task.answers)
    .filter(([field]) => field === "location")
    .map(([, value]) => value);
  return extras.length > 0 ? `${task.goal} (${extras.join(", ")})` : task.goal;
}

function refreshReadySteps(task: AssistantTask): AssistantTask {
  let current = task;
  for (const step of task.steps) {
    if (step.state !== "pending") continue;
    const depsDone = step.dependsOn.every((id) =>
      current.steps.some((s) => s.id === id && s.state === "succeeded"),
    );
    if (depsDone)
      current = updateStep(current, step.id, (s) => transitionStep(s, "ready"));
  }
  return current;
}

export function runSearchStep(
  task: AssistantTask,
  stepId: string,
  search: (query: string | null) => SearchOutcome,
): AssistantTask {
  const step = requireStep(task, stepId);
  if (step.kind !== "search") throw new Error("Step is not a search step");
  const started = transitionTask(
    updateStep(task, stepId, (s) => ({
      ...transitionStep(s, "running"),
      attempts: s.attempts + 1,
    })),
    "searching",
  );
  const outcome = search(step.query);
  if (!outcome.ok) {
    const failed = updateStep(started, stepId, (s) => ({
      ...transitionStep(s, "failed"),
      error: outcome.error,
    }));
    return {
      ...transitionTask(failed, "blocked"),
      blocker: `${step.title}: ${outcome.error}`,
      searchResults: { ...failed.searchResults, [stepId]: outcome },
    };
  }
  const done = updateStep(started, stepId, (s) => ({
    ...transitionStep(s, "succeeded"),
    error: null,
  }));
  const count = outcome.providers.length;
  const next = {
    ...done,
    searchResults: { ...done.searchResults, [stepId]: outcome },
    evidence: [
      ...done.evidence,
      `${step.title}: ${count} sample listing${count === 1 ? "" : "s"} (not live availability)`,
    ],
    blocker: null,
  };
  return refreshReadySteps(transitionTask(next, "ready"));
}

export function runCompareStep(task: AssistantTask): AssistantTask {
  const step = task.steps.find((s) => s.kind === "compare");
  if (!step) throw new Error("No compare step");
  if (step.state !== "ready") throw new Error("Compare step is not ready");
  const moved = transitionTask(task, "comparing");
  const updated = updateStep(moved, step.id, (s) =>
    transitionStep(transitionStep(s, "running"), "succeeded"),
  );
  return refreshReadySteps(transitionTask(updated, "ready"));
}

export function retryStep(task: AssistantTask, stepId: string): AssistantTask {
  const step = requireStep(task, stepId);
  if (step.state !== "failed")
    throw new Error("Only failed steps can be retried");
  const cleared = updateStep(task, stepId, (s) => ({
    ...transitionStep(s, "ready"),
    error: null,
  }));
  return { ...transitionTask(cleared, "ready"), blocker: null };
}

/** Lists the professionals from search results. Each is a sample listing, not a confirmed booking. */
export function listedProviders(task: AssistantTask): HomeProvider[] {
  const seen = new Set<string>();
  const out: HomeProvider[] = [];
  for (const outcome of Object.values(task.searchResults)) {
    if (!outcome.ok) continue;
    for (const p of outcome.providers) {
      if (seen.has(p.id)) continue;
      seen.add(p.id);
      out.push(p);
    }
  }
  return out;
}

export function requestContact(
  task: AssistantTask,
  recipient: string,
): AssistantTask {
  const step = task.steps.find((s) => s.kind === "contact");
  if (!step) throw new Error("No contact step in this plan");
  if (step.state !== "ready" && step.state !== "waiting_for_user") {
    throw new Error("Contact step is not available yet");
  }
  const existing = task.approvals.find(
    (a) =>
      a.stepId === step.id &&
      a.recipient === recipient &&
      a.status === "requested",
  );
  if (existing) return task;
  const approval: Approval = {
    id: `approval-${task.approvals.length + 1}`,
    stepId: step.id,
    recipient,
    description: `Contact ${recipient} about: ${task.goal}`,
    status: "requested",
  };
  const withStep = updateStep(task, step.id, (s) =>
    transitionStep(s, "waiting_for_user"),
  );
  return {
    ...transitionTask(withStep, "approval"),
    approvals: [...task.approvals, approval],
  };
}

export function decideApproval(
  task: AssistantTask,
  approvalId: string,
  decision: "approved" | "declined",
): AssistantTask {
  const approval = task.approvals.find((a) => a.id === approvalId);
  if (!approval || approval.status !== "requested")
    throw new Error("No pending approval with that id");
  const approvals = task.approvals.map((a) =>
    a.id === approvalId ? { ...a, status: decision } : a,
  );
  const history = [
    ...task.history,
    `${decision === "approved" ? "Approved" : "Declined"}: ${approval.description}`,
  ];
  if (decision === "declined") {
    const cleared = {
      ...updateStep(task, approval.stepId, (s) => transitionStep(s, "ready")),
      approvals,
      history,
    };
    return transitionTask(cleared, "ready");
  }
  return { ...task, approvals, history };
}

/** Runs the contact action only for the exact recipient the user approved. Prototype: no message is sent. */
export function attemptContact(
  task: AssistantTask,
  approvalId: string,
  notConnectedMessage: string,
): AssistantTask {
  const approval = task.approvals.find((a) => a.id === approvalId);
  if (!approval || approval.status !== "approved") {
    throw new Error(
      "Contacting requires an approved request for this recipient",
    );
  }
  const consumed = task.approvals.map((a) =>
    a.id === approvalId ? { ...a, status: "used" as const } : a,
  );
  const step = requireStep(task, approval.stepId);
  const running = updateStep(
    { ...task, approvals: consumed },
    step.id,
    (s) => ({
      ...transitionStep(transitionStep(s, "ready"), "running"),
      attempts: s.attempts + 1,
    }),
  );
  const failed = updateStep(
    transitionTask(running, "in_progress"),
    step.id,
    (s) => ({
      ...transitionStep(s, "failed"),
      error: notConnectedMessage,
    }),
  );
  return {
    ...transitionTask(failed, "blocked"),
    blocker: `Contacting ${approval.recipient}: ${notConnectedMessage}`,
    history: [
      ...task.history,
      `Attempted: ${approval.description}. ${notConnectedMessage}`,
    ],
  };
}

export function canExecuteContact(
  task: AssistantTask,
  recipient: string,
): boolean {
  return task.approvals.some(
    (a) => a.recipient === recipient && a.status === "approved",
  );
}

export function completionBlocker(task: AssistantTask): string | null {
  if (task.mode !== "planned") return "Only planned tasks track completion.";
  if (task.steps.some((s) => s.state === "failed")) return "A step failed.";
  if (task.steps.some((s) => s.state !== "succeeded" && s.state !== "skipped"))
    return "Some steps are not finished.";
  if (task.evidence.length === 0)
    return "No verification evidence has been recorded.";
  return null;
}

export function completeTask(task: AssistantTask): AssistantTask {
  const blocker = completionBlocker(task);
  if (blocker) throw new Error(`Task cannot be completed: ${blocker}`);
  return transitionTask(task, "completed");
}

export function nextAction(task: AssistantTask): string {
  if (task.question) return `Answer the question: ${task.question.text}`;
  if (task.state === "completed") return "Nothing left to do.";
  const pending = task.approvals.find((a) => a.status === "requested");
  if (pending) return `Approve or decline: ${pending.description}`;
  if (task.blocker) return `Blocked: ${task.blocker}`;
  const ready = task.steps.find((s) => s.state === "ready");
  if (ready) return `Next: ${ready.title}`;
  return "Waiting for the next step.";
}

function requireStep(task: AssistantTask, stepId: string): PlanStep {
  const step = task.steps.find((s) => s.id === stepId);
  if (!step) throw new Error(`Unknown step: ${stepId}`);
  return step;
}
