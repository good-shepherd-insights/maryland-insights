// The drawing and color each dropdown tile gets, by the last part of its link.
// Drawings are colored for their tile, so the two stay together wherever a link is moved to.
const TONES = ["cream", "gold", "white", "red", "sand", "ink"] as const;
export type NavTone = (typeof TONES)[number];

const TILES: Record<string, NavTone> = {
  "capture-every-lead": "cream",
  "24-7-sales-website": "gold",
  "total-search-visibility": "white",
  "real-time-growth": "red",
  "automatic-customer-nurturing": "sand",
  "5-star-review-system": "ink",
  "local-seo": "cream",
  "aeo-optimization": "gold",
  "ai-powered-content": "white",
  "analytics-reporting": "red",
  "marketing-automation": "sand",
  "website-hosting": "ink",
  "recommended-by-ai": "gold",
  "geo-optimization": "gold",
  tools: "cream",
  blog: "gold",
  faqs: "red",
};

/** Links added later in Sanity have no drawing yet, so they get a plain tile. */
export function navTile(url: string | undefined, index: number): { tone: NavTone; image?: string } {
  const slug = (url ?? "").replace(/[?#].*$/, "").split("/").filter(Boolean).pop() ?? "";
  return Object.hasOwn(TILES, slug)
    ? { tone: TILES[slug], image: `/images/nav/${slug}.svg` }
    : { tone: TONES[index % TONES.length] };
}
