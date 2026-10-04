export type FeedAuthor = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  title: string;
  verified?: boolean;
  isProvider?: boolean;
  area?: string;
};

export type FeedPost = {
  id: string;
  author: FeedAuthor;
  text: string;
  images: { src: string; alt: string }[];
  time: string;
  likes: number;
  comments: number;
  reposts: number;
  liked?: boolean;
  saved?: boolean;
  following?: boolean;
  intent?: "showcase" | "need" | "question" | "discovery" | "idea";
};

export const feedAuthors: Record<string, FeedAuthor> = {
  daniel: {
    id: "daniel",
    name: "Daniel Okafor",
    handle: "@danieljoinery",
    initials: "DO",
    title: "Master carpenter · Custom interiors",
    verified: true,
    isProvider: true,
    area: "Lekki, Lagos",
  },
  zainab: {
    id: "zainab",
    name: "Zainab Bello",
    handle: "@zainabbello",
    initials: "ZB",
    title: "Fashion designer",
    verified: true,
    isProvider: true,
    area: "Surulere, Lagos",
  },
  emeka: {
    id: "emeka",
    name: "Emeka Udo",
    handle: "@emekaudo",
    initials: "EU",
    title: "Mechanical engineer",
    isProvider: true,
    area: "Ogun",
  },
  musa: {
    id: "musa",
    name: "Musa Garba",
    handle: "@musagarba",
    initials: "MG",
    title: "Classic car mechanic",
    verified: true,
    isProvider: true,
    area: "Kano",
  },
  chloe: {
    id: "chloe",
    name: "Chloe Adams",
    handle: "@chloeadams",
    initials: "CA",
    title: "Interior enthusiast",
    isProvider: false,
    area: "Ikoyi, Lagos",
  },
  tomi: {
    id: "tomi",
    name: "Tomi Akinrele",
    handle: "@tomiak",
    initials: "TA",
    title: "Homeowner · DIY curious",
    isProvider: false,
    area: "Yaba, Lagos",
  },
  amara: {
    id: "amara",
    name: "Amara Eze",
    handle: "@amaraeze",
    initials: "AE",
    title: "Event planner",
    isProvider: false,
    area: "Victoria Island, Lagos",
  },
};

export const seedPosts: FeedPost[] = [
  {
    id: "p1",
    author: feedAuthors.daniel,
    text: "Finished this floor-to-ceiling wardrobe in Ikoyi last week. Walnut veneer, soft-close sliding doors, and warm LED strips that switch on as the doors open. Two days on site, zero mess left behind.",
    images: [{ src: "/images/work-wardrobe.png", alt: "Built-in walnut and white wardrobe with LED lighting" }],
    time: "2h",
    likes: 248,
    comments: 31,
    reposts: 12,
    intent: "showcase",
  },
  {
    id: "p2",
    author: feedAuthors.chloe,
    text: "I want to renovate my living room but I'm not sure what style I want. I love the look of built-in woodwork but I'm worried about the cost. Has anyone done something similar recently? What should I budget?",
    images: [],
    time: "4h",
    likes: 42,
    comments: 18,
    reposts: 3,
    intent: "need",
  },
  {
    id: "p3",
    author: feedAuthors.zainab,
    text: "Structured emerald gown for a client's 40th. Hand-finished seams and a hidden ankara lining — she wanted something only she would know about. Eight fittings, one very happy client.",
    images: [{ src: "/images/work-dress.png", alt: "Emerald structured evening dress on a dress form" }],
    time: "6h",
    likes: 512,
    comments: 64,
    reposts: 40,
    intent: "showcase",
  },
  {
    id: "p4",
    author: feedAuthors.tomi,
    text: "Does anyone know someone who can repair a leaking kitchen sink? It's been dripping for a week and I'm tired of putting a bucket under it. Somewhere in Yaba ideally.",
    images: [],
    time: "8h",
    likes: 15,
    comments: 7,
    reposts: 2,
    intent: "question",
  },
  {
    id: "p5",
    author: feedAuthors.emeka,
    text: "Third iteration of a compact solar pump for small farms. 40% less draw than v2. Looking for two farms in Ogun to pilot it next month. DM if interested — happy to share the spec sheet.",
    images: [{ src: "/images/work-prototype.png", alt: "Solar water pump prototype on a workbench" }],
    time: "12h",
    likes: 389,
    comments: 47,
    reposts: 58,
    intent: "showcase",
  },
  {
    id: "p6",
    author: feedAuthors.amara,
    text: "I love this design. Something like this but for a bedroom — floor-to-ceiling wardrobe with mirror panels. Saving this for when I'm ready to renovate.",
    images: [{ src: "/images/work-wardrobe.png", alt: "Built-in walnut wardrobe inspiration" }],
    time: "1d",
    likes: 67,
    comments: 9,
    reposts: 5,
    intent: "discovery",
  },
  {
    id: "p7",
    author: feedAuthors.musa,
    text: "Eight months, one very patient owner. This 1986 W124 is back on the road with its original engine rebuilt. Restoration work teaches you patience — every bolt tells a story.",
    images: [{ src: "/images/work-restoration.png", alt: "Restored cream classic sedan in a garage" }],
    time: "2d",
    likes: 731,
    comments: 92,
    reposts: 76,
    intent: "showcase",
  },
  {
    id: "p8",
    author: feedAuthors.chloe,
    text: "Finally got my kitchen cabinets refaced last month. So happy with how it turned out. Sometimes you don't need a full renovation — just fresh doors and new handles.",
    images: [{ src: "/images/work-kitchen.png", alt: "Modern oak kitchen with charcoal base units" }],
    time: "2d",
    likes: 124,
    comments: 22,
    reposts: 8,
    intent: "idea",
  },
];

