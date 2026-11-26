import { places, price, type ProofRow } from "./geoCheck";
import { attr, blocks, scan, textOf } from "./htmlScan";

/** Reads one page for what could only have been written about this business, in its area. */
const SOCIAL = /(?:^|\.)(?:facebook|instagram|twitter|x|linkedin|youtube|pinterest|tiktok|google|goo|yelp|nextdoor|apple|bbb|angi|houzz|wa|whatsapp|wordpress|wixstatic|squarespace|shopify|calendly|jotform|typeform)\.\w{2,4}$/i;
const CODE = /\b(?:(?:building |county |city )?permits?|permit inspections?|building code|zoning|licensing|MHIC|county code|ordinances?|historic district)\b/i;
// Permits and licensing only matter to trades that work on homes and buildings.
const TRADE_TYPE = /"@type"\s{0,4}:\s{0,4}(?:\[[^\]]{0,300})?"(?:RoofingContractor|GeneralContractor|HomeAndConstructionBusiness|Plumber|Electrician|HVACBusiness|HousePainter)"/;
const TRADE = /\b(?:roof(?:ing|ers?|s)?|contractors?|remodel(?:ing|ers?)?|renovations?|construction|builders?|home improvement|hvac|heating and (?:air|cooling)|plumb(?:ing|ers?)|electric(?:al|ians?)|siding|gutters?|decks?|fenc(?:e|es|ing)|paving|masonry|concrete|excavation|landscap(?:e|ing|ers?)|hardscap(?:e|ing)|waterproofing|windows and doors|kitchen and bath|painting contractors?|additions)\b/i;
const NAME = /^[A-Z][\w.'’-]{1,20}(?: [A-Z][\w.'’-]{0,20}){1,3}$/;
const GENERIC = /^(?:admin|administrator|editor|staff|team|webmaster|author|marketing|guest|info)\b/i;

function jsonAuthor(body: string): string {
  const m = /"author"\s{0,4}:\s{0,4}(?:\[\s{0,4})?\{[^{}]{0,400}?"name"\s{0,4}:\s{0,4}"([^"]{2,60})"/.exec(body);
  return m?.[1] ?? "";
}

export function checkContent(html: string, base: URL): ProofRow[] {
  const { pieces } = scan(html), withScripts = scan(html, true).pieces;
  const tags = pieces.flatMap((p) => (p.tag && !p.tag.close ? [p.tag] : []));
  const text = textOf(pieces);
  const row = (label: string, value: string): ProofRow => ({ label, value: value || "Not found", found: Boolean(value) });
  const data = withScripts.flatMap((p) => (p.tag?.body && /^application\/ld\+json/i.test(attr(p.tag, "type")) ? [p.tag.body.slice(0, 500_000)] : []));

  const meta = (name: RegExp) => tags.find((t) => t.name === "meta" && name.test(attr(t, "name") || attr(t, "property")));
  const named = [meta(/^author$/i) ? attr(meta(/^author$/i)!, "content") : "", ...data.map(jsonAuthor), ...blocks(pieces, ["a", "span", "p", "div"], 60).filter((b) => /(?:^|[\s_-])(?:author|byline)(?:[\s_-]|$)/i.test(attr(b.tag, "class")) || /^author$/i.test(attr(b.tag, "rel"))).map((b) => b.text.replace(/^(?:written )?by:? /i, ""))];
  const author = named.map((n) => n.trim()).find((n) => NAME.test(n) && !GENERIC.test(n)) ?? "";
  const when = (name: string) => data.map((d) => new RegExp(`"${name}"\\s{0,4}:\\s{0,4}"(\\d{4}-\\d{2}-\\d{2})`).exec(d)?.[1]).find(Boolean);
  const stamp = when("dateModified") ?? when("datePublished") ?? (meta(/^article:(?:modified|published)_time$/i) ? /^\d{4}-\d{2}-\d{2}/.exec(attr(meta(/^article:(?:modified|published)_time$/i)!, "content"))?.[0] : undefined) ?? tags.filter((t) => t.name === "time").map((t) => /^\d{4}-\d{2}-\d{2}/.exec(attr(t, "datetime"))?.[0]).find(Boolean);
  const day = stamp ? new Date(`${stamp}T12:00:00Z`) : null;
  const date = day && !Number.isNaN(day.getTime()) ? day.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "";

  const own = base.hostname.replace(/^www\./, "");
  const outside = new Set<string>();
  for (const a of blocks(pieces, ["a"])) {
    try {
      const u = new URL(attr(a.tag, "href"), base), h = u.hostname.replace(/^www\./, "");
      if (/^https?:$/.test(u.protocol) && h !== own && !h.endsWith(`.${own}`) && !SOCIAL.test(h)) outside.add(h);
    } catch { /* not an address */ }
  }
  const official = [...outside].filter((h) => /\.gov$|\.md\.us$|(?:^|\.)maryland\.gov$/i.test(h));
  const asked = blocks(pieces, ["h2", "h3", "h4", "summary", "button"]).filter((h) => h.text.length > 9 && h.text.endsWith("?")).length;
  const rule = CODE.exec(text)?.[0] ?? "";
  // Judged from what the business says it is, not from the body text, which can mention anything.
  const says = [blocks(pieces, ["title", "h1"]).slice(0, 4).map((b) => b.text).join(" "), meta(/^(?:description|og:description|og:site_name)$/i) ? attr(meta(/^(?:description|og:description|og:site_name)$/i)!, "content") : ""].join(" ");
  const trade = data.some((d) => TRADE_TYPE.test(d)) || TRADE.test(says);
  return [
    row("Named author", author),
    row("Dated", date),
    row("Places named", places(text)),
    ...(trade ? [row("Local rules", rule ? `Mentions ${rule === "MHIC" ? rule : rule.toLowerCase()}` : "")] : []),
    row("Official sources", official.slice(0, 2).join(", ")),
    row("Other sources", outside.size > official.length ? `${outside.size - official.length} linked` : ""),
    row("Prices", price(text)),
    row("Questions answered", asked ? `${asked} on the page` : ""),
  ];
}
