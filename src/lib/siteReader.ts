import { homepage } from "./schemaCheck";

/** What a check shows in the hero. Text is ready to display. */
export type CheckResult = { name: string; logo: string | null; notes: string[]; rows: { label: string; value: string; found: boolean }[] };

export const SCRAPE_URL = "https://api.context.dev/v1/web/scrape";
const MAX_BYTES = 8_000_000;
const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 10;
const CACHE_MS = 60 * 60 * 1000;
const CACHE_MAX = 200;

export class UnreadableError extends Error {
  constructor(public status: number) { super("unreadable"); }
}

/** One page, either as the server sent it or after its scripts have run. */
export async function readPage(url: URL, key: string, mode: "raw" | "rendered", ms = 20_000): Promise<string> {
  const formats = mode === "raw" ? { bytes: true } : { html: true };
  const res = await fetch(SCRAPE_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ url: url.href, formats, ...(mode === "rendered" && { sharedParams: { waitFor: 4000 } }), timeoutOpts: { milliseconds: ms, behavior: "fail" } }),
    signal: AbortSignal.timeout(ms + 5_000),
  });
  if (!res.ok) {
    console.error(`[site-check] provider returned ${res.status}`);
    throw new UnreadableError(res.status === 400 ? 422 : 502);
  }
  const page = (await res.json()) as any;
  if (mode === "rendered") {
    const html = page?.html?.success ? page.html.data : null;
    if (typeof html !== "string" || !html || html.length > MAX_BYTES) throw new UnreadableError(422);
    return html;
  }
  const file = page?.bytes?.success ? page.bytes.data : null;
  if (typeof file?.base64 !== "string" || file.base64.length > MAX_BYTES || !/html/i.test(file.contentType ?? "")) throw new UnreadableError(422);
  return Buffer.from(file.base64, "base64").toString("utf8");
}

export const json = (status: number, payload: unknown) => new Response(JSON.stringify(payload), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

// Shared by every check and kept per warm instance, so it is a brake on cost, not a security boundary.
const seen = new Map<string, { at: number; count: number }>();
export function allowed(ip: string): boolean {
  const now = Date.now();
  for (const [k, v] of seen) if (now - v.at > WINDOW_MS) seen.delete(k);
  const entry = seen.get(ip) ?? { at: now, count: 0 };
  if (entry.count >= LIMIT) return false;
  seen.set(ip, { ...entry, count: entry.count + 1 });
  return true;
}

/** The address given, down to its page. The site itself has to pass the same test as a homepage. */
function pageAddress(value: unknown): URL | null {
  const site = homepage(value);
  if (!site || typeof value !== "string") return null;
  try {
    const path = new URL(/^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`).pathname;
    return path.length > 300 ? null : new URL(path, site.origin);
  } catch {
    return null;
  }
}

/** An endpoint that takes a website address, reads the site and answers on the page. Nothing is stored. */
export function siteCheck(run: (url: URL, key: string) => Promise<CheckResult>, onePage = false) {
  const cache = new Map<string, { at: number; result: CheckResult }>();
  return async ({ request, clientAddress }: { request: Request; clientAddress: string }): Promise<Response> => {
    if (!(request.headers.get("content-type") ?? "").includes("application/json")) return json(400, { error: "bad-request" });
    const body: unknown = await request.json().catch(() => null);
    if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { error: "bad-request" });
    const { business, website } = body as Record<string, unknown>;
    // "website" is the hidden field only bots fill in.
    if (typeof website === "string" && website !== "") return json(400, { error: "bad-request" });
    const url = onePage ? pageAddress(business) : homepage(business);
    if (!url) return json(400, { error: "bad-address" });

    // Read when a request arrives, so the key never goes into the built files.
    const key = process.env.CONTEXT_DEV_API_KEY;
    if (!key) return json(503, { error: "not-configured" });

    const hit = cache.get(url.href);
    if (hit && Date.now() - hit.at < CACHE_MS) return json(200, hit.result);
    if (!allowed(clientAddress || "unknown")) return json(429, { error: "rate-limited" });
    try {
      const result = await run(url, key);
      if (cache.size >= CACHE_MAX) cache.delete(cache.keys().next().value!);
      cache.set(url.href, { at: Date.now(), result });
      return json(200, result);
    } catch (error) {
      if (error instanceof UnreadableError) return json(error.status, { error: "unreadable" });
      console.error(`[site-check] ${error instanceof Error ? error.name : "failed"}`);
      return json(502, { error: "unreadable" });
    }
  };
}
