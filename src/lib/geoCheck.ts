/** Reads a website's pages for what an AI answer could repeat about the business. */
export type ProofRow = { label: string; value: string; found: boolean };

const strip = (html: string) => html.replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style|noscript|svg|template)\b[\s\S]*?<\/\1>/gi, " ");
const ENTITY: Record<string, string> = { amp: "&", nbsp: " ", quot: '"', apos: "'", rsquo: "’", lsquo: "‘", ndash: "–", mdash: "—" };
const plain = (html: string) =>
  html.replace(/<[^>]+>/g, " ").replace(/&(#\d+|\w+);/g, (_, c: string) => (c[0] === "#" ? (c === "#36" ? "$" : c === "#8217" || c === "#39" ? "’" : " ") : (ENTITY[c.toLowerCase()] ?? " "))).replace(/\s+/g, " ").trim();

const COUNTIES = ["Allegany", "Anne Arundel", "Baltimore", "Calvert", "Caroline", "Carroll", "Cecil", "Charles", "Dorchester", "Frederick", "Garrett", "Harford", "Howard", "Kent", "Montgomery", "Prince George['’]?s", "Queen Anne['’]?s", "St\\.? Mary['’]?s", "Somerset", "Talbot", "Washington", "Wicomico", "Worcester"];
// Towns whose names are not also everyday words or the names of people.
const TOWNS = ["Annapolis", "Baltimore", "Bel Air", "Bethesda", "Bowie", "Cambridge", "Catonsville", "Chevy Chase", "Clarksburg", "College Park", "Columbia", "Crofton", "Cumberland", "Dundalk", "Easton", "Edgewater", "Eldersburg", "Elkridge", "Elkton", "Ellicott City", "Essex", "Fort Washington", "Frederick", "Gaithersburg", "Germantown", "Glen Burnie", "Greenbelt", "Hagerstown", "Havre de Grace", "Hyattsville", "Kensington", "La Plata", "Laurel", "Leonardtown", "Lexington Park", "Middletown", "Mount Airy", "Ocean City", "Odenton", "Olney", "Owings Mills", "Parkville", "Pasadena", "Pikesville", "Potomac", "Prince Frederick", "Reisterstown", "Rockville", "Salisbury", "Severn", "Severna Park", "Silver Spring", "Stevensville", "Sykesville", "Takoma Park", "Thurmont", "Timonium", "Towson", "Upper Marlboro", "Urbana", "Waldorf", "Westminster", "Wheaton"];

function places(text: string): string {
  const found: string[] = [];
  for (const c of COUNTIES) {
    const m = new RegExp(`\\b${c} Count(?:y|ies)\\b`).exec(text);
    if (m) found.push(m[0].replace(/Counties$/, "County"));
  }
  for (const list of text.matchAll(/\b((?:[A-Z][\w.'’]+(?: [A-Z][\w.'’]+)?, ){1,12}(?:and |& )?[A-Z][\w.'’]+(?: [A-Z][\w.'’]+)?) Counties\b/g))
    for (const c of COUNTIES) if (new RegExp(`\\b${c}\\b`).test(list[1]) && !found.some((f) => new RegExp(`^${c} County`).test(f))) found.push(`${new RegExp(c).exec(list[1])![0]} County`);
  for (const t of TOWNS) if (new RegExp(`\\b${t}\\b(?! Count(?:y|ies))`).test(text)) found.push(t);
  if (found.length < 2) return found[0] ?? "";
  return found.length === 2 ? found.join(" and ") : `${found.slice(0, 2).join(", ")} and ${found.length - 2} more`;
}

type Link = { text: string; path: string };
function links(html: string, base: URL): Link[] {
  const bare = (h: string) => h.replace(/^www\./, "");
  const out: Link[] = [];
  for (const [, , href, body] of html.matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)) {
    try {
      const url = new URL(href.replace(/&amp;/g, "&"), base);
      if (/^https?:$/.test(url.protocol) && bare(url.hostname) === bare(base.hostname) && !/\.(?:pdf|jpe?g|png|webp|gif|css|js)$/i.test(url.pathname)) out.push({ text: plain(body), path: url.pathname.replace(/\/+$/, "").toLowerCase() || "/" });
    } catch { /* not an address */ }
  }
  return out;
}

