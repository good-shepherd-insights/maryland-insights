import type { APIContext } from "astro";
import { checkSchema, homepage, type SchemaCheck } from "../../lib/schemaCheck";

export const prerender = false;

const SCRAPE_URL = "https://api.context.dev/v1/web/scrape";
const TIMEOUT_MS = 25_000;
const MAX_BASE64 = 8_000_000;
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 10;
const CACHE_MS = 60 * 60 * 1000;
const CACHE_MAX = 200;

// Kept per warm instance, so these are brakes on cost, not a security boundary.
const seen = new Map<string, { at: number; count: number }>();
const cache = new Map<string, { at: number; result: SchemaCheck }>();

const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

function allowed(ip: string): boolean {
  const now = Date.now();
  for (const [k, v] of seen) if (now - v.at > WINDOW_MS) seen.delete(k);
  const entry = seen.get(ip) ?? { at: now, count: 0 };
  if (entry.count >= LIMIT) return false;
  seen.set(ip, { ...entry, count: entry.count + 1 });
  return true;
}

/** Reads the schema on a website's homepage from the raw HTML, before any JavaScript runs. */
export async function POST({ request, clientAddress }: Pick<APIContext, "request" | "clientAddress">): Promise<Response> {
  if (!(request.headers.get("content-type") ?? "").includes("application/json")) return json(400, { error: "bad-request" });
  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { error: "bad-request" });
  const { business, website } = body as Record<string, unknown>;
  // "website" is the hidden field only bots fill in.
  if (typeof website === "string" && website !== "") return json(400, { error: "bad-request" });
  const url = homepage(business);
  if (!url) return json(400, { error: "bad-address" });

  // Read when a request arrives, so the key never goes into the built files.
  const key = process.env.CONTEXT_DEV_API_KEY;
  if (!key) return json(503, { error: "not-configured" });

  const hit = cache.get(url.href);
  if (hit && Date.now() - hit.at < CACHE_MS) return json(200, hit.result);
  if (!allowed(clientAddress || "unknown")) return json(429, { error: "rate-limited" });

  try {
    const res = await fetch(SCRAPE_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url: url.href, formats: { bytes: true }, timeoutOpts: { milliseconds: 20_000, behavior: "fail" } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[schema-check] provider returned ${res.status}`);
      return json(res.status === 400 ? 422 : 502, { error: "unreadable" });
    }
    const page = (await res.json()) as any;
    const file = page?.bytes?.success ? page.bytes.data : null;
    if (typeof file?.base64 !== "string" || file.base64.length > MAX_BASE64 || !/html/i.test(file.contentType ?? "")) return json(422, { error: "unreadable" });
    const html = Buffer.from(file.base64, "base64").toString("utf8");
    const result = checkSchema(html, url.hostname.replace(/^www\./, ""));
    if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
    cache.set(url.href, { at: Date.now(), result });
    return json(200, result);
  } catch (error) {
    console.error(`[schema-check] ${error instanceof Error ? error.name : "failed"}`);
    return json(502, { error: "unreadable" });
  }
}
