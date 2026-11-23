import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { JSON_LD_ITEMS, PAGE_FIELDS, ROUTES, SITE_FIELDS } from "../src/lib/seo/contract.mjs";
import { buildHead, serializeGraph, sitemapEntries } from "../src/lib/seo/graph.mjs";
import { editorGuide } from "../src/lib/seo/guide.mjs";
import { validateAll, validatePage, validateSite } from "../src/lib/seo/validate.mjs";

const today = "2026-11-23";
const on = (type: string, extra = {}) => ({ _type: type, _key: type, enabled: true, ...extra });
const site = (): any => ({
  _id: "siteSettings", seoUrl: "https://site.test", socialLinks: ["https://x.com/site"],
  business: { streetAddress: "1 Main St", addressLocality: "Lanham", addressRegion: "MD", postalCode: "20706", addressCountry: "US", telephone: "+1-240-555-0100" },
  seo: {
    robotsTxt: "User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://site.test/sitemap-index.xml\n",
    notFoundTitle: "Page not found", notFoundDescription: "That page does not exist. Go back to the homepage to keep reading.",
    organization: { type: "Organization", name: "Site", description: "A company that does a specific thing for specific people.", logo: "/logo.svg" },
    website: { name: "Site", language: "en-US" },
  },
});
const service = (): any => ({
  _id: "servicePage-a", _type: "servicePage", title: "A", slug: "a", faqs: [{ question: "Why?", answer: "Because." }],
  seo: {
    title: "A service for Maryland", description: "A plain description of the service that is long enough to pass.", dateModified: "2026-10-14",
    jsonLd: [
      on("schemaWebPage", { pageType: "WebPage" }),
      on("schemaBreadcrumb", { items: [{ _key: "a", name: "Home", path: "/" }, { _key: "b", name: "A", path: "/services/a" }] }),
      on("schemaService", { name: "Service A", serviceType: "Consulting", description: "A plain description of the service that is long enough to pass." }),
      on("schemaFaq"),
    ],
  },
});
const post = (): any => ({
  _id: "blogPost-p", _type: "blogPost", title: "P", slug: "p", datePublished: "2026-04-13", byline: "Jo Doe", faqs: [],
  seo: {
    title: "A post about something", description: "A different description that is also long enough to pass the rule.",
    jsonLd: [
      on("schemaWebPage", { pageType: "ItemPage" }),
      on("schemaBreadcrumb", { items: [{ _key: "a", name: "Home", path: "/" }, { _key: "b", name: "P", path: "/blog/p" }] }),
      on("schemaArticle", { headline: "A post about something", image: "/p.png", authorType: "Organization" }),
    ],
  },
});
const problems = (doc: any, change: (d: any) => void) => { change(doc); return validatePage(doc, { today, baseUrl: "https://site.test" }).map((p) => `${p.path} ${p.message}`).join("\n"); };
const item = (d: any, type: string) => d.seo.jsonLd.find((i: any) => i._type === type);

describe("contract", () => {
  const walk = (fields: any, at: string): [string, any][] => Object.entries(fields).flatMap(([k, f]: any) => [[`${at}.${k}`, f], ...(f.fields ? walk(f.fields, `${at}.${k}`) : [])] as any);
  const all = [...walk(PAGE_FIELDS, "page"), ...walk(SITE_FIELDS, "site"), ...Object.entries(JSON_LD_ITEMS).flatMap(([n, i]) => walk(i.fields, n))];

  it.each(all)("%s explains itself to an editor", (_name, field) => {
    expect(field.description.length).toBeGreaterThan(5);
    expect(field.description).toMatch(/[.]$/);
  });
  it("docs/SEO.md is current (run npm run seo:docs)", () => {
    expect(readFileSync(path.resolve(__dirname, "../docs/SEO.md"), "utf8")).toBe(editorGuide());
  });
  it("every page passes seoId or notFound to Base", () => {
    const dir = path.resolve(__dirname, "../src/pages");
    const files = (readdirSync(dir, { recursive: true }) as string[]).filter((f) => f.endsWith(".astro"));
    for (const f of files) {
      const tag = readFileSync(path.join(dir, f), "utf8").match(/<Base\b[\s\S]*?\n?>\n/)?.[0];
      if (tag) expect(tag, f).toMatch(/seoId=|notFound/);
    }
  });
});

describe("valid data", () => {
  it("has no problems", () => {
    expect(validatePage(service(), { today })).toEqual([]);
    expect(validatePage(post(), { today })).toEqual([]);
    expect(validateSite(site(), { today })).toEqual([]);
  });
});

