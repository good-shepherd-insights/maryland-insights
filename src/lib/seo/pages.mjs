import { ROUTES, isRepeatable, routeOf } from "./contract.mjs";

// The single list of which documents become pages. Routes, share images, the
// sitemap and SEO all use it, so they cannot disagree.

/** First path segments used by the site itself. Tests keep this complete. */
export const RESERVED = new Set(["404", "_astro", "_image", "_server-islands", "api", "blog", "features", "fonts", "get-started", "images", "open-graph", "services", "start-for-free", "enterprise-support", "sitemap-index", "sitemap-0"]);

/**
 * @param {any[]} rows documents with _id, _type, slug and _createdAt
 * @returns {{routes: Map<string, string>, refused: {row: any, message: string}[]}}
 * Fixed pages always win. Between two pages at one address, the older wins.
 */
export function pickPages(rows) {
  const routes = new Map(), taken = new Map(), refused = [];
  const key = (r) => [isRepeatable(r._type) ? "1" : "0", r._createdAt ?? "", r._id].map(String);
  const before = (a, b) => { const x = key(a), y = key(b); for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1; return 0; };
  const list = rows.filter((r) => Object.hasOwn(ROUTES, r?._type ?? "") && typeof r._id === "string").sort(before);
  for (const row of list) {
    const route = routeOf(row);
    const address = route?.toLowerCase();
    if (!route) refused.push({ row, message: "has no slug, or one that is not a valid address; it was not published" });
    else if (isRepeatable(row._type) && ROUTES[row._type] === "/{slug}" && RESERVED.has(address.slice(1))) refused.push({ row, message: `uses ${route}, which the site needs; it was not published` });
    else if (taken.has(address)) refused.push({ row, message: `shares the address ${route} with ${taken.get(address)}; it was not published` });
    else { taken.set(address, row._id); routes.set(row._id, route); }
  }
  return { routes, refused };
}