const SERVICES = /^(?:our |all |the )?(?:services?|what we do|practice areas|treatments|specialties)(?: (?:offered|we offer))?$/i;
// Words a page about one service is usually named with.
const SERVICE_WORDS = /\b(?:roof(?:ing|s)?|siding|gutters?|windows?|doors?|skylights?|decks?|insulation|plumbing|drains?|sewers?|water heaters?|heating|cooling|hvac|furnaces?|air condition\w*|heat pumps?|air quality|electrical|generators?|lighting|painting|remodel\w*|kitchens?|bath(?:room)?s?|flooring|tile|concrete|masonry|paving|landscap\w*|lawn|hardscap\w*|tree|pest|termite|mold|waterproofing|foundation|fencing|fences?|garage|cleaning|restoration|repairs?|replacement|installation|maintenance|inspections?|moving|storage|towing|brakes?|oil change|detailing|catering|weddings?|implants?|crowns?|whitening|orthodontics?|massage|facials?|injury|divorce|estate planning|bankruptcy|bookkeeping|payroll)\b/i;
const NOT_SERVICE = /\b(?:blog|news|articles?|calculators?|estimators?|about|contact|careers?|jobs?|reviews?|testimonials?|gallery|financing|coupons?|specials?|offers?|deals|areas?|locations?|privacy|terms|faqs?|warranty|portal|schedule|estimates?|quotes?)\b/i;
const PLACE_PAGE = new RegExp(`\\b(?:in|near|of|around) [A-Z]|\\b(?:MD|Maryland|VA|DC|WV|PA)\\b`);
/** Pages under a services address, in the menu that opens from a Services link, or named for a service. */
function servicePages(html: string, base: URL): number {
  const paths = new Set<string>();
  for (const l of links(html, base)) if (/^\/(?:[\w-]+\/)?(?:our-)?(?:services?|what-we-do|practice-areas|treatments|specialties)\/[\w-]+/.test(l.path)) paths.add(l.path);
  for (const l of links(html, base)) {
    const slug = l.path.split("/").pop()!.replace(/-/g, " ");
    if (l.path !== "/" && l.text && l.text.length <= 48 && SERVICE_WORDS.test(l.text) && SERVICE_WORDS.test(slug) && !NOT_SERVICE.test(l.text) && !NOT_SERVICE.test(l.path.replace(/[-/]/g, " "))) paths.add(l.path);
  }
  for (const m of html.matchAll(/<(?:a|span|button)\b[^>]*>([\s\S]{0,300}?)<\/(?:a|span|button)>/gi)) {
    if (!SERVICES.test(plain(m[1]))) continue;
    const after = html.slice(m.index! + m[0].length, m.index! + m[0].length + 60_000);
    const open = /^(?:(?!<\/li>|<li\b)[\s\S]){0,600}?<ul\b/i.exec(after);
    if (!open) continue;
    let depth = 0, end = after.length;
    for (const t of after.matchAll(/<(\/?)ul\b/gi)) {
      depth += t[1] ? -1 : 1;
      if (depth === 0) { end = t.index!; break; }
    }
    for (const l of links(after.slice(open[0].length - 3, end), base)) if (l.path !== "/" && !SERVICES.test(l.text) && !NOT_SERVICE.test(l.text)) paths.add(l.path);
  }
  // The same work in another town is not another service.
  const placed = new Set(links(html, base).filter((l) => PLACE_PAGE.test(l.text) || new RegExp(`\\b(?:${TOWNS.join("|")})\\b`, "i").test(l.path.replace(/-/g, " "))).map((l) => l.path));
  return [...paths].filter((p) => !placed.has(p)).length;
}

