export type MockProvider = {
  name: string;
  service: string;
  distance: string;
  availability: string;
  rating: number;
  reviews: number;
  experience: string;
};

export const demoProviders: MockProvider[] = [
  {
    name: "Marcus Bell",
    service: "Emergency plumbing",
    distance: "1.2 km away",
    availability: "Can arrive today, 16:30",
    rating: 4.9,
    reviews: 213,
    experience: "12 yrs · leak & pipe repair",
  },
  {
    name: "Northside Plumbing",
    service: "Residential plumbing",
    distance: "2.8 km away",
    availability: "Tomorrow, 09:00",
    rating: 4.7,
    reviews: 486,
    experience: "Team of 6 · licensed",
  },
  {
    name: "Ada Okafor",
    service: "Plumbing & fittings",
    distance: "3.4 km away",
    availability: "Today, 19:00",
    rating: 4.8,
    reviews: 97,
    experience: "8 yrs · kitchen specialist",
  },
];

export const serviceCategories = [
  "Plumbing",
  "Electrical",
  "Cleaning",
  "Carpentry",
  "Appliance repair",
  "Painting",
  "Moving & delivery",
  "Gardening",
  "Other",
];

export const locations = [
  "Lagos, Nigeria",
  "London, United Kingdom",
  "Berlin, Germany",
  "New York, United States",
  "Nairobi, Kenya",
  "Toronto, Canada",
];

export const availabilityOptions = [
  "Weekdays",
  "Weekends",
  "Evenings",
  "Anytime",
  "On call / emergency",
];

export const experienceOptions = [
  "Less than 1 year",
  "1–3 years",
  "3–5 years",
  "5–10 years",
  "10+ years",
];
