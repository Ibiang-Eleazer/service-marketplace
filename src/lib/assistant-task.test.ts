import { test } from "node:test";
import assert from "node:assert/strict";
import {
  answerQuestion,
  attemptContact,
  addInformation,
  canExecuteContact,
  classifyRequest,
  completeTask,
  createTask,
  decideApproval,
  editGoal,
  listedProviders,
  nextAction,
  requestContact,
  retryStep,
  runCompareStep,
  runSearchStep,
  workflowPrompt,
  type AssistantTask,
  type SearchOutcome,
} from "./assistant-task.ts";
import { intents } from "./home-data.ts";

const NOT_SENT =
  "Sending requests isn't connected in this prototype, so nothing was sent.";

function sampleSearch(query: string | null): SearchOutcome {
  const intent = intents.find((i) => i.tradeLabel === query);
  if (!intent)
    return {
      ok: false,
      error: `Live search for ${query}s isn't connected yet.`,
    };
  return { ok: true, providers: [...intent.providers] };
}

function stepId(task: AssistantTask, title: string): string {
  const step = task.steps.find((s) => s.title === title);
  if (!step) throw new Error(`No step titled ${title}`);
  return step.id;
}

function runAllReadySearches(
  task: AssistantTask,
  search = sampleSearch,
): AssistantTask {
  let current = task;
  for (const step of task.steps.filter((s) => s.kind === "search")) {
    const live = current.steps.find((s) => s.id === step.id);
    if (live?.state === "ready")
      current = runSearchStep(current, step.id, search);
  }
  return current;
}

test("1. a simple factual question stays conversational", () => {
  const task = createTask("What is the capital of France?", intents);
  assert.equal(task.mode, "conversational");
  assert.equal(task.question, null);
  assert.equal(task.steps.length, 0);
});

test("2. a leaking-tap request asks a relevant location question", () => {
  const task = createTask("My sink is leaking", intents);
  assert.equal(task.mode, "clarification");
  assert.equal(task.state, "clarifying");
  assert.equal(task.question?.field, "location");
  assert.match(task.question?.text ?? "", /Where is the problem/);
});

test("3. a bedroom renovation becomes a structured plan with assumptions", () => {
  const task = createTask(
    "Renovate my bedroom: new wardrobe, repaint and rewire the lights",
    intents,
  );
  assert.equal(task.mode, "planned");
  const titles = task.steps.map((s) => s.title);
  assert.ok(titles.includes("Find an electrician"));
  assert.ok(titles.includes("Find a carpenter"));
  assert.ok(titles.includes("Find a painter"));
  assert.ok(titles.includes("Compare the options"));
  assert.ok(titles.includes("Contact the professionals you choose"));
  assert.equal(task.steps[0]?.kind, "clarify");
  assert.equal(task.assumptions.length, 0);

  const vague = createTask("Renovate my bedroom and make it nicer", intents);
  assert.equal(vague.mode, "planned");
  assert.equal(vague.assumptions.length, 1);
  assert.match(vague.assumptions[0]!.text, /electrician, carpenter, painter/);
});

test("4. answering a clarification keeps earlier facts", () => {
  const first = createTask("My sink is leaking", intents);
  const answered = answerQuestion(first, "kitchen", intents);
  assert.equal(answered.goal, "My sink is leaking");
  assert.equal(answered.answers["location"], "kitchen");
  assert.equal(answered.question, null);
  assert.equal(answered.mode, "conversational");
  assert.ok(answered.confirmed.includes("Goal: My sink is leaking"));
  assert.ok(answered.confirmed.includes("Location: kitchen"));
  assert.equal(workflowPrompt(answered), "My sink is leaking (kitchen)");
  assert.equal(answered.history[0], "Started: My sink is leaking");
});

test("4b. new information moves a conversational task to planned and keeps its facts", () => {
  const first = answerQuestion(
    createTask("My sink is leaking", intents),
    "kitchen",
    intents,
  );
  const expanded = addInformation(
    first,
    "Also repaint the kitchen and rewire the lights",
    intents,
  );
  assert.equal(expanded.mode, "planned");
  assert.ok(expanded.confirmed.includes("Location: kitchen"));
  assert.ok(expanded.confirmed.includes("Goal: My sink is leaking"));
  assert.ok(expanded.history.some((h) => h.startsWith("Added:")));
});

