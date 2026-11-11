import { useState } from "react";
import { Button } from "@/components/ui-kit";
import { AiMark } from "@/components/ai-mark";
import {
  listedProviders,
  nextAction,
  type AssistantTask,
  type PlanStep,
  type StepState,
  type TaskState,
} from "@/lib/assistant-task";
import { cn } from "@/lib/utils";

const TASK_STATE_LABEL: Record<TaskState, string> = {
  understanding: "Understanding",
  clarifying: "Needs your answer",
  planning: "Planning",
  ready: "Ready",
  searching: "Searching",
  comparing: "Comparing",
  approval: "Waiting for your approval",
  in_progress: "In progress",
  blocked: "Blocked",
  completed: "Completed",
};

const STEP_LABEL: Record<StepState, string> = {
  pending: "Waiting",
  ready: "Ready",
  running: "Running",
  waiting_for_user: "Needs you",
  succeeded: "Done",
  failed: "Failed",
  skipped: "Skipped",
  cancelled: "Cancelled",
};

const STEP_TONE: Record<StepState, string> = {
  pending: "border-border text-muted-foreground",
  ready: "border-border-strong text-foreground",
  running: "border-border-strong text-foreground",
  waiting_for_user: "border-border-strong bg-surface text-foreground",
  succeeded: "border-border bg-surface text-muted-foreground",
  failed: "border-destructive/40 bg-destructive/10 text-destructive",
  skipped: "border-border text-muted-foreground",
  cancelled: "border-border text-muted-foreground",
};

export type TaskPlanHandlers = {
  onRunStep: (stepId: string) => void;
  onRetryStep: (stepId: string) => void;
  onRequestContact: (recipient: string) => void;
  onDecideApproval: (
    approvalId: string,
    decision: "approved" | "declined",
  ) => void;
  onAttemptContact: (approvalId: string) => void;
  onEditGoal: (goal: string) => void;
};

