import { useSyncExternalStore } from "react";

export type Role = "customer" | "provider";

export type OnboardingState = {
  authMethod: string | null;
  role: Role | null;
  customer: { name: string; location: string };
  provider: {
    name: string;
    category: string;
    skills: string;
    area: string;
    experience: string;
    availability: string;
    description: string;
  };
};

const initialState: OnboardingState = {
  authMethod: null,
  role: null,
  customer: { name: "", location: "" },
  provider: {
    name: "",
    category: "",
    skills: "",
    area: "",
    experience: "",
    availability: "",
    description: "",
  },
};

let state: OnboardingState = initialState;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const onboarding = {
  get: () => state,
  set(patch: Partial<OnboardingState>) {
    state = { ...state, ...patch };
    emit();
  },
  setCustomer(patch: Partial<OnboardingState["customer"]>) {
    state = { ...state, customer: { ...state.customer, ...patch } };
    emit();
  },
  setProvider(patch: Partial<OnboardingState["provider"]>) {
    state = { ...state, provider: { ...state.provider, ...patch } };
    emit();
  },
  reset() {
    state = initialState;
    emit();
  },
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export function useOnboarding(): OnboardingState {
  return useSyncExternalStore(
    onboarding.subscribe,
    onboarding.get,
    () => initialState,
  );
}
