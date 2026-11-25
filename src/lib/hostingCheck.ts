import { attr, scan, textOf, type Tag } from "./htmlScan";
import type { ProofRow } from "./geoCheck";

/** Reads a homepage as it was sent and as a browser shows it, and reports how it is built and served. */
const PLATFORM: Record<string, RegExp> = {
  WordPress: /\/wp-(?:content|includes)\//i, Wix: /static\.wixstatic\.com|static\.parastorage\.com/i, Squarespace: /static1?\.squarespace\.com|assets\.squarespace\.com/i,
  Shopify: /cdn\.shopify\.com\/s\/|\/cdn\/shop\/(?:t|files|products)\//i, Webflow: /assets(?:-global)?\.website-files\.com|cdn\.prod\.website-files\.com/i, "GoDaddy Website Builder": /img1\.wsimg\.com\/(?:blobby|isteam)/i,
  Duda: /(?:irp|lirp)\.cdn-website\.com|static\.cdn-website\.com/i, Weebly: /editmysite\.com/i, Joomla: /\/media\/(?:jui|system\/js)\//i, Drupal: /\/sites\/default\/files\//i, "HubSpot CMS": /\/hs-fs\/|hubspotusercontent/i,
  "Next.js": /\/_next\/static\//i, Astro: /\/_astro\//i, Nuxt: /\/_nuxt\//i, Gatsby: /\/page-data\/app-data\.json/i,
};
const words = (text: string) => (text ? text.split(" ").length : 0);

export function checkHosting(raw: string, rendered: string, base: URL): ProofRow[] {
  const sent = scan(raw, true), shown = scan(rendered, true);
  const tags = shown.pieces.flatMap((p) => (p.tag && !p.tag.close ? [p.tag] : []));
  const of = (...names: string[]) => tags.filter((t) => names.includes(t.name));
  const row = (label: string, value: string, found = Boolean(value), none = "Not found"): ProofRow => ({ label, value: value || none, found });
  const address = (t: Tag) => attr(t, "src") || attr(t, "href");
  const files = of("script", "link", "img", "source", "iframe").map(address).filter(Boolean);

  const before = words(textOf(scan(raw).pieces)), after = words(textOf(scan(rendered).pieces));
  const share = after ? Math.min(100, Math.round((before / after) * 100)) : 0;
  const insecure = of("script", "link", "img", "iframe").filter((t) => /^http:\/\//i.test(address(t)) && (t.name !== "link" || /stylesheet|icon|preload/i.test(attr(t, "rel")))).length;
  const platforms = Object.entries(PLATFORM).filter(([, p]) => files.some((f) => p.test(f))).map(([n]) => n);
  const plugins = new Set(files.flatMap((f) => /\/wp-content\/plugins\/([\w.-]{1,80})\//i.exec(f)?.[1].toLowerCase() ?? []));
  const site = base.hostname.replace(/^www\./, "");
  const hosts = new Set<string>();
  for (const t of of("script")) {
    try {
      const u = new URL(attr(t, "src"), base);
      if (attr(t, "src") && u.hostname !== site && !u.hostname.endsWith(`.${site}`)) hosts.add(u.hostname);
    } catch { /* not an address */ }
  }
  const images = of("img"), lazy = images.filter((t) => /^lazy$/i.test(attr(t, "loading")) || attr(t, "data-src")).length;
  const modern = of("img", "source").filter((t) => /\.(?:webp|avif)(?:[?\s,&]|$)|image\/(?:webp|avif)|(?:f_auto|format=(?:webp|avif|auto))/i.test(`${attr(t, "src")} ${attr(t, "srcset")} ${attr(t, "data-src")} ${attr(t, "type")}`)).length;
  const viewport = sent.pieces.some((p) => p.tag?.name === "meta" && /^viewport$/i.test(attr(p.tag, "name")) && /width\s*=\s*device-width/i.test(attr(p.tag, "content")));
  return [
    row("Built with", platforms.slice(0, 2).join(", "), platforms.length > 0, "Not identified"),
    row("Sent as a page", after < 30 ? "" : share >= 70 ? "Readable before scripts run" : `${share}% readable before scripts run`, share >= 70),
    row("Mobile layout", viewport ? "Set" : ""),
    row("Secure files", insecure ? `${insecure} loaded without encryption` : "All encrypted", !insecure),
    row("Modern images", images.length === 0 ? "No images" : modern ? `${modern} of ${images.length}` : "", images.length === 0 || modern > 0),
    row("Delayed images", images.length === 0 ? "No images" : lazy ? `${lazy} of ${images.length}` : "", images.length === 0 || lazy > 0),
    row("Plugins seen", platforms.includes("WordPress") ? `${plugins.size} on the homepage` : "Not a plugin site", true),
    row("Outside scripts", hosts.size ? `From ${hosts.size} ${hosts.size === 1 ? "company’s server" : "other servers"}` : "None", true),
  ];
}
