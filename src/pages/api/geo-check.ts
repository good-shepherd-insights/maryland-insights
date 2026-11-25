import { facts, question, readAnswer } from "../../lib/answerCheck";
import { identity } from "../../lib/followUpCheck";
import { checkSchema, homepage } from "../../lib/schemaCheck";
import { SCRAPE_URL, UnreadableError, allowed, json } from "../../lib/siteReader";

export const prerender = false;
export const maxDuration = 60;

const ANSWERS_URL = "https://api.context.dev/v1/web/answers";
const stated = (description: string) => ({ type: ["string", "null"], description });
const SCHEMA = {
  type: "object",
  properties: {
    business_name: stated("The business name customers use"),
    search_phrase: stated('What a customer would ask an assistant to find, in two to five plain lowercase plural words, such as "roof repair companies" or "seafood restaurants"'),
    town: stated("The Maryland town or city the business is in or first says it serves"),
    county: stated("A Maryland county it says it serves"),
  },
};

/** The homepage, and what it says the business does and where. */
async function readBusiness(url: URL, key: string) {
  const res = await fetch(SCRAPE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url: url.href, formats: { json: true, html: true }, sharedParams: { waitFor: 4000 }, jsonParams: { schema: SCHEMA, instructions: "Use only facts stated on the page. The town must be in Maryland; use null if none is stated." }, timeoutOpts: { milliseconds: 35_000, behavior: "fail" } }),
    signal: AbortSignal.timeout(40_000),
  });
  if (!res.ok) throw new UnreadableError(res.status === 400 ? 422 : 502);
  const page = (await res.json()) as any;
  const html = page?.html?.success && typeof page.html.data === "string" ? (page.html.data as string) : "";
  return { html, facts: page?.json?.success ? facts(page.json.data) : null };
}

/** One question, answered from a live web search. */
async function ask(asked: string, key: string) {
  const res = await fetch(ANSWERS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ mode: "fast", task: `${asked} Recommend the businesses a customer should consider, with the official website of each.`, json_format: { businesses: [{ name: "", website: "" }] }, timeoutOpts: { milliseconds: 25_000, behavior: "return-partial" } }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) {
    console.error(`[geo-check] answers returned ${res.status}`);
    return null;
  }
  return (await res.json()) as any;
}

const CACHE_MS = 60 * 60 * 1000;
const cache = new Map<string, { at: number; result: unknown }>();

export async function POST({ request, clientAddress }: { request: Request; clientAddress: string }): Promise<Response> {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return json(400, { error: "bad-request" });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { error: "bad-request" });
  const { business, website } = body as Record<string, unknown>;
  // "website" is the hidden field only bots fill in.
  if (typeof website === "string" && website !== "") return json(400, { error: "bad-request" });
  const url = homepage(business);
  if (!url) return json(400, { error: "bad-address" });
  const key = process.env.CONTEXT_DEV_API_KEY;
  if (!key) return json(503, { error: "not-configured" });
  const hit = cache.get(url.href);
  if (hit && Date.now() - hit.at < CACHE_MS) return json(200, hit.result);
  if (!allowed(clientAddress || "unknown")) return json(429, { error: "rate-limited" });

  try {
    const site = await readBusiness(url, key);
    if (!site.facts) return json(422, { error: "no-place" });
    const domain = url.hostname.replace(/^www\./, "");
    const schema = checkSchema(site.html, domain), own = identity(site.html);
    const name = (schema.name !== domain ? schema.name : own.name || site.facts.name || domain).slice(0, 80);
    const asked = question(site.facts);
    const answer = await ask(asked, key);
    const rows = answer ? readAnswer(answer.json_content, answer.sources, { name, domain, question: asked }) : null;
    if (!rows) return json(502, { error: "no-answer" });
    const day = new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
    const result = { name, logo: schema.logo ?? own.logo, notes: [`One AI search answer from ${day}. Answers change each time it is asked.`], rows };
    if (cache.size >= 200) cache.delete(cache.keys().next().value!);
    cache.set(url.href, { at: Date.now(), result });
    return json(200, result);
  } catch (error) {
    if (error instanceof UnreadableError) return json(error.status, { error: "unreadable" });
    console.error(`[geo-check] ${error instanceof Error ? error.name : "failed"}`);
    return json(502, { error: "unreadable" });
  }
}