describe("page rules", () => {
  const cases: [string, () => any, (d: any) => void, RegExp][] = [
    ["missing seo", service, (d) => delete d.seo, /seo is required/],
    ["missing title", service, (d) => delete d.seo.title, /title is required/],
    ["long description", service, (d) => (d.seo.description = "x".repeat(161)), /161 characters/],
    ["short description", service, (d) => (d.seo.description = "Too short"), /at least 50/],
    ["HTML", service, (d) => (d.seo.title = "A <b>bold</b> title"), /not HTML/],
    ["Markdown", service, (d) => (d.seo.title = "A **bold** title"), /not Markdown/],
    ["placeholder", service, (d) => (d.seo.title = "A title for [your company]"), /placeholder/],
    ["misspelled field", service, (d) => (d.seo.descripton = "x"), /descripton is not a known field/],
    ["wrong type", service, (d) => (d.seo.noindex = "true"), /on or off/],
    ["impossible date", service, (d) => (d.seo.dateModified = "2026-02-31"), /real date/],
    ["future date", service, (d) => (d.seo.dateModified = "2027-01-01"), /future/],
    ["http canonical", service, (d) => (d.seo.canonical = "http://site.test/"), /https/],
    ["foreign canonical", service, (d) => (d.seo.canonical = "https://other.test/"), /another site/],
    ["unknown item", service, (d) => d.seo.jsonLd.push({ _type: "schemaNope", _key: "n" }), /unknown item type/],
    ["duplicate item", service, (d) => d.seo.jsonLd.push({ ...item(d, "schemaFaq"), _key: "z" }), /has 2 schemaFaq/],
    ["duplicate key", service, (d) => (d.seo.jsonLd[1]._key = "schemaWebPage"), /unique _key/],
    ["rich-text FAQ answer", service, (d) => (d.faqs[0].answer = { a: 1 }), /no question or answer/],
    ["prototype item type", service, (d) => d.seo.jsonLd.push({ _type: "constructor", _key: "c" }), /unknown item type/],
    ["own canonical", service, (d) => (d.seo.canonical = "https://site.test/services/a"), /own address/],
    ["Service off", service, (d) => (item(d, "schemaService").enabled = false), /schemaService must stay on/],
    ["date differs from page", service, (d) => (d.docModified = "2026-10-01"), /must match the "updated" date/],
    ["future post", post, (d) => (d.datePublished = "2027-01-01"), /in the future/],
    ["nested review type", post, (d) => d.seo.jsonLd.push(on("schemaCustom", { label: "Thing", json: '{"@type":"Thing","x":{"@type":["Review"]}}' })), /reviews or ratings/],
    ["missing slug", service, (d) => (d.slug = null), /slug is required/],
    ["no WebPage", service, (d) => d.seo.jsonLd.shift(), /needs a schemaWebPage/],
    ["WebPage off", service, (d) => (item(d, "schemaWebPage").enabled = false), /must stay on/],
    ["no Service", service, (d) => d.seo.jsonLd.splice(2, 1), /needs a schemaService/],
    ["bad option", service, (d) => (item(d, "schemaWebPage").pageType = "Webpage"), /must be one of/],
    ["trail not from home", service, (d) => (item(d, "schemaBreadcrumb").items[0].path = "/x"), /start at the homepage/],
    ["trail to another page", service, (d) => (item(d, "schemaBreadcrumb").items[1].path = "/services/b"), /end at this page/],
    ["FAQ without questions", service, (d) => (d.faqs = null), /shows no FAQ/],
    ["FAQ with empty answer", service, (d) => (d.faqs[0].answer = " "), /no question or answer/],
    ["person without name", post, (d) => (item(d, "schemaArticle").authorType = "Person"), /needs authorName/],
    ["author differs from byline", post, (d) => Object.assign(item(d, "schemaArticle"), { authorType: "Person", authorName: "Al" }), /match the byline/],
    ["post without date", post, (d) => delete d.datePublished, /publish date/],
    ["modified before published", post, (d) => (d.seo.dateModified = "2026-01-01"), /before the publish date/],
    ["custom bad JSON", post, (d) => d.seo.jsonLd.push(on("schemaCustom", { label: "Video", json: "{" })), /not valid JSON/],
    ["custom ratings", post, (d) => d.seo.jsonLd.push(on("schemaCustom", { label: "Video", json: '{"@type":"Product","aggregateRating":{}}' })), /aggregateRating/],
    ["custom reserved type", post, (d) => d.seo.jsonLd.push(on("schemaCustom", { label: "Org", json: '{"@type":"Organization"}' })), /its own field/],
    ["custom nested context", post, (d) => d.seo.jsonLd.push(on("schemaCustom", { label: "Video", json: '{"@type":"VideoObject","x":[{"@context":"y"}]}' })), /@context/],
  ];
  it.each(cases)("rejects: %s", (_n, make, change, message) => expect(problems(make(), change)).toMatch(message));
  it("does not reject legitimate text", () => {
    for (const title of ["What Is Coming Soon to Maryland Business Law", "Guide to SEO [Updated] for Agencies"]) expect(problems(service(), (d) => (d.seo.title = title))).toBe("");
    const d = service(); d.slug = "null-safety"; item(d, "schemaBreadcrumb").items[1].path = "/services/null-safety";
    expect(validatePage(d, { today })).toEqual([]);
    const s = site(); s.business.telephone = "+1 (240) 441-5259";
    expect(validateSite(s, { today })).toEqual([]);
  });
  it("allows a narrow query rule", () => {
    const s = site(); s.seo.robotsTxt += "User-agent: somebot\nDisallow: /*?utm_\n";
    expect(validateSite(s, { today })).toEqual([]);
  });
  it("a robots mistake does not cost other pages their markup", () => {
    const s = site(); s.seo.robotsTxt = "x";
    expect(validateSite(s, { today, everything: false })).toEqual([]);
    expect(validateSite(s, { today }).length).toBeGreaterThan(0);
  });
  it("rejects a byline that is not the organization", () => {
    expect(validatePage(post(), { today, orgName: "Site" }).map((p) => p.message).join()).toMatch(/use Person/);
  });
  it("a canonical must be a real page", () => {
    const d = service(); d.seo.canonical = "https://site.test/nope";
    expect(validatePage(d, { today, baseUrl: "https://site.test", paths: new Set(["/", "/services/a"]) }).map((p) => p.message).join()).toMatch(/not the address of a page/);
  });
  it("every problem says how to fix it", () => {
    const d = service(); d.seo = { jsonLd: [{}] };
    for (const p of validatePage(d, { today })) expect(p.help?.length).toBeGreaterThan(5);
  });
});

