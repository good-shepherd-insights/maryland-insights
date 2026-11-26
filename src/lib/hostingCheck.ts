import { attr, scan, textOf, type Tag } from "./htmlScan";
import type { ProofRow } from "./geoCheck";
import type { ServerFacts } from "./serverFacts";

/** Reads a homepage as it was sent and as a browser shows it, and reports how it is built and served. */
const PLATFORM: Record<string, RegExp> = {
  WordPress: /\/wp-(?:content|includes)\//i, Wix: /static\.wixstatic\.com|static\.parastorage\.com/i, Squarespace: /static1?\.squarespace\.com|assets\.squarespace\.com/i,
  Shopify: /cdn\.shopify\.com\/s\/|\/cdn\/shop\/(?:t|files|products)\//i, Webflow: /assets(?:-global)?\.website-files\.com|cdn\.prod\.website-files\.com/i, "GoDaddy Website Builder": /img1\.wsimg\.com\/(?:blobby|isteam)/i,
  Duda: /(?:irp|lirp)\.cdn-website\.com|static\.cdn-website\.com/i, Weebly: /editmysite\.com/i, Joomla: /\/media\/(?:jui|system\/js)\//i, Drupal: /\/sites\/default\/files\//i, "HubSpot CMS": /\/hs-fs\/|hubspotusercontent/i,
  "Next.js": /\/_next\/static\//i, Astro: /\/_astro\//i, Nuxt: /\/_nuxt\//i, Gatsby: /\/page-data\/app-data\.json/i,
};
const ICON: Record<string, string> = {
  WordPress: "wordpress", Wix: "wix", Squarespace: "squarespace", Shopify: "shopify", Webflow: "webflow", "GoDaddy Website Builder": "godaddy", Joomla: "joomla", Drupal: "drupal", "HubSpot CMS": "hubspot",
  "Next.js": "nextjs", Astro: "astro", Nuxt: "nuxt", Gatsby: "gatsby",
  Vercel: "vercel", Netlify: "netlify", Cloudflare: "cloudflare", Fastly: "fastly", Akamai: "akamai", "Amazon Web Services": "aws", "Amazon CloudFront": "aws", "Amazon Route 53": "aws", "Google Cloud": "google-cloud",
  "WP Engine": "wp-engine", Kinsta: "kinsta", Hostinger: "hostinger", DigitalOcean: "digitalocean", "GitHub Pages": "github-pages", Render: "render", Pantheon: "pantheon", Namecheap: "namecheap", IONOS: "ionos", GoDaddy: "godaddy", nginx: "nginx", Apache: "apache",
};
export const iconFor = (name: string) => (ICON[name] ? `/images/hosting/${ICON[name]}.svg` : undefined);