const LICENSE = /\bMHIC\s*(?:(?:license|lic\.?)\s*)?(?:#|no\.?|number|:)?\s*[:#]?\s*\d{3,}\b|\b(?:license|lic\.?)\s*(?:#|no\.?|number)\s*[:#]?\s*[A-Z]{0,4}-?\d{3,}\b/i;
const WORK = /^(?:our |recent |past |view |see |photo |project )*(?:work|projects?|portfolio|gallery|case stud(?:y|ies)|before (?:and|&) after)(?: gallery| photos)?$/i;
const PRAISE = /^(?:(?:our|read|see|view|all|more|customer|client|patient|google|the|&|and|reviews?|testimonials?) )*(?:reviews?|testimonials?|success stories)(?: page)?$/i;
const PRAISE_BLOCK = /\bclass=["'](?:[^"']*[\s_-])?(?:testimonials?|reviews?)(?:[\s_-][^"']*)?["']/i;
const WIDGETS = /(?:birdeye\.com|podium\.com\/reviews|elfsight\.com|trustindex\.io|reviewsonmywebsite\.com|widget\.trustpilot\.com|embedsocial\.com|nicejob\.(?:co|com)|grade\.us)/i;
const QUESTIONS = /\b(?:faqs?|frequently asked questions)\b/i;

function price(text: string): string {
  for (const m of text.matchAll(/\$\s?\d[\d,]*(?:\.\d{2})?/g)) {
    const near = text.slice(Math.max(0, m.index! - 24), m.index! + m[0].length + 24);
    if (!/\boff\b|\bsav(?:e|ings)\b|discount|coupon|rebate|credit|gift|donat|raised|million|billion|\$\s?0\b|insured|insurance|financ|bonus|win\b/i.test(near) && !/^\s?(?:k|m|b)\b/i.test(text.slice(m.index! + m[0].length))) return m[0].replace(/\s/, "");
  }
  return "";
}
function record(text: string): string {
  const year = new Date().getFullYear();
  const since = /\b(?:since|established(?: in)?|est\.?|founded in|serving [A-Z][\w ]{2,30} since)\s+((?:18|19|20)\d{2})\b/i.exec(text);
  if (since && Number(since[1]) <= year) return `Since ${since[1]}`;
  const years = /\b(?:over |more than )?(\d{1,3})\+?\s+years(?:['’])?\s+(?:of\s+(?:combined\s+)?(?:experience|service)|in\s+business|experience|serving)/i.exec(text);
  const been = /\bfor (?:over|more than|nearly|almost) (\d{1,3})\+? years\b/i.exec(text);
  if (!years && been) return `${been[1]} years stated`;
  if (years) return `${years[1]} years stated`;
  const jobs = /\b((?:\d{1,3},)*\d{2,3}\+?)\s+(?:roofs|homes|projects|jobs|installations|customers|clients|families|patients)\b/i.exec(text);
  return jobs ? jobs[0].replace(/\s+/g, " ") : "";
}

export function checkProof(home: string, about: string | null, base: URL): ProofRow[] {
  const pages = [strip(home), about ? strip(about) : ""];
  const html = pages.join("\n"), text = pages.map(plain).join(" ");
  const all = links(html, base);
  const named = (pattern: RegExp) => all.find((l) => l.text.length <= 40 && pattern.test(l.text));
  const row = (label: string, value: string): ProofRow => ({ label, value: value || "Not found", found: Boolean(value) });

  const count = servicePages(html, base);
  const license = LICENSE.exec(text)?.[0].replace(/\s+/g, " ");
  const work = named(WORK), praise = named(PRAISE), faq = named(/^(?:faqs?|frequently asked questions)$/i);
  const asked = [...html.matchAll(/<(h[2-6]|summary|button)\b[^>]*>([\s\S]{0,300}?)<\/\1>/gi)].filter(([, , body]) => /\w.{8,}\?$/.test(plain(body))).length;
  return [
    row("Service pages", count > 1 ? `${count} linked` : ""),
    row("Places named", places(text)),
    row("Prices", price(text)),
    row("License", license ?? ""),
    row("Finished work", work ? `“${work.text}” page` : ""),
    row("Customer words", praise ? `“${praise.text}” page` : /<blockquote\b/i.test(html) || PRAISE_BLOCK.test(html) || [...html.matchAll(/<h[1-6]\b[^>]*>([\s\S]{0,200}?)<\/h[1-6]>/gi)].some((m) => PRAISE.test(plain(m[1]))) ? "Quoted on the page" : WIDGETS.test(home) ? "Review widget" : ""),
    row("Track record", record(text)),
    row("Questions answered", faq ? `“${faq.text}” page` : asked > 1 ? `${asked} on the page` : asked === 1 || QUESTIONS.test(plain([...html.matchAll(/<h[1-6]\b[^>]*>[\s\S]{0,200}?<\/h[1-6]>/gi)].map((m) => m[0]).join(" "))) ? "On the page" : ""),
  ];
}

/** The site's own about page, from its links. */
export function aboutPage(html: string, base: URL): URL | null {
  const link = links(strip(html), base).find((l) => /^\/(?:[\w-]+\/)?(?:about|about-us|our-story|who-we-are|company|our-company)$/.test(l.path) || /^(?:about(?: us)?|our story|who we are)$/i.test(l.text));
  return link && link.path !== "/" ? new URL(link.path, base.origin) : null;
}
