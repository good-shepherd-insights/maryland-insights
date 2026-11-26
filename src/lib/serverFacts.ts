import { lookup, resolveNs } from "node:dns/promises";
import { isIP } from "node:net";

/** What a website's own server says about itself: its reply headers, nameservers, and how it treats plain http. */
export type ServerFacts = { headers: Record<string, string>; ns: string[]; secureRedirect: boolean | null; ms: number | null };

const PRIVATE_V4 = [/^0\./, /^10\./, /^127\./, /^169\.254\./, /^172\.(?:1[6-9]|2\d|3[01])\./, /^192\.168\./, /^100\.(?:6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, /^(?:22[4-9]|2[3-5]\d)\./];
/** True for addresses inside a private network, which this server must never be pointed at. */
export function isPrivate(ip: string): boolean {
  const v = ip.toLowerCase().replace(/^::ffff:/, "");
  if (isIP(v) === 4) return PRIVATE_V4.some((r) => r.test(v));
  if (isIP(v) === 6) return v === "::" || v === "::1" || /^f[cd]/.test(v) || /^fe[89ab]/.test(v);
  return true;
}

async function publicHost(host: string): Promise<boolean> {
  try {
    const all = await lookup(host, { all: true });
    return all.length > 0 && all.every((a) => !isPrivate(a.address));
  } catch {
    return false;
  }
}

const UA = "Mozilla/5.0 (compatible; MarylandInsightsCheck/1.0; +https://marylandinsights.com)";
/** One request, no redirects followed, body thrown away. */
async function ask(url: URL): Promise<Response | null> {
  if (!(await publicHost(url.hostname))) return null;
  try {
    const res = await fetch(url, { redirect: "manual", headers: { "User-Agent": UA, Accept: "text/html" }, signal: AbortSignal.timeout(8_000) });
    await res.body?.cancel().catch(() => {});
    return res;
  } catch {
    return null;
  }
}

/** Follows up to four redirects by hand, checking each address, and returns the last reply with where it ended. */
async function follow(start: URL): Promise<{ res: Response; url: URL; ms: number } | null> {
  let url = start;
  for (let hop = 0; hop < 5; hop++) {
    const started = performance.now();
    const res = await ask(url);
    if (!res) return null;
    const to = res.status >= 300 && res.status < 400 ? res.headers.get("location") : null;
    if (!to) return { res, url, ms: Math.round(performance.now() - started) };
    try {
      url = new URL(to, url);
    } catch {
      return null;
    }
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  }
  return null;
}

export async function serverFacts(home: URL): Promise<ServerFacts> {
  const facts: ServerFacts = { headers: {}, ns: [], secureRedirect: null, ms: null };
  const apex = home.hostname.replace(/^www\./, "");
  await Promise.all([
    resolveNs(apex).then((ns) => { facts.ns = ns.slice(0, 8).map((n) => n.toLowerCase()); }, () => {}),
    follow(new URL(`http://${home.hostname}/`)).then((end) => { if (end) facts.secureRedirect = end.url.protocol === "https:"; }),
    follow(new URL(`https://${home.hostname}/`)).then((end) => {
      if (!end) return;
      facts.ms = end.ms;
      end.res.headers.forEach((value, key) => { if (Object.keys(facts.headers).length < 80) facts.headers[key.toLowerCase()] = value.slice(0, 300); });
    }),
  ]);
  return facts;
}
