import type { ProofRow } from "./geoCheck";

/** One real customer question, put to an AI search, and who its answer named. */
export type Facts = { name: string; phrase: string; place: string };
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

/** Null when there is no answer to read. */
export function readAnswer(data: unknown, pages: unknown, t: { name: string; domain: string; question: string }): ProofRow[] | null {
  const named = list((data as { businesses?: unknown } | null)?.businesses).map((b) => ({ name: typeof b.name === "string" ? b.name.replace(/\s+/g, " ").trim().slice(0, 80) : "", host: host(b.website) })).filter((b) => b.name).slice(0, 12);
  if (!named.length) return null;
  const same = (h: string) => Boolean(h) && (h === t.domain || h.endsWith(`.${t.domain}`));
  // A name made only of the question's own words would match any answer to it.
  const words = new Set(norm(t.question).split(" "));
  const own = norm(t.name), mine = own.split(" ").every((w) => words.has(w)) ? "" : own;
  const isMine = (name: string) => {
    const n = norm(name);
    return mine.length > 3 && (n === mine || ` ${n} `.includes(` ${mine} `) || (n.split(" ").length > 1 && ` ${mine} `.includes(` ${n} `) && !n.split(" ").every((w) => words.has(w))));
  };
  const me = (b: { name: string; host: string }) => same(b.host) || isMine(b.name);
  const sources = [...new Set((Array.isArray(pages) ? pages : []).slice(0, 40).map(host).filter(Boolean))];
  const said = named.some(me), cited = sources.some(same);
  const others = [...new Set(named.filter((b) => !me(b)).map((b) => b.name))];
  const row = (label: string, value: string, found: boolean): ProofRow => ({ label, value, found });
  return [
    row("AI was asked", t.question, true),
    row("Named in the answer", said ? "Yes" : "No", said),
    row(said ? "Also named" : "Named instead", others.length ? some(others, 3) : "No one else", true),
    row("Website used as a source", cited ? "Yes" : "No", cited),
    row("Sources it used", sources.length ? some(sources, 3) : "None listed", true),
  ];
}
