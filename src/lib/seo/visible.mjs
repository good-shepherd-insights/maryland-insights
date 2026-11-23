import { serializeGraph } from "./graph.mjs";

// FAQ markup must match what visitors see. Checked against the finished HTML,
// so it holds for any section design, at build and per request. Each question
// must appear in <main> as whole words with its answer right after it.

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", rsquo: "'", lsquo: "'" };
const decode = (s) => s.replace(/&(?:#x([0-9a-f]{1,6})|#(\d{1,7})|([a-z]\w{1,30}));/gi, (m, hex, dec, name) => {
  if (hex || dec) { const n = parseInt(hex ?? dec, hex ? 16 : 10); return n <= 0x10ffff ? String.fromCodePoint(n) : " "; }
  const accented = /^([a-z])(acute|grave|uml|circ|tilde|cedil|ring|caron)$/i.exec(name);
  return NAMED[name.toLowerCase()] ?? (accented ? accented[1] : " "); // the rest are punctuation and spaces
});
const words = (s) => ` ${s.normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase().replace(/['’‘]/g, "").replace(/[^\p{L}\p{N}]+/gu, " ").trim()} `;

const SKIP = new Set(["script", "style", "template", "noscript", "svg"]);
const INLINE = new Set(["a", "abbr", "b", "cite", "code", "del", "em", "i", "ins", "kbd", "mark", "q", "s", "small", "strong", "sub", "sup", "u", "wbr"]);
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);
const TAG = /<!--|<(\/?)([a-z][a-z0-9-]*)((?:"[^"]*"|'[^']*'|[^"'>])*)>/gi;

/** Text inside <main>, without scripts, comments and `hidden` elements. */
export function mainText(html) {
  let out = "", last = 0, inMain = false, hidden = 0, m;
  const stack = [];
  TAG.lastIndex = 0;
  while ((m = TAG.exec(html))) {
    if (inMain && !hidden) out += html.slice(last, m.index);
    last = TAG.lastIndex;
    if (m[0] === "<!--") { const end = html.indexOf("-->", last); last = TAG.lastIndex = end < 0 ? html.length : end + 3; continue; }
    const name = m[2].toLowerCase();
    if (!m[1] && (name === "script" || name === "style")) {
      const end = html.toLowerCase().indexOf(`</${name}`, last);
      last = TAG.lastIndex = end < 0 ? html.length : end;
    }
    if (inMain && !hidden && !INLINE.has(name)) out += " ";
    if (m[1]) {
      const at = stack.findLastIndex((e) => e.name === name);
      if (at >= 0) for (const e of stack.splice(at)) { if (e.hides) hidden--; if (e.name === "main") inMain = false; }
    } else if (!VOID.has(name) && !m[3].endsWith("/")) {
      const hides = SKIP.has(name) || /(?:^|\s)hidden(?=[\s=]|$)/i.test(m[3].replace(/"[^"]*"|'[^']*'/g, '""'));
      stack.push({ name, hides });
      if (hides) hidden++;
      if (name === "main") inMain = true;
    }
  }
  return words(decode(out));
}

const GAP = 120; // characters allowed between a question and its answer
const isShown = (text, question, answer) => {
  const q = words(question), a = words(answer);
  if (!q.trim() || !a.trim()) return false;
  for (let at = text.indexOf(q); at >= 0; at = text.indexOf(q, at + 1)) {
    const end = at + q.length - 1;
    if (text.slice(end, end + GAP + a.length).includes(a)) return true;
  }
  return false;
};

const OPEN = '<script type="application/ld+json"';
/** Removes FAQ entries that are not shown on the page. */
export function keepVisibleFaqs(html, warn = console.warn) {
  const at = html.indexOf(OPEN);
  if (at < 0) return html;
  const start = html.indexOf(">", at) + 1, end = html.indexOf("</script>", start);
  const json = html.slice(start, end);
  if (!json.includes('"FAQPage"')) return html;
  const { "@graph": graph } = JSON.parse(json);
  const text = mainText(html);
  let dropped = 0;
  const kept = graph.filter((node) => {
    if (node["@type"] !== "FAQPage") return true;
    const before = node.mainEntity.length;
    node.mainEntity = node.mainEntity.filter((q) => isShown(text, q.name, q.acceptedAnswer.text));
    dropped += before - node.mainEntity.length;
    return node.mainEntity.length > 0;
  });
  if (!dropped) return html;
  warn(`FAQ markup: ${dropped} question(s) not shown on the page were left out`);
  return html.slice(0, start) + serializeGraph(kept) + html.slice(end);
}
