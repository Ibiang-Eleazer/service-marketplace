/** Mock data for the authenticated customer home. No real businesses. */

export type HomeProvider = {
  id: string;
  name: string;
  initials: string;
  service: string;
  distance: string;
  availability: string;
  rating: number;
  reviews: number;
  description: string;
  reason: string;
};

export type Intent = {
  /** keywords that route a free-text request to this intent */
  match: string[];
  service: string;
  summary: string;
  taskTitle: string;
  providers: HomeProvider[];
};

const plumbing: HomeProvider[] = [
  {
    id: "alex-home-repairs",
    name: "Alex Home Repairs",
    initials: "AH",
    service: "Plumbing & general repairs",
    distance: "1.8 km away",
    availability: "Available today",
    rating: 4.9,
    reviews: 213,
    description:
      "Small independent shop. Handles leaks, fittings and pipe work, usually same day.",
    reason: "Matches your recent plumbing request",
  },
  {
    id: "northside-plumbing",
    name: "Northside Plumbing Co.",
    initials: "NP",
    service: "Residential plumbing",
    distance: "2.8 km away",
    availability: "Tomorrow morning",
    rating: 4.7,
    reviews: 486,
    description:
      "Licensed team of six. Strong on diagnostics and under-sink repairs.",
    reason: "Frequently chosen for home repairs",
  },
  {
    id: "mara-fittings",
    name: "Mara Fittings",
    initials: "MF",
    service: "Kitchen & bathroom plumbing",
    distance: "3.4 km away",
    availability: "Available this evening",
    rating: 4.8,
    reviews: 97,
    description:
      "Specialises in kitchen sinks and taps. Flat call-out fee, no weekend surcharge.",
    reason: "Highly rated for kitchen work nearby",
  },
];

const cooling: HomeProvider[] = [
  {
    id: "coolform-technicians",
    name: "Coolform Technicians",
    initials: "CT",
    service: "Air conditioning repair",
    distance: "2.1 km away",
    availability: "Available today",
    rating: 4.8,
    reviews: 168,
    description: "Servicing, gas top-ups and compressor diagnostics for home units.",
    reason: "Matches your cooling request",
  },
  {
    id: "brightair-service",
    name: "Brightair Service",
    initials: "BA",
    service: "HVAC maintenance",
    distance: "4.0 km away",
    availability: "Tomorrow, 09:00",
    rating: 4.6,
    reviews: 302,
    description: "Maintenance contracts and one-off callouts for split systems.",
    reason: "Frequently chosen for appliance issues",
  },
  {
    id: "vento-cooling",
    name: "Vento Cooling",
    initials: "VC",
    service: "AC installation & repair",
    distance: "5.2 km away",
    availability: "Available this week",
    rating: 4.7,
    reviews: 74,
    description: "Independent technician, detailed written quotes before any work.",
    reason: "Good value for scheduled repairs",
  },
];

const electrical: HomeProvider[] = [
  {
    id: "lumen-electrical",
    name: "Lumen Electrical",
    initials: "LE",
    service: "Domestic electrical work",
    distance: "1.4 km away",
    availability: "Available today",
    rating: 4.9,
    reviews: 141,
    description: "Certified electrician. Faults, lighting and socket replacement.",
    reason: "Matches your electrical request",
  },
  {
    id: "circuit-works",
    name: "Circuit Works",
    initials: "CW",
    service: "Electrical repair & rewiring",
    distance: "3.0 km away",
    availability: "Tomorrow afternoon",
    rating: 4.7,
    reviews: 259,
    description: "Team of four, covers inspections and full rewiring jobs.",
    reason: "Frequently chosen for home repairs",
  },
  {
    id: "nia-sparks",
    name: "Nia Sparks",
    initials: "NS",
    service: "Lighting & small electrical",
    distance: "3.9 km away",
    availability: "Available this evening",
    rating: 4.8,
    reviews: 63,
    description: "Small jobs only. Quick response for flickering lights and switches.",
    reason: "Quick response nearby",
  },
];

