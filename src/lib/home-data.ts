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
  /** Years of experience for display */
  experience: string;
  /** Specific skills relevant to the matched intent */
  skills: string[];
};

export type Intent = {
  /** keywords that route a free-text request to this intent */
  match: string[];
  service: string;
  /** What the assistant calls this trade in its reasoning */
  tradeLabel: string;
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
    reason: "Specialises in emergency leak repairs and can come out today.",
    experience: "12 yrs",
    skills: ["Leak repair", "Pipe fitting", "Emergency callouts"],
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
    reason: "Large team with strong diagnostics for kitchen sink issues.",
    experience: "15 yrs",
    skills: ["Diagnostics", "Under-sink repairs", "Kitchen plumbing"],
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
    reason: "Kitchen sink specialist with a flat call-out fee.",
    experience: "8 yrs",
    skills: ["Kitchen sinks", "Tap replacement", "Fittings"],
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
    reason: "Handles cooling diagnostics and can come out today.",
    experience: "10 yrs",
    skills: ["AC diagnostics", "Gas top-up", "Compressor repair"],
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
    reason: "Experienced with split systems and scheduled callouts.",
    experience: "14 yrs",
    skills: ["Split systems", "HVAC maintenance", "Scheduled service"],
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
    reason: "Good value option with transparent upfront quotes.",
    experience: "6 yrs",
    skills: ["AC install", "Repairs", "Written quotes"],
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
    reason: "Certified for fault-finding and available today.",
    experience: "11 yrs",
    skills: ["Fault-finding", "Lighting", "Socket replacement"],
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
    reason: "Strong reputation for electrical fault repairs.",
    experience: "16 yrs",
    skills: ["Inspections", "Rewiring", "Fault repair"],
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
    reason: "Quick response for lighting issues and small electrical jobs.",
    experience: "7 yrs",
    skills: ["Lighting", "Switches", "Quick response"],
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
    reason: "Deep-clean specialist with a fixed price and supplies included.",
    experience: "9 yrs",
    skills: ["Deep cleaning", "Move-out", "Supplies included"],
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
    reason: "Reliable for apartment cleaning with a consistent cleaner.",
    experience: "12 yrs",
    skills: ["Apartment cleaning", "Recurring plans", "Regular cleaning"],
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
    reason: "Well-reviewed for weekend deep cleans.",
    experience: "5 yrs",
    skills: ["Move-out", "Post-renovation", "Weekend availability"],
  },
];

const assembly: HomeProvider[] = [
  {
    id: "fixit-jon",
    name: "Jon Fixit",
    initials: "JF",
    service: "Furniture assembly & handyman",
    distance: "1.6 km away",
    availability: "Available today",
    rating: 4.8,
    reviews: 154,
    description: "Flat-pack assembly, shelving, and general handyman work. Quick turnaround.",
    reason: "Specialises in furniture assembly and can come today.",
    experience: "9 yrs",
    skills: ["Flat-pack assembly", "Shelving", "Handyman"],
  },
  {
    id: "buildright",
    name: "BuildRight Services",
    initials: "BR",
    service: "Assembly & installation",
    distance: "3.1 km away",
    availability: "Tomorrow",
    rating: 4.6,
    reviews: 208,
    description: "Two-person team for larger furniture and appliance installation.",
    reason: "Good for larger items needing a two-person team.",
    experience: "11 yrs",
    skills: ["Furniture assembly", "Appliance install", "Two-person team"],
  },
  {
    id: "maria-handy",
    name: "Maria Handy",
    initials: "MH",
    service: "Handyman & assembly",
    distance: "4.2 km away",
    availability: "This weekend",
    rating: 4.7,
    reviews: 89,
    description: "Independent handyman. Detailed quotes, tidy work, flexible scheduling.",
    reason: "Flexible scheduling with tidy, well-reviewed work.",
    experience: "6 yrs",
    skills: ["Assembly", "Repairs", "Flexible scheduling"],
  },
];

export const intents: Intent[] = [
  {
    match: ["sink", "leak", "plumb", "pipe", "tap", "drain", "toilet", "water"],
    service: "Plumbing",
    tradeLabel: "plumber",
    summary:
      "It sounds like you need a plumber to inspect and repair a leaking sink.",
    taskTitle: "Leaking sink",
    providers: plumbing,
  },
  {
    match: ["ac", "air con", "cooling", "cool", "fridge", "heat", "hvac", "air conditioning"],
    service: "Appliance repair",
    tradeLabel: "AC technician",
    summary:
      "It sounds like you need a technician to inspect a cooling unit that isn't performing.",
    taskTitle: "Cooling not working",
    providers: cooling,
  },
  {
    match: ["light", "electric", "socket", "power", "wiring", "switch", "bulb", "electrical", "flicker"],
    service: "Electrical",
    tradeLabel: "electrician",
    summary:
      "It sounds like you need a certified electrician to trace a fault and repair it.",
    taskTitle: "Electrical fault",
    providers: electrical,
  },
  {
    match: ["clean", "tidy", "laundry", "dust", "apartment", "mop", "scrub"],
    service: "Cleaning",
    tradeLabel: "cleaning service",
    summary:
      "It sounds like you need a cleaning team for a scheduled visit at your place.",
    taskTitle: "Home cleaning",
    providers: cleaning,
  },
  {
    match: ["assemble", "furniture", "flat pack", "ikea", "shelf", "shelving", "put together", "build furniture"],
    service: "Furniture assembly",
    tradeLabel: "handyman",
    summary:
      "It sounds like you need someone to assemble furniture at your place.",
    taskTitle: "Furniture assembly",
    providers: assembly,
  },
];

const fallback: Intent = {
  match: [],
  service: "General help",
  tradeLabel: "local professional",
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
  "My kitchen sink is leaking",
  "I need someone to clean my apartment",
  "My AC isn't cooling",
  "I need an electrician",
  "I need someone to assemble some furniture",
];
