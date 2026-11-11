export const PRO_PRICE_LABEL = "₦9,500/mo";

export const TRIAL_DAYS = 3;

export type CapabilityStatus = "prototype" | "planned";

export type AssistantCapability = {
  title: string;
  description: string;
  status: CapabilityStatus;
};

export const assistantCapabilities: AssistantCapability[] = [
  {
    title: "Performance review",
    description:
      "Explains your month: earnings, completed jobs, ratings and the one thing to fix first.",
    status: "prototype",
  },
  {
    title: "Schedule planning",
    description:
      "Groups nearby jobs and suggests the order to travel so your week needs fewer trips.",
    status: "prototype",
  },
  {
    title: "Request triage",
    description:
      "Ranks incoming requests by value, distance and fit so you know which to accept first.",
    status: "prototype",
  },
  {
    title: "Customer reply drafts",
    description:
      "Writes replies to customer messages for you to read and edit before anything is sent.",
    status: "prototype",
  },
  {
    title: "Post drafts",
    description:
      "Turns a finished job into a post about the work, ready for you to review.",
    status: "prototype",
  },
  {
    title: "Hands-off approval queue",
    description:
      "Prepares actions in one list so you approve them in a tap instead of hunting for them.",
    status: "prototype",
  },
  {
    title: "Sending replies after you approve",
    description: "Sends approved replies from the assistant on your behalf.",
    status: "planned",
  },
  {
    title: "Live calendar and payout data",
    description:
      "Reads your real jobs, calendar and payouts instead of sample figures.",
    status: "planned",
  },
  {
    title: "Customer reminders and follow-ups",
    description:
      "Sends scheduled reminders and follow-ups to customers you have approved.",
    status: "planned",
  },
  {
    title: "Marketing and growth campaigns",
    description: "Plans and runs campaigns to bring in new customers.",
    status: "planned",
  },
];