const cleaning: HomeProvider[] = [
  {
    id: "still-house-cleaning",
    name: "Still House Cleaning",
    initials: "SH",
    service: "Deep & regular cleaning",
    distance: "2.4 km away",
    availability: "Available this week",
    rating: 4.9,
    reviews: 188,
    description: "Two-person teams, supplies included, fixed price per room.",
    reason: "Matches your cleaning request",
  },
  {
    id: "orderly-co",
    name: "Orderly Co.",
    initials: "OC",
    service: "Home cleaning",
    distance: "3.6 km away",
    availability: "Tomorrow",
    rating: 4.6,
    reviews: 421,
    description: "Recurring cleaning plans with the same cleaner each visit.",
    reason: "Frequently chosen for apartments",
  },
  {
    id: "tunde-clean",
    name: "Tunde Cleaning Service",
    initials: "TC",
    service: "Move-out & deep cleaning",
    distance: "4.5 km away",
    availability: "Available Saturday",
    rating: 4.8,
    reviews: 92,
    description: "Focused on end-of-tenancy work and post-renovation clean-ups.",
    reason: "Well reviewed for deep cleans",
  },
];

export const intents: Intent[] = [
  {
    match: ["sink", "leak", "plumb", "pipe", "tap", "drain", "toilet", "water"],
    service: "Plumbing",
    summary:
      "It sounds like you need a plumber to inspect and repair a leaking sink.",
    taskTitle: "Leaking sink",
    providers: plumbing,
  },
  {
    match: ["ac", "air con", "cooling", "cool", "fridge", "heat", "hvac"],
    service: "Appliance repair",
    summary:
      "It sounds like you need a technician to inspect a cooling unit that isn't performing.",
    taskTitle: "Cooling not working",
    providers: cooling,
  },
  {
    match: ["light", "electric", "socket", "power", "wiring", "switch", "bulb"],
    service: "Electrical",
    summary:
      "It sounds like you need a certified electrician to trace a fault and repair it.",
    taskTitle: "Electrical fault",
    providers: electrical,
  },
  {
    match: ["clean", "tidy", "laundry", "dust", "apartment"],
    service: "Cleaning",
    summary:
      "It sounds like you need a cleaning team for a scheduled visit at your place.",
    taskTitle: "Home cleaning",
    providers: cleaning,
  },
];

const fallback: Intent = {
  match: [],
  service: "General help",
  summary:
    "I'll treat this as a general home task and look for people nearby who handle work like this.",
  taskTitle: "New request",
  providers: plumbing,
};

export function resolveIntent(input: string): Intent {
  const text = input.toLowerCase();
  return intents.find((i) => i.match.some((k) => text.includes(k))) ?? fallback;
}

export function titleFor(input: string, intent: Intent): string {
  const trimmed = input.trim();
  if (!trimmed) return intent.taskTitle;
  return trimmed.length > 42 ? `${trimmed.slice(0, 42).trimEnd()}…` : trimmed;
}

export const recommendedNearby: HomeProvider[] = [
  plumbing[0]!,
  cleaning[0]!,
  electrical[1]!,
];

export type ActivityItem = {
  id: string;
  title: string;
  detail: string;
  when: string;
};

export const recentActivity: ActivityItem[] = [
  {
    id: "a1",
    title: "Plumber search completed",
    detail: "3 providers compared · 1 recommended",
    when: "Yesterday",
  },
  {
    id: "a2",
    title: "Cleaner contacted",
    detail: "Still House Cleaning · awaiting reply",
    when: "3 days ago",
  },
  {
    id: "a3",
    title: "Electrical repair request completed",
    detail: "Lumen Electrical · marked as done",
    when: "Last week",
  },
];

export const quickActions = [
  { label: "Request a service", hint: "Start from the assistant" },
  { label: "View requests", hint: "Everything in progress" },
  { label: "Messages", hint: "Replies from providers" },
  { label: "Saved providers", hint: "People you kept" },
];

export const starterPrompts = [
  "My sink is leaking",
  "The AC isn't cooling",
  "Kitchen lights keep flickering",
  "I need a deep clean this weekend",
];
