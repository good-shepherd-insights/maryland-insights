/** Splits a page into tags and text in one pass, so no page can make it slow. Pages come from anyone. */
export type Tag = { name: string; close: boolean; attrs: string; start: number; end: number; body?: string };
export type Piece = { tag: Tag; text?: undefined } | { tag?: undefined; text: string };

const MAX_HTML = 2_000_000;
const MAX_TAG = 300_000;
const MAX_ATTRS = 8_000;
const MAX_PIECES = 60_000;
const SKIP = new Set(["script", "style", "noscript", "svg", "template"]);

/** Where the tag that starts at `from` ends: past its ">", or where it plainly stopped being a tag. */
function tagEnd(html: string, from: number, max: number): number {
  const limit = Math.min(html.length, from + max);
  let quote = "";
  for (let i = from + 1; i < limit; i++) {
    const c = html[i];
    if (quote) {
      if (c === quote) quote = "";
    } else if (c === '"' || c === "'") {
      const before = html[i - 1];
      if (before === "=" || before === " " || before === "\n" || before === "\t" || before === "\r") quote = c;
    } else if (c === ">") return i + 1;
    else if (c === "<") return i;
  }
  return limit;
}

/** Only A to Z change, so every position still lines up with the page. */
const lowered = (s: string) => s.replace(/[A-Z]+/g, (c) => c.toLowerCase());

/** The page as it was, without its comments. */
export function dropComments(page: string): string {
  const html = page.slice(0, MAX_HTML), out: string[] = [];
  for (let i = 0; ; ) {
    const at = html.indexOf("<!--", i);
    if (at < 0) return out.join("") + html.slice(i);
    out.push(html.slice(i, at));
    const done = html.indexOf("-->", at + 4);
    if (done < 0) return out.join("");
    i = done + 3;
  }
}

/** Comments are always dropped. Scripts, styles and drawings are dropped unless the caller needs them. */
export function scan(page: string, keepScripts = false): { html: string; pieces: Piece[] } {
  const html = page.slice(0, MAX_HTML);
  const lower = lowered(html);
  // Every step moves past what it read, so long tags cannot be read twice.
  const pieces: Piece[] = [];
  let i = 0;
  while (i < html.length && pieces.length < MAX_PIECES) {
    const at = html.indexOf("<", i);
    if (at < 0) {
      pieces.push({ text: html.slice(i) });
      break;
    }
    if (at > i) pieces.push({ text: html.slice(i, at) });
    if (html.startsWith("<!--", at)) {
      const done = html.indexOf("-->", at + 4);
      if (done < 0) break;
      i = done + 3;
      continue;
    }
    const m = /^<(\/?)([a-z][a-z0-9-]{0,30})/.exec(lower.slice(at, at + 34));
    if (!m) {
      i = at + 1;
      continue;
    }
    const end = tagEnd(html, at, MAX_TAG), name = m[2], close = m[1] === "/";
    const tag: Tag = { name, close, attrs: html.slice(at + m[0].length, Math.min(html[end - 1] === ">" ? end - 1 : end, at + MAX_ATTRS)), start: at, end };
    i = end;
    if (!close && SKIP.has(name) && !/\/\s*$/.test(tag.attrs)) {
      const done = lower.indexOf(`</${name}`, end);
      if (keepScripts) pieces.push({ tag: { ...tag, body: name === "script" && done >= 0 ? html.slice(end, done) : undefined } });
      if (done < 0) break;
      const gt = lower.indexOf(">", done);
      if (gt < 0) break;
      i = gt + 1;
      continue;
    }
    pieces.push({ tag });
  }
  return { html, pieces };
}

const ENTITY: Record<string, string> = { amp: "&", nbsp: " ", quot: '"', apos: "'", rsquo: "’", lsquo: "‘", ndash: "–", mdash: "—", "#36": "$", "#39": "'", "#039": "'", "#8217": "’", "#160": " ", "#8211": "–" };
export const decode = (s: string) => s.replace(/&(#?\w{1,8});/g, (_, c: string) => ENTITY[c.toLowerCase()] ?? " ");
const squash = (s: string) => decode(s).replace(/\s+/g, " ").trim();

const parsed = new WeakMap<Tag, Map<string, string>>();
/** One attribute of a tag. Each tag is read once, and the first of a repeated name counts. */
export function attr(tag: Tag, name: string): string {
  let all = parsed.get(tag);
  if (!all) {
    all = new Map();
    const a = tag.attrs;
    for (let i = 0; i < a.length && all.size < 60; ) {
      const eq = a.indexOf("=", i);
      if (eq < 0) break;
      let end = eq;
      while (end > i && a.charCodeAt(end - 1) <= 32) end--;
      let start = end;
      while (start > i && end - start < 60 && /[\w:-]/.test(a[start - 1])) start--;
      const key = a.slice(start, end).toLowerCase();
      let v = eq + 1;
      while (v < a.length && a.charCodeAt(v) <= 32) v++;
      const q = a[v];
      let stop: number;
      if (q === '"' || q === "'") {
        stop = a.indexOf(q, v + 1);
        if (stop < 0) stop = a.length;
        if (key && !all.has(key)) all.set(key, decode(a.slice(v + 1, stop)));
        i = stop + 1;
      } else {
        stop = v;
        while (stop < a.length && a.charCodeAt(stop) > 32) stop++;
        if (key && !all.has(key)) all.set(key, decode(a.slice(v, stop)));
        i = Math.max(stop, eq + 1);
      }
    }
    parsed.set(tag, all);
  }
  return all.get(name) ?? "";
}

export function textOf(pieces: Piece[], max = 400_000): string {
  const out: string[] = [];
  let size = 0;
  for (const p of pieces) {
    if (p.text === undefined) continue;
    out.push(p.text);
    size += p.text.length;
    if (size > max) break;
  }
  return squash(out.join(" ")).slice(0, max);
}

export type Block = { tag: Tag; text: string; at: number; end: number };
/** Each element of the named kinds with its text. One that is never closed ends at the next of its kind. */
export function blocks(pieces: Piece[], names: string[], max = 300): Block[] {
  const want = new Set(names), open = new Map<string, { tag: Tag; parts: string[]; size: number; at: number }>(), out: Block[] = [];
  const finish = (name: string, end: number) => {
    const o = open.get(name);
    if (o) out.push({ tag: o.tag, text: squash(o.parts.join(" ")).slice(0, max), at: o.at, end });
    open.delete(name);
  };
  pieces.forEach((p, i) => {
    if (p.text !== undefined) {
      for (const o of open.values()) if (o.size < max * 2) {
        o.parts.push(p.text.slice(0, max * 2));
        o.size += p.text.length;
      }
    } else if (want.has(p.tag.name)) {
      finish(p.tag.name, i);
      if (!p.tag.close) open.set(p.tag.name, { tag: p.tag, parts: [], size: 0, at: i });
    }
  });
  for (const name of [...open.keys()]) finish(name, pieces.length);
  return out.sort((a, b) => a.at - b.at);
}
