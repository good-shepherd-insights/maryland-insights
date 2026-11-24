// Puts a service's own illustration straight onto a colored band: crops the file
// to its drawing and swaps only the colors that would disappear on that band.
const files = import.meta.glob("/public/images/services/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;
const drawings = import.meta.glob("./drawings/*.svg", { query: "?raw", import: "default", eager: true }) as Record<string, string>;

const BOX: Record<string, [number, number, number, number]> = {
  "website-hosting": [59, 180, 905, 665],
  "aeo-optimization": [47, 101, 931, 789],
  "local-seo": [51, 68, 910, 845],
  "analytics-reporting": [78, 231, 867, 548],
  "marketing-automation": [0, 259, 1018, 506],
  "ai-powered-content": [53, 78, 928, 876],
};
const HEIGHT: Record<string, number> = { "website-hosting": 88, "aeo-optimization": 88, "local-seo": 96, "analytics-reporting": 82, "marketing-automation": 74, "ai-powered-content": 96 };
const INK = "#121212";

export function serviceIcon(image: unknown, tone: string, label: string): string | undefined {
  if (typeof image !== "string") return;
  const name = image.split("/").pop()?.replace(/\.svg$/, "") ?? "";
  const raw = files[`/public${image}`];
  const box = BOX[name];
  if (!raw || !box) return;
  const base = tone === "ink" || tone === "red" ? "#fff" : INK;
  const paths = [...raw.matchAll(/<path\b[^>]*>/g)].map(([tag], i) => {
    const d = /\sd="([^"]+)"/.exec(tag)?.[1];
    if (!d) return "";
    let fill = /fill="([^"]+)"/.exec(tag)?.[1] ?? base;
    const red = /^#[CD][0-9A-F]1/i.test(fill);
    const gold = /^#F[BDE][AB]/i.test(fill);
    if (tone === "red" && red) fill = INK;
    if (tone === "red" && name === "analytics-reporting" && i === 2) fill = INK;
    if (tone === "gold" && gold) fill = "#fff";
    const extra = ["transform", "fill-rule"].map((a) => new RegExp(`${a}="([^"]+)"`).exec(tag)).filter(Boolean).map((m) => ` ${m![0]}`).join("");
    return `<path d="${d}" fill="${fill}"${extra}></path>`;
  });
  const h = HEIGHT[name], w = Math.round((h * box[2]) / box[3]);
  return `<svg viewBox="${box.join(" ")}" width="${w}" height="${h}" role="img" aria-label="${label.replace(/[&<>"]/g, "")}">${paths.join("")}</svg>`;
}
export const drawing = (slug: string, kind: "wide" | "narrow"): string | undefined => drawings[`./drawings/${slug}-${kind}.svg`];
