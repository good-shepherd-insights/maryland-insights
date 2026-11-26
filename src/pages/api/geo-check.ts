import { facts, question, readAnswer, seal, unseal } from "../../lib/answerCheck";
import { identity } from "../../lib/followUpCheck";
import { checkSchema, homepage } from "../../lib/schemaCheck";
import { SCRAPE_URL, UnreadableError, allowed, json } from "../../lib/siteReader";

export const prerender = false;
export const maxDuration = 60;

const CLORO = "https://api.cloro.dev/v1/async/task";
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

const cloro = (path: string, key: string, body?: unknown) =>
  fetch(`${CLORO}${path}`, {
    method: body ? "POST" : "GET",
    headers: { Authorization: `Bearer ${key}`, ...(body ? { "Content-Type": "application/json" } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {}),
    signal: AbortSignal.timeout(15_000),
  });

const CACHE_MS = 60 * 60 * 1000;
const cache = new Map<string, { at: number; result: unknown }>();
const remember = (home: string, result: unknown) => {
  if (cache.size >= 200) cache.delete(cache.keys().next().value!);
  cache.set(home, { at: Date.now(), result });
};

/** Starts one ChatGPT question for a website; given the ticket it handed out, reports whether the answer is in. */
export async function POST({ request, clientAddress }: { request: Request; clientAddress: string }): Promise<Response> {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return json(400, { error: "bad-request" });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { error: "bad-request" });
  const { business, website, pending } = body as Record<string, unknown>;
  // "website" is the hidden field only bots fill in.
  if (typeof website === "string" && website !== "") return json(400, { error: "bad-request" });
  const reader = process.env.CONTEXT_DEV_API_KEY, asker = process.env.CLORO_API_KEY;

  try {
    if (pending !== undefined) {
      if (!asker) return json(503, { error: "not-configured" });
      const t = unseal(pending, asker);
      if (!t) return json(400, { error: "expired" });
      const res = await cloro(`/${encodeURIComponent(t.task)}`, asker);
      const data = res.ok ? ((await res.json()) as any) : null;
      const state = data?.task?.status;
      if (state === "FAILED") return json(502, { error: "no-answer" });
      if (state !== "COMPLETED") return json(202, { pending });
      const rows = readAnswer(data.response ?? data.result, t);
      if (!rows) return json(502, { error: "no-answer" });
      const day = new Date(t.at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" });
      const result = { name: t.name, logo: t.logo, notes: [`One ChatGPT answer from ${day}. Answers change each time it is asked.`], rows };
      remember(t.home, result);
      return json(200, result);
    }

    const url = homepage(business);
    if (!url) return json(400, { error: "bad-address" });
    if (!reader || !asker) return json(503, { error: "not-configured" });
    const hit = cache.get(url.href);
    if (hit && Date.now() - hit.at < CACHE_MS) return json(200, hit.result);
    if (!allowed(clientAddress || "unknown")) return json(429, { error: "rate-limited" });
    const site = await readBusiness(url, reader);
    if (!site.facts) return json(422, { error: "no-place" });
    const domain = url.hostname.replace(/^www\./, "");
    const schema = checkSchema(site.html, domain), own = identity(site.html);
    const name = (schema.name !== domain ? schema.name : own.name || site.facts.name || domain).slice(0, 80);
    const asked = question(site.facts);
    const started = await cloro("", asker, { taskType: "CHATGPT", priority: 10, payload: { prompt: asked, country: "US" } });
    const task = started.ok ? ((await started.json()) as any)?.task?.id : null;
    if (typeof task !== "string") {
      console.error(`[geo-check] cloro returned ${started.status}`);
      return json(502, { error: "no-answer" });
    }
    const logo = schema.logo ?? own.logo;
    return json(202, { pending: seal({ task, home: url.href, name, logo: logo && logo.length < 600 ? logo : null, domain, question: asked, at: Date.now() }, asker) });
  } catch (error) {
    if (error instanceof UnreadableError) return json(error.status, { error: "unreadable" });
    console.error(`[geo-check] ${error instanceof Error ? error.name : "failed"}`);
    return json(502, { error: "unreadable" });
  }
}
