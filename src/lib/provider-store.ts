import { useSyncExternalStore } from "react";
import { jobs as seedJobs, type Job, type JobStatus } from "@/lib/provider-data";

export type Availability = "available" | "busy" | "offline";

export type PermissionKey =
  | "analyze"
  | "organizeSchedule"
  | "draftMessages"
  | "suggestOpportunities"
  | "draftPosts"
  | "acceptJobs"
  | "sendMessages"
  | "changeAppointments"
  | "publishContent";

type State = {
  plan: "free" | "pro";
  availability: Availability;
  jobs: Job[];
  aiMode: "assist" | "hands-off";
  permissions: Record<PermissionKey, boolean>;
};

const initial: State = {
  plan: "pro",
  availability: "available",
  jobs: seedJobs,
  aiMode: "assist",
  permissions: {
    analyze: true,
    organizeSchedule: true,
    draftMessages: true,
    suggestOpportunities: true,
    draftPosts: true,
    acceptJobs: false,
    sendMessages: false,
    changeAppointments: false,
    publishContent: false,
  },
};

let state = initial;
const listeners = new Set<() => void>();
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  for (const l of listeners) l();
};

export const providerStore = {
  setPlan: (plan: State["plan"]) => set({ plan }),
  setAvailability: (availability: Availability) => set({ availability }),
  setAiMode: (aiMode: State["aiMode"]) => set({ aiMode }),
  togglePermission: (key: PermissionKey) =>
    set({ permissions: { ...state.permissions, [key]: !state.permissions[key] } }),
  moveJob: (id: string, status: JobStatus) =>
    set({ jobs: state.jobs.map((j) => (j.id === id ? { ...j, status } : j)) }),
  updateJob: (id: string, patch: Partial<Job>) =>
    set({ jobs: state.jobs.map((j) => (j.id === id ? { ...j, ...patch } : j)) }),
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useProvider() {
  return useSyncExternalStore(
    providerStore.subscribe,
    () => state,
    () => initial,
  );
}
