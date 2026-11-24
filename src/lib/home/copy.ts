// Approved wording for the redesigned homepage sections. Each value can be
// replaced from Sanity: a "redesign" object on the home document wins, key by key.
export const COPY = {
  // Stands in for hero.title until that is changed in Sanity, which would change the live page now.
  heroTitle: "More calls for Maryland businesses. Measured, not guessed.",
  heroNote: "Calls by county for one client.",
  heroMeasured: "Measured",
  heroGuessed: "Guessed",
  partnersTitle: "Maryland government partners",
  servicesTitle: "See the machinery behind every client site.",
  servicesIncluded: "What's included",
  clientsTitle: "One customer, from first search to the next one.",
  clientsLead: "Follow a single Maryland customer through everything your client gets.",
  compareTitle: "{n} features. Only one platform has them all.",
  compareButton: "Compare in detail",
  compareHint: "Or pick any feature.",
  compareModalTitle: "Count what your team is patching by hand.",
  comparePartial: "Basic, plugin or varies",
  toolsTitle: "Plug it all into one record.",
  toolsRecordTitle: "One client record",
  toolsRecordBody: "Calls, leads and bookings end up here, whichever tool they came through.",
  stepsTitle: "From blank page to booked calls.",
  faqTitle: "What agencies ask before they sign.",
  faqSearch: "Search these questions",
  ctaTitle: "Name the county that needs more calls.",
  ctaLabel: "Partner with us",
  footerTitle: "Every client's facts, current wherever Maryland looks.",
};
export type HomeCopy = typeof COPY;

const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
export function homeCopy(home: any): HomeCopy {
  const own = home?.redesign ?? {};
  return Object.fromEntries(Object.entries(COPY).map(([k, v]) => [k, isText(own[k]) ? own[k] : v])) as HomeCopy;
}

/** Order the "what clients get" cards follow a customer through. Others come last. */
export const CLIENT_ORDER = ["total-search-visibility", "24-7-sales-website", "capture-every-lead", "automatic-customer-nurturing", "5-star-review-system", "real-time-growth"];

/** How tools are grouped on the trunk line. Tools not named here are shown under the last group. */
export const TOOL_GROUPS: { title: string; tools: string[] }[] = [
  { title: "Where customers find them", tools: ["Google Business Profile", "Google Search Console", "Google Analytics", "Meta Ads"] },
  { title: "Where leads land", tools: ["GoHighLevel", "HubSpot", "Zapier"] },
  { title: "How jobs get booked and paid", tools: ["Calendly", "Stripe", "Twilio"] },
  { title: "How people stay in touch", tools: ["Mailchimp", "Slack"] },
  { title: "What it is made with", tools: ["Canva", "Astro", "Logo.dev"] },
];
