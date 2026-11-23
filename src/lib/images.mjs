// One place that understands image values from Sanity. A value may be:
//   a Sanity image field          {_type: "image", asset: {_ref}, alt, crop, hotspot}
//   a Sanity image address        https://cdn.sanity.io/images/<project>/<dataset>/...
//   a file in this repository     /images/blog/name.webp
const PROJECT = "089yj83f";
const DATASET = "production";
const REF = /^image-([A-Za-z0-9]+)-(\d+)x(\d+)-([a-z0-9]+)$/;
const FILE = /^([A-Za-z0-9]+)-(\d+)x(\d+)\.([a-z0-9]+)$/;

/** @returns {{kind:"sanity", url:string, width:number, height:number, svg:boolean, alt?:string, query:Record<string,string>} | {kind:"local", path:string, alt?:undefined} | undefined} */
export function parseImage(value) {
  if (typeof value === "string") {
    const v = value.trim();
    if (/^\/(?!\/)[^?#\s]+$/.test(v) && !v.includes("..")) return { kind: "local", path: v };
    let url;
    try { url = new URL(v); } catch { return undefined; }
    const file = url.pathname.match(new RegExp(`^/images/${PROJECT}/${DATASET}/([^/]+)$`))?.[1];
    const m = file?.match(FILE);
    if (url.protocol !== "https:" || url.hostname !== "cdn.sanity.io" || !m) return undefined;
    return { kind: "sanity", url: `https://cdn.sanity.io${url.pathname}`, width: +m[2], height: +m[3], svg: m[4] === "svg", query: {} };
  }
  const m = typeof value?.asset?._ref === "string" ? value.asset._ref.match(REF) : undefined;
  if (!m) return undefined;
  const [, id, w, h, ext] = m;
  const width = +w, height = +h, query = {};
  const c = value.crop;
  if (c && [c.left, c.right, c.top, c.bottom].every((n) => typeof n === "number" && n >= 0 && n < 1) && c.left + c.right < 1 && c.top + c.bottom < 1) {
    query.rect = [c.left * width, c.top * height, (1 - c.left - c.right) * width, (1 - c.top - c.bottom) * height].map(Math.round).join(",");
  }
  const f = value.hotspot;
  if (f && [f.x, f.y].every((n) => typeof n === "number" && n >= 0 && n <= 1)) { query["fp-x"] = String(f.x); query["fp-y"] = String(f.y); query.crop = "focalpoint"; }
  return { kind: "sanity", url: `https://cdn.sanity.io/images/${PROJECT}/${DATASET}/${id}-${w}x${h}.${ext}`, width, height, svg: ext === "svg", alt: value.alt?.trim?.() || undefined, query };
}

/** Address for meta tags and JSON-LD: a full URL, or a path on this site. */
export const imageAddress = (value) => {
  const image = parseImage(value);
  return image?.kind === "sanity" ? image.url : image?.path;
};

/** Resized address from Sanity's image CDN. Never enlarges. */
export function sanityUrl(image, { width, height, fit = "cover" }) {
  if (image.svg) return image.url;
  const { crop, "fp-x": x, "fp-y": y, ...rest } = image.query;
  const q = new URLSearchParams({ ...rest, w: String(Math.round(width)), auto: "format", q: "80" });
  if (fit === "cover" && height) {
    q.set("h", String(Math.round(height)));
    q.set("fit", "crop");
    if (crop) { q.set("crop", crop); q.set("fp-x", x); q.set("fp-y", y); }
  } else q.set("fit", "max");
  return `${image.url}?${q}`;
}