type H = Record<string, string>;
const has = (h: H, key: string, re?: RegExp) => key in h && (!re || re.test(h[key]));
/** Who serves the site, from its own reply headers. Platforms that host their own sites count as the host. */
const HOSTS: [string, (h: H) => boolean][] = [
  ["Vercel", (h) => has(h, "x-vercel-id") || has(h, "server", /^vercel/i)],
  ["Netlify", (h) => has(h, "x-nf-request-id") || has(h, "server", /netlify/i)],
  ["WP Engine", (h) => has(h, "wpe-backend") || has(h, "x-powered-by", /wp engine/i)],
  ["Kinsta", (h) => has(h, "x-kinsta-cache") || has(h, "ki-cache-type")],
  ["Pantheon", (h) => has(h, "x-pantheon-styx-hostname")],
  ["Flywheel", (h) => has(h, "x-fw-hash") || has(h, "x-fw-serve")],
  ["SiteGround", (h) => has(h, "host-header", /^[0-9a-f]{32}$/i) || has(h, "x-sg-id")],
  ["Hostinger", (h) => has(h, "platform", /hostinger/i) || has(h, "x-hcdn-request-id")],
  ["GitHub Pages", (h) => has(h, "server", /^github\.com$/i)],
  ["Render", (h) => has(h, "rndr-id") || has(h, "x-render-origin-server")],
  ["DigitalOcean", (h) => has(h, "x-do-app-origin")],
  ["Squarespace", (h) => has(h, "server", /squarespace/i)],
  ["Wix", (h) => has(h, "x-wix-request-id") || has(h, "server", /pepyaka/i)],
  ["Shopify", (h) => has(h, "x-shopid") || has(h, "powered-by", /shopify/i)],
  ["GoDaddy", (h) => has(h, "server", /^DPS\//)],
  ["Amazon Web Services", (h) => has(h, "server", /^AmazonS3$|^awselb/i)],
  ["Google Cloud", (h) => has(h, "server", /^Google Frontend$/i)],
];
/** The network a site's traffic passes through on its way to visitors. */
const NETWORKS: [string, (h: H) => boolean][] = [
  ["Cloudflare", (h) => has(h, "cf-ray") || has(h, "server", /^cloudflare$/i)],
  ["Fastly", (h) => has(h, "x-fastly-request-id") || has(h, "x-served-by", /cache-/i)],
  ["Akamai", (h) => has(h, "server", /akamai/i) || has(h, "x-akamai-transformed")],
  ["Amazon CloudFront", (h) => has(h, "x-amz-cf-id") || has(h, "via", /cloudfront/i)],
  ["Vercel", (h) => has(h, "x-vercel-cache") || has(h, "x-vercel-id")],
  ["Netlify", (h) => has(h, "x-nf-request-id")],
  ["Google Cloud", (h) => has(h, "via", /\bgoogle\b/i)],
];
/** Who answers for the domain name, from its nameservers. */
const DNS: [string, RegExp][] = [
  ["Cloudflare", /\.ns\.cloudflare\.com$/], ["GoDaddy", /\.domaincontrol\.com$/], ["Amazon Route 53", /\.awsdns-\d+\./], ["Google Cloud", /\.googledomains\.com$|ns-cloud-[a-z]\d\.googledomains|\.google\.com$/],
  ["Namecheap", /registrar-servers\.com$/], ["IONOS", /\.ui-dns\.(?:com|org|de|biz)$/], ["Hostinger", /\.dns-parking\.com$|hostinger/], ["Squarespace", /squarespacedns\.com$/], ["Wix", /\.wixdns\.net$/],
  ["Network Solutions", /\.worldnic\.com$/], ["Bluehost", /\.bluehost\.com$/], ["HostGator", /\.hostgator\.com$/], ["DigitalOcean", /\.digitalocean\.com$/], ["Vercel", /\.vercel-dns\.com$/], ["Netlify", /\.nsone\.net$|netlify/],
  ["Microsoft Azure", /\.azure-dns\./], ["SiteGround", /\.siteground\.net$/], ["Shopify", /shopify/], ["Web.com", /\.register\.com$|\.web\.com$/], ["DNSimple", /dnsimple/], ["Wix", /wixdns/],
];
const OWN_NETWORK = new Set(["Squarespace", "Wix", "Shopify", "Vercel", "Netlify", "GitHub Pages", "WP Engine"]);
const first = <T,>(list: [string, T][], test: (t: T) => boolean) => list.find(([, t]) => test(t))?.[0] ?? "";
export const hostOf = (h: H) => first(HOSTS, (t) => t(h));
export const networkOf = (h: H) => first(NETWORKS, (t) => t(h));
export const dnsOf = (ns: string[]) => first(DNS, (re) => ns.some((n) => re.test(n.replace(/\.$/, ""))));
const serverName = (h: H) => /^nginx/i.test(h.server ?? "") ? "nginx" : /^apache/i.test(h.server ?? "") ? "Apache" : /litespeed/i.test(h.server ?? "") ? "LiteSpeed" : /^microsoft-iis/i.test(h.server ?? "") ? "Microsoft IIS" : "";
const GENERATOR: [string, RegExp][] = [["WordPress", /^wordpress\b/i], ["Wix", /^wix\.com/i], ["Squarespace", /^squarespace/i], ["Joomla", /^joomla/i], ["Drupal", /^drupal/i], ["Webflow", /^webflow/i], ["Duda", /^duda/i], ["HubSpot CMS", /^hubspot/i], ["GoDaddy Website Builder", /^starfield|go ?daddy/i]];
const some = (names: string[], keep: number) => (names.length > keep ? `${names.slice(0, keep).join(", ")} and ${names.length - keep} more` : names.join(", "));

const words = (text: string) => (text ? text.split(" ").length : 0);

export function checkHosting(raw: string, rendered: string, base: URL, server: ServerFacts = { headers: {}, ns: [], secureRedirect: null, ms: null }): ProofRow[] {
  const sent = scan(raw, true), shown = scan(rendered, true);
  const tags = shown.pieces.flatMap((p) => (p.tag && !p.tag.close ? [p.tag] : []));
  const of = (...names: string[]) => tags.filter((t) => names.includes(t.name));
  const row = (label: string, value: string, found = Boolean(value), none = "Not found", icon?: string): ProofRow => ({ label, value: value || none, found, ...(icon && value ? { icon } : {}) });
  const address = (t: Tag) => attr(t, "src") || attr(t, "href");
  const files = of("script", "link", "img", "source", "iframe").map(address).filter(Boolean);

  const before = words(textOf(scan(raw).pieces)), after = words(textOf(scan(rendered).pieces));
  const share = after ? Math.min(100, Math.round((before / after) * 100)) : 0;
  const insecure = of("script", "link", "img", "iframe").filter((t) => /^http:\/\//i.test(address(t)) && (t.name !== "link" || /stylesheet|icon|preload/i.test(attr(t, "rel")))).length;
  const generator = [...sent.pieces, ...shown.pieces].flatMap((p) => (p.tag?.name === "meta" && /^generator$/i.test(attr(p.tag, "name")) ? [attr(p.tag, "content").slice(0, 80)] : []));
  const platforms = [...new Set([...Object.entries(PLATFORM).filter(([, p]) => files.some((f) => p.test(f))).map(([n]) => n), ...GENERATOR.filter(([, re]) => generator.some((g) => re.test(g))).map(([n]) => n)])];
  const wpVersion = /^wordpress\s+(\d+\.\d+)/i.exec(generator.find((g) => /^wordpress\s+\d/i.test(g)) ?? "")?.[1];
  const builtWith = platforms.slice(0, 2).map((p) => (p === "WordPress" && wpVersion ? `WordPress ${wpVersion}` : p)).join(", ");
  const plugins = [...new Set(files.flatMap((f) => /\/wp-content\/plugins\/([\w.-]{1,80})\//i.exec(f)?.[1].toLowerCase() ?? []))];
  const site = base.hostname.replace(/^www\./, "");
  const hosts = new Set<string>();
  for (const t of of("script")) {
    try {
      const u = new URL(attr(t, "src"), base);
      if (attr(t, "src") && u.hostname !== site && !u.hostname.endsWith(`.${site}`)) hosts.add(u.hostname.replace(/^www\./, ""));
    } catch { /* not an address */ }
  }
  const images = of("img"), lazy = images.filter((t) => /^lazy$/i.test(attr(t, "loading")) || attr(t, "data-src")).length;
  const modern = of("img", "source").filter((t) => /\.(?:webp|avif)(?:[?\s,&]|$)|image\/(?:webp|avif)|(?:f_auto|format=(?:webp|avif|auto))/i.test(`${attr(t, "src")} ${attr(t, "srcset")} ${attr(t, "data-src")} ${attr(t, "type")}`)).length;
  const viewport = sent.pieces.some((p) => p.tag?.name === "meta" && /^viewport$/i.test(attr(p.tag, "name")) && /width\s*=\s*device-width|initial-scale\s*=\s*1/i.test(attr(p.tag, "content")));

  const h = server.headers, host = hostOf(h), dns = dnsOf(server.ns), web = serverName(h);
  // These platforms deliver every site through their own network.
  const network = networkOf(h) || (OWN_NETWORK.has(host) ? `${host}'s own` : "");
  const hostValue = host || (web ? `${web} server, company not shown` : "");
  const speed = server.ms === null ? "" : `${(server.ms / 1000).toFixed(server.ms < 1000 ? 2 : 1)} seconds`;
  return [
    row("Built with", builtWith, platforms.length > 0, "Not identified", iconFor(platforms[0] ?? "")),
    row("Hosted by", hostValue, Boolean(host || web), "Not identified", iconFor(host || web)),
    row("Delivery network", network, Boolean(network), "None in front", iconFor(networkOf(h) || host)),
    row("Domain name servers", dns || (server.ns[0] ? server.ns[0].replace(/\.$/, "") : ""), server.ns.length > 0, "Not found", iconFor(dns)),
    row("Server response", speed, server.ms !== null && server.ms < 800, "No reply"),
    row("Plain http", server.secureRedirect === null ? "" : server.secureRedirect ? "Sent to the secure address" : "Left unencrypted", server.secureRedirect === true, "No reply"),
    row("Sent as a page", after < 30 ? "" : share >= 70 ? "Readable before scripts run" : `${share}% readable before scripts run`, share >= 70),
    row("Mobile layout", viewport ? "Set" : ""),
    row("Secure files", insecure ? `${insecure} loaded without encryption` : "All encrypted", !insecure),
    row("Modern images", images.length === 0 ? "No images" : modern ? `${modern} of ${images.length}` : "", images.length === 0 || modern > 0),
    row("Delayed images", images.length === 0 ? "No images" : lazy ? `${lazy} of ${images.length}` : "", images.length === 0 || lazy > 0),
    row("Plugins seen", platforms.includes("WordPress") ? (plugins.length ? `${plugins.length}: ${some(plugins, 3)}` : "None on the homepage") : "Not a plugin site", true),
    row("Outside scripts", hosts.size ? `${hosts.size}: ${some([...hosts], 3)}` : "None", true),
  ];
}