test("5. editing the goal rebuilds the plan", () => {
  const planned = createTask(
    "Renovate my bedroom: new wardrobe, repaint and rewire the lights",
    intents,
  );
  const edited = editGoal(
    planned,
    "Renovate my bedroom, but only repaint the walls",
    intents,
  );
  assert.equal(edited.mode, "planned");
  const searchTitles = edited.steps
    .filter((s) => s.kind === "search")
    .map((s) => s.title);
  assert.deepEqual(searchTitles, ["Find a painter"]);
  assert.ok(edited.history.some((h) => h.startsWith("Goal changed:")));
});

test("6. a provider-search failure produces a recoverable blocked state", () => {
  const planned = answerQuestion(
    createTask(
      "Renovate my bedroom: new wardrobe, repaint and rewire the lights",
      intents,
    ),
    "all of the bedroom",
    intents,
  );
  const withFailure = runAllReadySearches(planned);
  assert.equal(withFailure.state, "blocked");
  assert.ok(withFailure.blocker);
  const failedStep = withFailure.steps.find((s) => s.state === "failed");
  assert.ok(failedStep?.error);

  const retried = retryStep(withFailure, failedStep!.id);
  assert.equal(retried.state, "ready");
  assert.equal(retried.blocker, null);
  assert.equal(
    retried.steps.find((s) => s.id === failedStep!.id)?.state,
    "ready",
  );
});

test("7. listed providers are sample records with evidence that they are not live", () => {
  const planned = answerQuestion(
    createTask(
      "Plan my kitchen electrics and then coordinate the fitting",
      intents,
    ),
    "kitchen only",
    intents,
  );
  const searched = runAllReadySearches(planned);
  const providers = listedProviders(searched);
  assert.ok(providers.length > 0);
  assert.ok(
    searched.evidence.every((e) => e.includes("not live availability")),
  );
  assert.equal(searched.state, "ready");
  assert.equal(searched.blocker, null);
});

test("8. a message cannot be sent without explicit approval", () => {
  const planned = runCompareStep(
    runAllReadySearches(
      answerQuestion(
        createTask(
          "Plan my kitchen electrics and then coordinate the fitting",
          intents,
        ),
        "kitchen only",
        intents,
      ),
    ),
  );
  const contactId = stepId(planned, "Contact the professionals you choose");
  const requested = requestContact(planned, "Lumen Electrical");
  assert.equal(requested.state, "approval");
  assert.equal(canExecuteContact(requested, "Lumen Electrical"), false);
  assert.throws(() =>
    attemptContact(requested, requested.approvals[0]!.id, NOT_SENT),
  );

  const declined = decideApproval(
    requested,
    requested.approvals[0]!.id,
    "declined",
  );
  assert.equal(canExecuteContact(declined, "Lumen Electrical"), false);
  assert.equal(declined.steps.find((s) => s.id === contactId)?.state, "ready");
});

test("9. approval for one provider does not authorise contacting another", () => {
  const planned = runCompareStep(
    runAllReadySearches(
      answerQuestion(
        createTask(
          "Plan my kitchen electrics and then coordinate the fitting",
          intents,
        ),
        "kitchen only",
        intents,
      ),
    ),
  );
  const requested = requestContact(planned, "Lumen Electrical");
  const approved = decideApproval(
    requested,
    requested.approvals[0]!.id,
    "approved",
  );
  assert.equal(canExecuteContact(approved, "Lumen Electrical"), true);
  assert.equal(canExecuteContact(approved, "Circuit Works"), false);

  const attempted = attemptContact(
    approved,
    approved.approvals[0]!.id,
    NOT_SENT,
  );
  assert.equal(attempted.approvals[0]!.status, "used");
  assert.throws(() =>
    attemptContact(attempted, approved.approvals[0]!.id, NOT_SENT),
  );
  assert.equal(canExecuteContact(attempted, "Lumen Electrical"), false);
});

test("10. a failed step cannot make the overall task appear completed", () => {
  const planned = runAllReadySearches(
    answerQuestion(
      createTask(
        "Renovate my bedroom: new wardrobe, repaint and rewire the lights",
        intents,
      ),
      "all of the bedroom",
      intents,
    ),
  );
  assert.throws(() => completeTask(planned), /cannot be completed/);
  const contactWithoutApproval = planned.steps.find(
    (s) => s.kind === "contact",
  );
  assert.equal(contactWithoutApproval?.state, "pending");
});

test("state transitions are validated in one place", () => {
  const conversational = createTask("What is a heat pump?", intents);
  assert.throws(() => completeTask(conversational), /cannot be completed/);
  const planned = createTask("Renovate my bedroom and repaint it", intents);
  assert.throws(
    () => runSearchStep(planned, "step-compare", sampleSearch),
    /Unknown step|not a search step/,
  );
  assert.match(nextAction(planned), /Answer the question|Next/);
});
