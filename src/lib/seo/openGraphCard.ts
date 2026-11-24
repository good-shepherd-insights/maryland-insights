// Draws a social card: the page's SEO title and description beside its own drawing.
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import CanvasKitInit from "canvaskit-wasm/full";
import sharp from "sharp";
import { navTile, type NavTone } from "@/lib/navTiles";

export type Card = { route: string; title: string; description: string; picture?: string };

const W = 1200, H = 630, PAD = 64, STRIP = 34;
const INK = "#121212";
const TONE: Record<NavTone, string> = { cream: "#FAF7F2", gold: "#FFC20E", white: "#FFFFFF", red: "#B8112B", sand: "#E9E1D2", ink: "#2A2825" };
const file = (...path: string[]) => readFileSync(join(process.cwd(), ...path));

const require = createRequire(join(process.cwd(), "package.json"));
let kit: ReturnType<typeof CanvasKitInit> | undefined;
const canvasKit = () => (kit ??= CanvasKitInit({ locateFile: (name: string) => require.resolve(`canvaskit-wasm/bin/full/${name}`) }));

/** Any picture as a PNG that fits the box. */
const fit = async (input: Buffer, width: number, height: number) => {
  const { data, info } = await sharp(input, { density: 144, limitInputPixels: false }).resize(Math.round(width), Math.round(height), { fit: "inside" }).png().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
};

const art = (name: string) => file("public", "images", "nav", `${name}.svg`);
// The county map, trimmed to its own shape so it fills the space it is given.
const map = (svg: string) => sharp(Buffer.from(svg), { density: 144 }).trim().png().toBuffer();

/** Titles already carry the brand in search; here the logo does. */
const headline = (title: string) => title.replace(/\s*[|\u2013\u2014-]\s*Maryland Insights\s*$/i, "").trim();

/** Whole sentences only, so a card never stops mid-thought. */
const whole = (text: string, fits: (t: string) => boolean) => {
  const sentences = text.match(/[^.!?]+[.!?]+(?=\s|$)|[^.!?]+$/g)?.map((s) => s.trim()) ?? [];
  for (let n = sentences.length; n > 0; n--) {
    const t = sentences.slice(0, n).join(" ");
    if (fits(t)) return t;
  }
  return "";
};