export function TaskPlan({
  task,
  handlers,
}: {
  task: AssistantTask;
  handlers: TaskPlanHandlers;
}) {
  const providers = listedProviders(task);
  const contactStep = task.steps.find((s) => s.kind === "contact");
  const canRequestContact =
    contactStep?.state === "ready" || contactStep?.state === "waiting_for_user";

  return (
    <section
      aria-label="Task plan"
      className="rise-in overflow-hidden rounded-xl border border-border bg-card shadow-panel"
    >
      <header className="flex flex-wrap items-center gap-3 border-b border-border px-5 py-3.5">
        <span className="grid h-7 w-7 place-items-center rounded-full border border-border-strong bg-card">
          <AiMark
            working={task.state === "searching" || task.state === "comparing"}
            size={13}
          />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Plan
          </p>
          <p className="truncate text-sm font-medium text-foreground">
            {task.goal}
          </p>
        </div>
        <span className="rounded-full border border-border bg-surface px-2.5 py-1 text-[11px] font-medium text-foreground">
          {TASK_STATE_LABEL[task.state]}
        </span>
      </header>

      <div className="space-y-5 px-5 py-5">
        <GoalEditor goal={task.goal} onSave={handlers.onEditGoal} />

        {task.assumptions.length > 0 ? (
          <div>
            <SectionLabel>Assumptions (not yet confirmed)</SectionLabel>
            <ul className="mt-2 space-y-1.5">
              {task.assumptions.map((a) => (
                <li key={a.id} className="text-sm text-muted-foreground">
                  {a.text}
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div>
          <SectionLabel>Steps</SectionLabel>
          <ol className="mt-2 space-y-2">
            {task.steps.map((step, index) => (
              <StepRow
                key={step.id}
                index={index + 1}
                step={step}
                dependencyTitles={step.dependsOn.map(
                  (id) => task.steps.find((s) => s.id === id)?.title ?? "",
                )}
                onRun={() => handlers.onRunStep(step.id)}
                onRetry={() => handlers.onRetryStep(step.id)}
              />
            ))}
          </ol>
        </div>

        {task.blocker ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3"
          >
            <p className="text-sm font-medium text-destructive">Blocked</p>
            <p className="mt-1 text-sm text-foreground">{task.blocker}</p>
          </div>
        ) : null}

        {providers.length > 0 ? (
          <div>
            <SectionLabel>Sample listings</SectionLabel>
            <p className="mt-1 text-xs text-muted-foreground">
              These are sample records. Availability, quotes and reviews are not
              confirmed.
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {providers.map((p) => {
                const requested = task.approvals.find(
                  (a) =>
                    a.recipient === p.name &&
                    (a.status === "requested" || a.status === "approved"),
                );
                return (
                  <article
                    key={p.id}
                    className="rounded-lg border border-border bg-surface p-3.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-foreground">
                          {p.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.service}
                        </p>
                      </div>
                      <span className="shrink-0 rounded-full border border-border px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        Sample
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      {p.reason}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Listed as: {p.availability} · {p.distance} · {p.rating} (
                      {p.reviews} reviews)
                    </p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Not checked: live availability, quote, current reviews.
                    </p>
                    <div className="mt-3">
                      {requested ? (
                        <p className="text-xs text-foreground">
                          Awaiting your decision below.
                        </p>
                      ) : (
                        <Button
                          variant="secondary"
                          disabled={!canRequestContact}
                          onClick={() => handlers.onRequestContact(p.name)}
                        >
                          Ask to contact {p.name.split(" ")[0]}
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        ) : null}

        {task.approvals.filter(
          (a) => a.status === "requested" || a.status === "approved",
        ).length > 0 ? (
          <div className="space-y-3">
            <SectionLabel>Needs your approval</SectionLabel>
            {task.approvals
              .filter((a) => a.status === "requested")
              .map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-border-strong bg-surface p-4"
                >
                  <p className="text-sm font-medium text-foreground">
                    {a.description}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Only this one contact is approved. Nothing else will be
                    sent.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      onClick={() =>
                        handlers.onDecideApproval(a.id, "approved")
                      }
                    >
                      Approve for {a.recipient}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        handlers.onDecideApproval(a.id, "declined")
                      }
                    >
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            {task.approvals
              .filter((a) => a.status === "approved")
              .map((a) => (
                <div
                  key={a.id}
                  className="rounded-lg border border-border bg-surface p-4"
                >
                  <p className="text-sm text-foreground">
                    Approved: {a.description}
                  </p>
                  <div className="mt-3">
                    <Button
                      variant="secondary"
                      onClick={() => handlers.onAttemptContact(a.id)}
                    >
                      Send request to {a.recipient}
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        ) : null}
      </div>

      <footer className="border-t border-border bg-surface px-5 py-3 text-xs text-muted-foreground">
        {nextAction(task)}
      </footer>
    </section>
  );
}

function StepRow({
  index,
  step,
  dependencyTitles,
  onRun,
  onRetry,
}: {
  index: number;
  step: PlanStep;
  dependencyTitles: string[];
  onRun: () => void;
  onRetry: () => void;
}) {
  const runnable = step.kind === "search" || step.kind === "compare";
  return (
    <li className="flex flex-wrap items-start gap-3 rounded-lg border border-border bg-card px-3.5 py-3">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border border-border text-[11px] font-medium text-muted-foreground">
        {index}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-foreground">{step.title}</p>
        {dependencyTitles.length > 0 ? (
          <p className="mt-0.5 text-xs text-muted-foreground">
            After: {dependencyTitles.join(", ")}
          </p>
        ) : null}
        {step.error ? (
          <p className="mt-1 text-xs text-destructive">{step.error}</p>
        ) : null}
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-full border px-2 py-0.5 text-[11px]",
            STEP_TONE[step.state],
          )}
        >
          {STEP_LABEL[step.state]}
        </span>
        {runnable && step.state === "ready" ? (
          <Button variant="secondary" onClick={onRun}>
            Run
          </Button>
        ) : null}
        {step.state === "failed" ? (
          <Button variant="secondary" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </div>
    </li>
  );
}

function GoalEditor({
  goal,
  onSave,
}: {
  goal: string;
  onSave: (goal: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goal);

  if (!editing) {
    return (
      <div className="flex items-center justify-between gap-3">
        <div>
          <SectionLabel>Goal</SectionLabel>
          <p className="mt-1 text-sm text-foreground">{goal}</p>
        </div>
        <Button
          variant="ghost"
          onClick={() => {
            setDraft(goal);
            setEditing(true);
          }}
        >
          Edit goal
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        const value = draft.trim();
        if (!value) return;
        onSave(value);
        setEditing(false);
      }}
    >
      <SectionLabel>Edit goal</SectionLabel>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={2}
        className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
      />
      <div className="flex gap-2">
        <Button type="submit" disabled={!draft.trim()}>
          Replan
        </Button>
        <Button variant="ghost" onClick={() => setEditing(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}
