import { serializeGraph } from "./graph.mjs";

// FAQ markup must match what visitors see. Checked against the finished HTML,
// so it holds for any section design, at build and per request.

const ENTITIES = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
const decode = (s) => s.replace(/&(?:#x([0-9a-f]+)|#(\d+)|(\w+));/gi, (m, hex, dec, name) => {
  if (hex || dec) { const n = parseInt(hex ?? dec, hex ? 16 : 10); return n <= 0x10ffff ? String.fromCodePoint(n) : m; }
  return ENTITIES[name.toLowerCase()] ?? m;
});
const squash = (s) => s.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
const SCRIPT = /(<script type="application\/ld\+json"[^>]*>)([\s\S]*?)(<\/script>)/;

/** Removes FAQ entries whose question or answer is not in <main>. */
export function keepVisibleFaqs(html, warn = console.warn) {
  const script = html.match(SCRIPT);
  if (!script || !script[2].includes('"FAQPage"')) return html;
  const { "@graph": graph } = JSON.parse(script[2]);
  const main = html.match(/<main\b[^>]*>([\s\S]*)<\/main>/)?.[1] ?? "";
  const text = squash(decode(main.replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ").replace(/<[^>]+>/g, " ")));
  const shown = (v) => { const s = squash(v); return s !== "" && text.includes(s); };
  let dropped = 0;
  const kept = graph.filter((node) => {
    if (node["@type"] !== "FAQPage") return true;
    const before = node.mainEntity.length;
    node.mainEntity = node.mainEntity.filter((q) => shown(q.name) && shown(q.acceptedAnswer.text));
    dropped += before - node.mainEntity.length;
    return node.mainEntity.length > 0;
  });
  if (!dropped) return html;
  warn(`FAQ markup: ${dropped} question(s) not visible on the page were left out`);
  return html.replace(SCRIPT, (_, open, __, close) => `${open}${serializeGraph(kept)}${close}`);
}