export async function drawCard(card: Card, mapSvg: string): Promise<Buffer> {
  const CK = await canvasKit();
  const fonts = CK.FontMgr.FromData(file("src/assets/fonts/bricolage-grotesque-latin-800-normal.ttf"), file("src/assets/fonts/inter-latin-500-normal.ttf"))!;
  const families = Array.from({ length: fonts.countFamilies() }, (_, i) => fonts.getFamilyName(i));
  const display = families.find((f) => /bricolage/i.test(f))!, body = families.find((f) => /inter/i.test(f))!;
  if (!display || !body) throw new Error(`Card fonts not found in: ${families.join(", ")}`);

  const surface = CK.MakeSurface(W, H)!;
  const canvas = surface.getCanvas();
  const color = (hex: string) => CK.parseColorString(hex);
  const rect = (x: number, y: number, w: number, h: number, fill: string) => {
    const paint = new CK.Paint();
    paint.setColor(color(fill));
    paint.setAntiAlias(true);
    canvas.drawRect(CK.XYWHRect(x, y, w, h), paint);
    paint.delete();
  };
  const poly = (points: number[], fill: string) => {
    const path = CK.Path.MakeFromSVGString(`M${points.map((v) => v.toFixed(2)).join(" ")}Z`)!;
    const paint = new CK.Paint();
    paint.setColor(color(fill));
    paint.setAntiAlias(true);
    canvas.drawPath(path, paint);
    paint.delete();
    path.delete();
  };
  const picture = async (input: Buffer, x: number, y: number, w: number, h: number, align = 0.5) => {
    const p = await fit(input, w, h);
    const image = CK.MakeImageFromEncoded(p.data)!;
    canvas.drawImage(image, Math.round(x + (w - p.width) * align), Math.round(y + (h - p.height) / 2));
    image.delete();
  };
  const text = (value: string, family: string, size: number, leading: number, width: number, tracking = 0) => {
    const style = new CK.ParagraphStyle({
      textStyle: { color: color(INK), fontFamilies: [family], fontSize: size, heightMultiplier: leading, letterSpacing: size * tracking, fontStyle: { weight: family === display ? CK.FontWeight.ExtraBold : CK.FontWeight.Medium } },
      textAlign: CK.TextAlign.Left,
    });
    const builder = CK.ParagraphBuilder.Make(style, fonts);
    builder.addText(value);
    const paragraph = builder.build();
    paragraph.layout(width);
    builder.delete();
    return paragraph;
  };

  rect(0, 0, W, H, "#FFFFFF");

  // Right panel.
  const [section, slug] = card.route.split("/").filter(Boolean);
  // A cover that cannot be read gives that post the plain card; the build goes on.
  const cover = section === "blog" && slug && card.picture ? await load(card.picture).catch((error) => console.warn(`Card for ${card.route}: ${error.message}`)) : undefined;
  const post = Boolean(cover);
  const panel = post ? 600 : card.route === "/" ? 560 : 420;
  const px = W - panel, ph = H - STRIP;
  const tile = navTile(card.route, 0);
  const tones = Object.values(TONE);
  if (post) {
    rect(px, 0, panel, ph, TONE.ink);
    await picture(cover!, px + 36, 36, panel - 72, ph - 72);
  } else if (tile.image) {
    rect(px, 0, panel, ph, TONE[tile.tone]);
    await picture(file("public", tile.image), px + 60, 60, panel - 120, ph - 120);
  } else if (card.route === "/services") {
    const names = ["local-seo", "aeo-optimization", "ai-powered-content", "analytics-reporting", "marketing-automation", "website-hosting"];
    for (const [i, name] of names.entries()) {
      const w = panel / 2, h = ph / 3, x = px + (i % 2) * w, y = Math.floor(i / 2) * h;
      rect(x, y, w, h, tones[i]);
      await picture(art(name), x + 36, y + 36, w - 72, h - 72);
    }
  } else if (card.route === "/") {
    rect(px, 0, panel, ph, TONE.cream);
    await picture(await map(mapSvg), px + 34, 40, panel - 68, ph - 80);
  } else {
    flag(rect, poly, px, 0, panel, ph, 6);
  }
  rect(px - 3, 0, 3, ph, INK);

  // Flag strip along the bottom.
  for (let x = 0, i = 0; x < W; x += 60, i++) {
    flag(rect, poly, x, H - STRIP, 60, STRIP, 2);
  }
  rect(0, H - STRIP - 3, W, 3, INK);

  // Left column: logo, title, description.
  const width = px - PAD - 48;
  await picture(file("public", "images", "logo.svg"), PAD, 48, 220, 70, 0);
  const top = 152, room = H - STRIP - 40 - top;
  const title = headline(card.title);
  let size = 72, heading = text(title, display, size, 1.04, width, -0.035);
  const longest = (s: number) => Math.max(...title.split(/\s+/).map((w) => { const p = text(w, display, s, 1, 4000, -0.035); const v = p.getMaxIntrinsicWidth(); p.delete(); return v; }));
  while (size > 36 && (heading.getHeight() > room * 0.62 || longest(size) > width)) {
    heading.delete();
    size -= 2;
    heading = text(title, display, size, 1.04, width, -0.035);
  }
  canvas.drawParagraph(heading, PAD, top);
  const left = room - heading.getHeight() - 24;
  for (const bodySize of [28, 26, 24]) {
    const copy = whole(card.description, (t) => { const p = text(t, body, bodySize, 1.36, width); const ok = p.getHeight() <= left; p.delete(); return ok; });
    if (!copy || (copy.length < card.description.trim().length && bodySize > 24)) continue;
    const p = text(copy, body, bodySize, 1.36, width);
    canvas.drawParagraph(p, PAD, top + heading.getHeight() + 24);
    p.delete();
    break;
  }
  heading.delete();

  surface.flush();
  const image = surface.makeImageSnapshot();
  const png = Buffer.from(image.encodeToBytes(CK.ImageFormat.PNG, 100)!);
  image.delete();
  surface.delete();
  fonts.delete();
  return png;
}

const load = async (url: string, tries = 3): Promise<Buffer> => {
  try {
    return await loadOnce(url);
  } catch (error) {
    if (tries <= 1) throw error;
    await new Promise((done) => setTimeout(done, 1000));
    return load(url, tries - 1);
  }
};
const loadOnce = async (url: string) => {
  const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!response.ok) throw new Error(`${url} answered ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
};

/** The Maryland flag's counterchanged bars. */
function flag(rect: (x: number, y: number, w: number, h: number, fill: string) => void, poly: (points: number[], fill: string) => void, x: number, y: number, w: number, h: number, bars: number) {
  const b = w / bars;
  for (let k = 0; k < bars; k++) {
    const [top, bottom] = k % 2 ? [TONE.gold, INK] : [INK, TONE.gold];
    const x0 = x + k * b, y1 = y + (h * k) / bars, y2 = y + (h * (k + 1)) / bars;
    rect(x0, y, b + 0.5, h, bottom);
    poly([x0, y, x0 + b, y, x0 + b, y2, x0, y1], top);
  }
}
