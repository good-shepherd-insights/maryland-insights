import { markdownify } from "@/lib/utils/textConverter";

export type Part = { kind: "p" | "list" | "other"; html: string; lead?: string; rest?: string; number?: string; items?: { lead?: string; rest: string }[] };

const inner = (html: string) => html.replace(/^<[^>]+>/, "").replace(/<\/[^>]+>\s*$/, "").trim();
const startsSentence = (s: string) => /^(<[^>]+>)*["“(]?[A-Z0-9]/.test(s);

/** Splits "**Lead.** The rest" so the lead can sit in its own column. Only when the rest reads on its own. */
function splitLead(html: string) {
  const m = html.match(/^<strong>([\s\S]*?)<\/strong>:?\s*([\s\S]*)$/);
  if (!m || !m[2]) return undefined;
  return { lead: m[1].trim(), rest: m[2].trim(), colon: /^<strong>[\s\S]*?<\/strong>:/.test(html) };
}

/** Breaks a markdown body into paragraphs and lists. Returns null when it holds anything more complex. */
export function bodyParts(body: string | undefined): { html: string; parts: Part[] | null } {
  const html = String(markdownify(body, true) ?? "");
  const blocks = html.match(/<(p|ul|ol)>[\s\S]*?<\/\1>/g) ?? [];
  const same = blocks.join("").replace(/\s+/g, "") === html.replace(/\s+/g, "");
  if (!same || /<(ul|ol)>[\s\S]*<(ul|ol)>[\s\S]*<\/\2>[\s\S]*<\/\1>/.test(blocks.find((b) => (b.match(/<(ul|ol)>/g) ?? []).length > 1) ?? "")) return { html, parts: null };
  const parts = blocks.map((block): Part => {
    if (block.startsWith("<p>")) {
      const text = inner(block);
      const numbered = text.match(/^<strong>(\d+)\.\s*([\s\S]*)$/);
      if (numbered) return { kind: "p", html: text, number: numbered[1], rest: `<strong>${numbered[2]}` };
      const split = splitLead(text);
      const ok = split && split.lead.length < 110 && (startsSentence(split.rest) || /[:.]$/.test(split.lead));
      return { kind: "p", html: text, lead: ok ? split!.lead + (split!.colon ? ":" : "") : undefined, rest: ok ? split!.rest : undefined };
    }
    const items = (block.match(/<li>[\s\S]*?<\/li>/g) ?? []).map((li) => {
      const text = inner(li);
      const split = splitLead(text);
      return split ? { lead: split.lead + (split.colon ? ":" : ""), rest: split.rest } : { rest: text };
    });
    return { kind: "list", html: block, items };
  });
  return { html, parts };
}

/** The numbers inside a published figure: "4.8s" is [4.8], "17-38%" is [17, 38], "Business hours" is []. */
export const figures = (value: string | undefined) => (String(value ?? "").match(/\d+(?:\.\d+)?/g) ?? []).map(Number);

const COUNTY: Record<string, string> = { "Baltimore City": "Baltimore City", "Baltimore County": "Baltimore County" };
/** "Howard County" on a page is "Howard" in the map data. */
export const mapName = (name: string) => COUNTY[name] ?? name.replace(/ County$/, "");
