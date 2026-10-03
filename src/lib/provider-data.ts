export const provider = {
  firstName: "Daniel",
  name: "Daniel Okafor",
  business: "Okafor Joinery & Interiors",
  title: "Master carpenter · Custom interiors",
  initials: "DO",
  location: "Lekki, Lagos",
  serviceRadiusKm: 15,
  yearsExperience: 11,
  verified: true,
  rating: 4.9,
  reviewCount: 214,
  jobsCompleted: 386,
  responseTime: "~12 min",
  bio: "I design and build custom furniture, wardrobes, and kitchens for homes across Lagos. Every piece is measured, drawn, and finished in my Lekki workshop — no flat-pack shortcuts. I care about clean joinery, honest materials, and leaving your space tidier than I found it.",
  services: [
    { name: "Custom wardrobes", from: 450000, duration: "2–3 days" },
    { name: "Kitchen installation", from: 1200000, duration: "4–6 days" },
    { name: "Bespoke furniture", from: 280000, duration: "1–2 weeks" },
    { name: "Furniture repair & refinishing", from: 45000, duration: "Same day" },
    { name: "Interior fit-out consultation", from: 25000, duration: "1 hour" },
  ],
};

export function naira(value: number, compact = false) {
  if (compact && value >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (compact && value >= 1_000) return `₦${Math.round(value / 1_000)}k`;
  return `₦${value.toLocaleString("en-NG")}`;
}

export type JobStatus = "new" | "upcoming" | "in_progress" | "completed" | "cancelled";

export type Job = {
  id: string;
  status: JobStatus;
  service: string;
  customer: { name: string; initials: string; jobsBooked: number; memberSince: string; rating?: number };
  description: string;
  area: string;
  distanceKm: number;
  date: string;
  time: string;
  duration: string;
  earnings: number;
  urgent?: boolean;
  note?: string;
  review?: { rating: number; text: string };
};

export const jobs: Job[] = [
  {
    id: "J-2041",
    status: "new",
    service: "Custom wardrobe installation",
    customer: { name: "Amaka Nwosu", initials: "AN", jobsBooked: 6, memberSince: "2023", rating: 4.8 },
    description:
      "Floor-to-ceiling wardrobe for the master bedroom, 2.8 m wide. Sliding doors preferred, with a section for long dresses and a few drawers. Walls are plastered and painted.",
    area: "Ikate, Lekki",
    distanceKm: 4.2,
    date: "Tomorrow",
    time: "10:00 AM",
    duration: "2 days",
    earnings: 520000,
    urgent: true,
  },
  {
    id: "J-2042",
    status: "new",
    service: "Dining table refinishing",
    customer: { name: "Tunde Bakare", initials: "TB", jobsBooked: 2, memberSince: "2024", rating: 5 },
    description:
      "Mahogany dining table with water rings and scratches. Want it sanded back and refinished in a satin, darker stain.",
    area: "Ikoyi",
    distanceKm: 9.6,
    date: "Fri, 16 Oct",
    time: "1:00 PM",
    duration: "5 hours",
    earnings: 85000,
  },
  {
    id: "J-2043",
    status: "new",
    service: "Kitchen cabinet consultation",
    customer: { name: "Grace Eze", initials: "GE", jobsBooked: 0, memberSince: "2026" },
    description: "New apartment, considering full kitchen cabinetry. Would like measurements and a quote.",
    area: "Ajah",
    distanceKm: 12.1,
    date: "Sat, 17 Oct",
    time: "11:00 AM",
    duration: "1 hour",
    earnings: 25000,
    note: "First booking on the platform",
  },
  {
    id: "J-2031",
    status: "in_progress",
    service: "Kitchen installation",
    customer: { name: "Folake Adeyemi", initials: "FA", jobsBooked: 4, memberSince: "2022", rating: 4.9 },
    description: "Full kitchen fit-out — oak upper cabinets, charcoal base units, quartz worktop fitting by partner.",
    area: "Lekki Phase 1",
    distanceKm: 2.3,
    date: "Today",
    time: "10:00 AM",
    duration: "Day 3 of 5",
    earnings: 1450000,
  },
  {
    id: "J-2036",
    status: "upcoming",
    service: "Electrical inspection (partner)",
    customer: { name: "Chidi Okonkwo", initials: "CO", jobsBooked: 3, memberSince: "2023", rating: 4.7 },
    description: "Pre-installation check before wardrobe lighting is fitted. Partner electrician attending with you.",
    area: "Ikeja GRA",
    distanceKm: 18.4,
    date: "Today",
    time: "3:30 PM",
    duration: "1.5 hours",
    earnings: 40000,
  },
  {
    id: "J-2038",
    status: "upcoming",
    service: "Bespoke bookshelf",
    customer: { name: "Ibrahim Sule", initials: "IS", jobsBooked: 1, memberSince: "2025", rating: 5 },
    description: "Walnut wall-to-wall bookshelf with integrated reading bench. Final measurements done.",
    area: "Victoria Island",
    distanceKm: 7.8,
    date: "Thu, 15 Oct",
    time: "9:00 AM",
    duration: "2 days",
    earnings: 680000,
  },
  {
    id: "J-2039",
    status: "upcoming",
    service: "Wardrobe door replacement",
    customer: { name: "Ngozi Obi", initials: "NO", jobsBooked: 2, memberSince: "2024" },
    description: "Replace two damaged hinged doors with matching sliding doors.",
    area: "Lekki Phase 1",
    distanceKm: 3.1,
    date: "Sat, 17 Oct",
    time: "2:00 PM",
    duration: "4 hours",
    earnings: 120000,
    note: "Customer requested this time — awaiting your confirmation",
  },
  {
    id: "J-2022",
    status: "completed",
    service: "Walnut dining table",
    customer: { name: "Kemi Lawal", initials: "KL", jobsBooked: 5, memberSince: "2022" },
    description: "Live-edge walnut table, 8 seater, black steel legs.",
    area: "Ikoyi",
    distanceKm: 8.9,
    date: "Mon, 5 Oct",
    time: "9:00 AM",
    duration: "2 weeks",
    earnings: 940000,
    review: { rating: 5, text: "Daniel's attention to detail is unreal. The table is the centrepiece of our home now." },
  },
  {
    id: "J-2019",
    status: "completed",
    service: "Custom wardrobe installation",
    customer: { name: "Bola Ahmed", initials: "BA", jobsBooked: 1, memberSince: "2025" },
    description: "Two-door wardrobe for guest room with mirror panel.",
    area: "Ajah",
    distanceKm: 11.2,
    date: "Wed, 30 Sep",
    time: "10:00 AM",
    duration: "2 days",
    earnings: 410000,
    review: { rating: 5, text: "On time, clean, and the finish is perfect. Would book again." },
  },
  {
    id: "J-2015",
    status: "cancelled",
    service: "TV wall unit",
    customer: { name: "Segun Martins", initials: "SM", jobsBooked: 1, memberSince: "2025" },
    description: "Floating TV unit with hidden cable channel.",
    area: "Surulere",
    distanceKm: 21.5,
    date: "Fri, 25 Sep",
    time: "11:00 AM",
    duration: "1 day",
    earnings: 220000,
    note: "Cancelled by customer — moving apartments",
  },
];

export type Post = {
  id: string;
  author: { name: string; title: string; initials: string; verified?: boolean };
  category: string;
  image: string;
  imageAlt: string;
  caption: string;
  time: string;
  reactions: number;
  comments: number;
  shares: number;
  isOwn?: boolean;
};

export const feed: Post[] = [
  {
    id: "p1",
    author: { name: "Daniel Okafor", title: "Master carpenter", initials: "DO", verified: true },
    category: "Custom wardrobes",
    image: "/images/work-wardrobe.png",
    imageAlt: "Built-in walnut and white wardrobe with LED lighting",
    caption:
      "Finished this floor-to-ceiling wardrobe in Ikoyi last week. Walnut veneer, soft-close sliding doors, and warm LED strips that switch on as the doors open. Two days on site, zero mess left behind.",
    time: "2 days ago",
    reactions: 248,
    comments: 31,
    shares: 12,
    isOwn: true,
  },
  {
    id: "p2",
    author: { name: "Zainab Bello", title: "Fashion designer", initials: "ZB", verified: true },
    category: "Fashion design",
    image: "/images/work-dress.png",
    imageAlt: "Emerald structured evening dress on a dress form",
    caption:
      "Structured emerald gown for a client's 40th. Hand-finished seams and a hidden ankara lining — she wanted something only she would know about.",
    time: "5 h ago",
    reactions: 512,
    comments: 64,
    shares: 40,
  },
  {
    id: "p3",
    author: { name: "Emeka Udo", title: "Mechanical engineer", initials: "EU" },
    category: "Engineering · Prototyping",
    image: "/images/work-prototype.png",
    imageAlt: "Solar water pump prototype on a workbench",
    caption:
      "Third iteration of a compact solar pump for small farms. 40% less draw than v2. Looking for two farms in Ogun to pilot it next month.",
    time: "Yesterday",
    reactions: 389,
    comments: 47,
    shares: 58,
  },
  {
    id: "p4",
    author: { name: "Musa Garba", title: "Classic car mechanic", initials: "MG", verified: true },
    category: "Auto restoration",
    image: "/images/work-restoration.png",
    imageAlt: "Restored cream classic sedan in a garage",
    caption: "Eight months, one very patient owner. This 1986 W124 is back on the road with its original engine rebuilt.",
    time: "3 days ago",
    reactions: 731,
    comments: 92,
    shares: 76,
  },
];

export const portfolio = [
  { image: "/images/work-wardrobe.png", title: "Ikoyi master wardrobe", category: "Wardrobes" },
  { image: "/images/work-kitchen.png", title: "Lekki oak kitchen", category: "Kitchens" },
  { image: "/images/work-table.png", title: "Live-edge walnut table", category: "Furniture" },
];

export const opportunities = [
  { id: "o1", service: "Built-in shelving", area: "Lekki Phase 1", distanceKm: 1.8, range: [180000, 260000], timing: "This weekend", category: "Bespoke furniture" },
  { id: "o2", service: "Kitchen cabinet refacing", area: "Osapa London", distanceKm: 5.4, range: [600000, 900000], timing: "Next 2 weeks", category: "Kitchens" },
  { id: "o3", service: "Wardrobe repair", area: "Chevron", distanceKm: 6.9, range: [40000, 70000], timing: "ASAP", category: "Repairs" },
];

export type Conversation = {
  id: string;
  channel: "customers" | "platform" | "support";
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  jobId?: string;
  messages: { from: "me" | "them"; text: string; time: string }[];
};

export const conversations: Conversation[] = [
  {
    id: "c1",
    channel: "customers",
    name: "Amaka Nwosu",
    initials: "AN",
    preview: "Are you available earlier? Maybe 8am?",
    time: "9 min",
    unread: 2,
    jobId: "J-2041",
    messages: [
      { from: "them", text: "Hi Daniel, I just sent a request for the wardrobe. I loved your Ikoyi post!", time: "8:41 AM" },
      { from: "them", text: "Are you available earlier? Maybe 8am? I have to leave for work by 11.", time: "8:52 AM" },
    ],
  },
  {
    id: "c2",
    channel: "customers",
    name: "Folake Adeyemi",
    initials: "FA",
    preview: "The quartz guys confirmed for Thursday.",
    time: "1 h",
    unread: 0,
    jobId: "J-2031",
    messages: [
      { from: "me", text: "Base units are all level and fixed. Uppers going in today.", time: "Yesterday" },
      { from: "them", text: "Looks amazing already! The quartz guys confirmed for Thursday.", time: "7:58 AM" },
    ],
  },
  {
    id: "c3",
    channel: "customers",
    name: "Ngozi Obi",
    initials: "NO",
    preview: "Would Saturday 2pm work for you?",
    time: "3 h",
    unread: 1,
    jobId: "J-2039",
    messages: [{ from: "them", text: "Would Saturday 2pm work for you? I'll be home all afternoon.", time: "6:12 AM" }],
  },
  {
    id: "c4",
    channel: "platform",
    name: "Brand Payouts",
    initials: "B",
    preview: "₦940,000 for J-2022 is now available.",
    time: "Yesterday",
    unread: 0,
    messages: [{ from: "them", text: "Your payout of ₦940,000 for J-2022 (Walnut dining table) is now available to withdraw.", time: "Yesterday" }],
  },
  {
    id: "c5",
    channel: "support",
    name: "Support · Ticket #4471",
    initials: "S",
    preview: "We've updated your service radius.",
    time: "Mon",
    unread: 0,
    messages: [
      { from: "me", text: "Can you extend my service area to include Ikeja?", time: "Mon" },
      { from: "them", text: "Done — we've updated your service radius. Ikeja requests will now reach you.", time: "Mon" },
    ],
  },
];

export const earningsSeries = [
  { label: "Mon", value: 120000 },
  { label: "Tue", value: 85000 },
  { label: "Wed", value: 410000 },
  { label: "Thu", value: 60000 },
  { label: "Fri", value: 290000 },
  { label: "Sat", value: 175000 },
  { label: "Sun", value: 0 },
];

export const monthlyRevenue = [
  { month: "May", revenue: 2.1, requests: 31, views: 1840 },
  { month: "Jun", revenue: 2.6, requests: 38, views: 2210 },
  { month: "Jul", revenue: 2.4, requests: 35, views: 2050 },
  { month: "Aug", revenue: 3.1, requests: 42, views: 2690 },
  { month: "Sep", revenue: 3.4, requests: 47, views: 3120 },
  { month: "Oct", revenue: 3.9, requests: 55, views: 3990 },
];

export const payouts = [
  { id: "PO-889", job: "Walnut dining table", date: "9 Oct", amount: 940000, status: "Paid" },
  { id: "PO-884", job: "Custom wardrobe — Ajah", date: "2 Oct", amount: 410000, status: "Paid" },
  { id: "PO-880", job: "Kitchen installation — deposit", date: "28 Sep", amount: 725000, status: "Paid" },
  { id: "PO-892", job: "Kitchen installation — balance", date: "Expected 20 Oct", amount: 725000, status: "Pending" },
  { id: "PO-893", job: "Electrical inspection", date: "Expected 14 Oct", amount: 40000, status: "Pending" },
];

export type DiscoverProvider = {
  id: string;
  name: string;
  initials: string;
  profession: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  area: string;
  image: string;
  imageAlt: string;
  verified?: boolean;
};

export const discoverProviders: DiscoverProvider[] = [
  {
    id: "d1",
    name: "Zainab Bello",
    initials: "ZB",
    profession: "Fashion designer",
    specialty: "Bespoke evening wear",
    rating: 4.8,
    reviewCount: 156,
    area: "Surulere, Lagos",
    image: "/images/work-dress.png",
    imageAlt: "Emerald structured evening dress on a dress form",
    verified: true,
  },
  {
    id: "d2",
    name: "Emeka Udo",
    initials: "EU",
    profession: "Mechanical engineer",
    specialty: "Solar pump prototyping",
    rating: 4.6,
    reviewCount: 42,
    area: "Ogun",
    image: "/images/work-prototype.png",
    imageAlt: "Solar water pump prototype on a workbench",
  },
  {
    id: "d3",
    name: "Musa Garba",
    initials: "MG",
    profession: "Classic car mechanic",
    specialty: "Engine rebuilds & restoration",
    rating: 4.9,
    reviewCount: 98,
    area: "Kano",
    image: "/images/work-restoration.png",
    imageAlt: "Restored cream classic sedan in a garage",
    verified: true,
  },
  {
    id: "d4",
    name: "Grace Adeoye",
    initials: "GA",
    profession: "Interior designer",
    specialty: "Kitchen & living spaces",
    rating: 4.7,
    reviewCount: 73,
    area: "Yaba, Lagos",
    image: "/images/work-kitchen.png",
    imageAlt: "Modern oak kitchen with charcoal base units",
  },
];