export type DiscoverPerson = {
  id: string;
  name: string;
  handle: string;
  initials: string;
  title: string;
  area: string;
  rating?: number;
  verified?: boolean;
  isProvider: boolean;
  image: string;
  imageAlt: string;
  followers: string;
};

export const discoverPeople: DiscoverPerson[] = [
  {
    id: "d1",
    name: "Daniel Okafor",
    handle: "@danieljoinery",
    initials: "DO",
    title: "Master carpenter · Custom interiors",
    area: "Lekki, Lagos",
    rating: 4.9,
    verified: true,
    isProvider: true,
    image: "/images/work-wardrobe.png",
    imageAlt: "Custom wardrobe work",
    followers: "3.2k",
  },
  {
    id: "d2",
    name: "Zainab Bello",
    handle: "@zainabbello",
    initials: "ZB",
    title: "Fashion designer",
    area: "Surulere, Lagos",
    rating: 4.8,
    verified: true,
    isProvider: true,
    image: "/images/work-dress.png",
    imageAlt: "Custom evening dress",
    followers: "5.1k",
  },
  {
    id: "d3",
    name: "Musa Garba",
    handle: "@musagarba",
    initials: "MG",
    title: "Classic car mechanic",
    area: "Kano",
    rating: 4.9,
    verified: true,
    isProvider: true,
    image: "/images/work-restoration.png",
    imageAlt: "Restored classic car",
    followers: "8.4k",
  },
  {
    id: "d4",
    name: "Grace Adeoye",
    handle: "@graceadeoye",
    initials: "GA",
    title: "Interior designer",
    area: "Yaba, Lagos",
    rating: 4.7,
    isProvider: true,
    image: "/images/work-kitchen.png",
    imageAlt: "Modern kitchen design",
    followers: "2.1k",
  },
];

export type AppNotification = {
  id: string;
  kind: "like" | "comment" | "follow" | "message" | "repost" | "request" | "system";
  who?: string;
  whoInitials?: string;
  text: string;
  time: string;
  unread: boolean;
};

export const seedNotifications: AppNotification[] = [
  { id: "n1", kind: "like", who: "Daniel Okafor", whoInitials: "DO", text: "appreciated your post about kitchen cabinets", time: "20m", unread: true },
  { id: "n2", kind: "comment", who: "Zainab Bello", whoInitials: "ZB", text: 'commented: "Love the colour combination!"', time: "1h", unread: true },
  { id: "n3", kind: "follow", who: "Emeka Udo", whoInitials: "EU", text: "started following you", time: "3h", unread: true },
  { id: "n4", kind: "message", who: "Northside Plumbing", whoInitials: "NP", text: "replied to your plumbing request", time: "5h", unread: false },
  { id: "n5", kind: "repost", who: "Amara Eze", whoInitials: "AE", text: "reposted your wardrobe inspiration", time: "8h", unread: false },
  { id: "n6", kind: "request", who: "Still House Cleaning", whoInitials: "SH", text: "confirmed your cleaning appointment for Saturday", time: "1d", unread: false },
  { id: "n7", kind: "system", text: "Your electrical repair request has been marked complete by Lumen Electrical", time: "2d", unread: false },
];

export const customerProfile = {
  name: "Chloe Adams",
  handle: "@chloeadams",
  initials: "CA",
  bio: "Interior enthusiast. Always looking for beautiful ideas and talented people. Based in Ikoyi, Lagos.",
  area: "Ikoyi, Lagos",
  posts: 12,
  followers: 342,
  following: 89,
  saved: 24,
};
