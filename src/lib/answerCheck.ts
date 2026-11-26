import { createHmac, timingSafeEqual } from "node:crypto";
import type { ProofRow } from "./geoCheck";

/** One real customer question, put to ChatGPT, and who its answer named. */
export type Facts = { name: string; phrase: string; place: string };
export type Ticket = { task: string; home: string; name: string; logo: string | null; domain: string; question: string; at: number };

const TICKET_MS = 10 * 60 * 1000;
// What a website says about itself goes into a question, so only plain words get through.
const plain = (v: unknown, max: number) => (typeof v === "string" ? v.normalize("NFKC").replace(/[^\p{L}\p{N} '&.-]/gu, " ").replace(/\s+/g, " ").trim().slice(0, max).trim() : "");

export function facts(data: unknown): Facts | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const name = plain(d.business_name, 80), phrase = plain(d.search_phrase, 48).toLowerCase().replace(/\b(?:best|maryland|md)\b/g, " ").replace(/\s+/g, " ").trim(), town = plain(d.town, 40), county = plain(d.county, 40);
  if (!phrase || phrase.split(" ").length > 6 || !(town || county)) return null;
  const place = town || (/county$/i.test(county) ? county : `${county} County`);
  return { name, phrase, place: place.replace(/\s*\b(?:MD|Maryland)$/i, "") };
}
export const question = (f: Facts) => `What are the best ${f.phrase} near ${f.place}, Maryland?`;

const sign = (body: string, key: string) => createHmac("sha256", key).update(`geo-check:${body}`).digest("base64url");
/** The visitor holds this while ChatGPT answers. It is signed, so only checks we started can be read back. */
export function seal(t: Ticket, key: string): string {
  const body = Buffer.from(JSON.stringify(t)).toString("base64url");
  return `${body}.${sign(body, key)}`;
}
export function unseal(token: unknown, key: string, now = Date.now()): Ticket | null {
  if (typeof token !== "string" || token.length > 3000) return null;
  const [body, mac, extra] = token.split(".");
  if (!body || !mac || extra !== undefined) return null;
  const a = Buffer.from(sign(body, key)), b = Buffer.from(mac);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const t = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as Ticket;
    return /^[a-zA-Z0-9-]{8,64}$/.test(t.task) && now - t.at < TICKET_MS && now >= t.at - 60_000 ? t : null;
  } catch {
    return null;
  }
}

const SUFFIX = /\b(?:llc|l l c|inc|incorporated|co|corp|corporation|company|ltd|the)\b/g;
const norm = (s: string) => s.normalize("NFKD").toLowerCase().replace(/['’`]/g, "").replace(/&/g, " and ").replace(/[^a-z0-9]+/g, " ").replace(SUFFIX, " ").replace(/\s+/g, " ").trim();
const host = (u: unknown) => {
  try {
    return typeof u === "string" ? new URL(/^https?:/i.test(u) ? u : `https://${u}`).hostname.replace(/^www\./, "").toLowerCase() : "";
  } catch {
    return "";
  }
};
const list = (v: unknown): Record<string, unknown>[] => (Array.isArray(v) ? v.slice(0, 60).filter((x) => x && typeof x === "object") : []);
const some = (names: string[], keep: number) => (names.length > keep ? `${names.slice(0, keep).join(", ")} and ${names.length - keep} more` : names.join(", "));

/** Reads one ChatGPT answer. Null when there is no answer to read. */
export function readAnswer(answer: unknown, t: { name: string; domain: string; question: string }): ProofRow[] | null {
  if (!answer || typeof answer !== "object") return null;
  const r = answer as Record<string, unknown>;
  const text = typeof r.text === "string" ? r.text.slice(0, 60_000) : "";
  if (text.length < 40) return null;
  const clean = (v: unknown) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, 80) : "");
  const pins = list(r.map).map((m) => ({ name: clean(m.name), host: host(m.websiteUrl) })).filter((m) => m.name);
  const named = [...pins, ...list(r.entities).filter((e) => e.type === "local_business").map((e) => ({ name: clean(e.name), host: "" }))].filter((b) => b.name).slice(0, 24);
  const same = (h: string) => Boolean(h) && (h === t.domain || h.endsWith(`.${t.domain}`));
  // A name made only of the question's own words would match any answer to it.
  const words = new Set(norm(t.question).split(" "));
  const own = norm(t.name), mine = own.split(" ").every((w) => words.has(w)) ? "" : own;
  const isMine = (name: string) => {
    const n = norm(name);
    return mine.length > 3 && (n === mine || ` ${n} `.includes(` ${mine} `) || (n.split(" ").length > 1 && ` ${mine} `.includes(` ${n} `) && !n.split(" ").every((w) => words.has(w))));
  };
  const me = (b: { name: string; host: string }) => same(b.host) || isMine(b.name);
  const sources = [...new Set([...list(r.citationPills), ...list(r.sources)].map((c) => host(c.url)).filter((h) => h && !/(?:^|\.)(?:chatgpt|openai)\.com$/.test(h)))];
  const cited = sources.some(same), pinned = pins.some(me);
  const said = named.some(me) || (mine.length > 3 && ` ${norm(text)} `.includes(` ${mine} `));
  const others: string[] = [];
  for (const b of named) if (!me(b) && !others.some((o) => norm(o) === norm(b.name) || ` ${norm(o)} `.includes(` ${norm(b.name)} `) || ` ${norm(b.name)} `.includes(` ${norm(o)} `))) others.push(b.name);
  const row = (label: string, value: string, found: boolean): ProofRow => ({ label, value, found });
  return [
    row("ChatGPT was asked", t.question, true),
    row("Named in the answer", said ? "Yes" : "No", said),
    row("Website cited", cited ? "Yes" : "No", cited),
    row("Shown on the map", pinned ? "Yes" : "No", pinned),
    row(said ? "Also named" : "Named instead", others.length ? some(others, 3) : "No one else", true),
    row("Sources it cited", sources.length ? some(sources, 3) : "None", true),
  ];
}