describe("site rules", () => {
  const cases: [string, (s: any) => void, RegExp][] = [
    ["crawl delay", (s) => (s.seo.robotsTxt += "Crawl-delay: 10\n"), /Crawl-delay/],
    ["two wildcard groups", (s) => (s.seo.robotsTxt += "User-agent: *\nAllow: /\n"), /exactly one/],
    ["query block", (s) => (s.seo.robotsTxt += "Disallow: /*?*\n"), /blocks images/],
    ["blocks everyone", (s) => (s.seo.robotsTxt = "User-agent: *\nDisallow: /\nSitemap: https://site.test/sitemap-index.xml"), /blocks search engines/],
    ["wildcard block", (s) => (s.seo.robotsTxt = s.seo.robotsTxt.replace("Allow: /", "Disallow: /*")), /blocks search engines/],
    ["bare query block", (s) => (s.seo.robotsTxt += "Disallow: *?*\n"), /blocks images/],
    ["star-slash block", (s) => (s.seo.robotsTxt = s.seo.robotsTxt.replace("Allow: /", "Disallow: */")), /blocks search engines/],
    ["blocks Google", (s) => (s.seo.robotsTxt += "User-agent: Googlebot\nDisallow: /\n"), /blocks search engines/],
    ["no sitemap", (s) => (s.seo.robotsTxt = "User-agent: *\nAllow: /\n"), /needs: Sitemap/],
    ["bad phone", (s) => (s.business.telephone = "240-555"), /country code/],
    ["bad profile", (s) => s.socialLinks.push("x.com/a"), /full https/],
    ["no organization", (s) => delete s.seo.organization, /organization is required/],
  ];
  it.each(cases)("rejects: %s", (_n, change, message) => { const s = site(); change(s); expect(validateSite(s, { today }).map((p) => `${p.path} ${p.message}`).join("\n")).toMatch(message); });
  it("rejects repeated titles and missing singletons", () => {
    const a = service(), b = service(); b._id = "servicePage-b"; b.slug = "b";
    const text = validateAll(site(), [a, b], { today }).map((p) => `${p.path} ${p.message}`).join("\n");
    expect(text).toMatch(/seo.title is the same as servicePage-a/);
    expect(text).toMatch(/home document is missing/);
    expect(text).toMatch(/\/services\/b/);
  });
});

describe("output", () => {
  const head = (d: any) => buildHead(d, site(), { toText: (s: string) => s });
  it("prints only Sanity values, linked together", () => {
    const { graph, canonical } = head(service());
    expect(canonical).toBe("https://site.test/services/a");
    expect(graph.map((n: any) => n["@type"])).toEqual(["Organization", "WebSite", "WebPage", "BreadcrumbList", "Service", "FAQPage"]);
    const ids = new Set(graph.map((n: any) => n["@id"]));
    JSON.stringify(graph, (k, v) => { if (v && typeof v === "object" && Object.keys(v).length === 1 && v["@id"]) expect(ids.has(v["@id"])).toBe(true); return v; });
  });
  it("leaves out empty facts and switched-off items", () => {
    const d = service(); item(d, "schemaFaq").enabled = false;
    const { graph } = head(d);
    expect(JSON.stringify(graph)).not.toMatch(/FAQPage|legalName|null/);
  });
  it("cannot break out of the script tag and keeps values intact", () => {
    const out = serializeGraph([{ "@type": "Thing", name: "</script><!-- & \" '" }]);
    expect(out).not.toMatch(/<\/script|<!--/);
    expect(JSON.parse(out)["@graph"][0].name).toBe("</script><!-- & \" '");
  });
  it("keeps noindex pages out of the sitemap and dates only known pages", () => {
    const hidden = post(); hidden.seo.noindex = true;
    const map = sitemapEntries([service(), hidden], "https://site.test");
    expect(map.get("https://site.test/services/a")).toEqual({ noindex: false, lastmod: "2026-10-14" });
    expect(map.get("https://site.test/blog/p")!.noindex).toBe(true);
  });
  it("covers every route type", () => expect(Object.keys(ROUTES).length).toBe(12));
});
