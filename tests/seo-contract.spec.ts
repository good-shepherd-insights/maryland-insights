import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isDataError } from "../src/lib/broken";
import { markdownify, slugify } from "../src/lib/utils/textConverter";
import { buildFault, onUnhandled } from "../src/lib/brokenLimit.mjs";
import { imageAddress, parseImage, sanityUrl } from "../src/lib/images.mjs";
import { DEFAULT_FIELDS, JSON_LD_ITEMS, PAGE_FIELDS, ROUTES, SITE_FIELDS, isRepeatable, overrideId } from "../src/lib/seo/contract.mjs";
import { buildHead, serializeGraph, sitemapEntries } from "../src/lib/seo/graph.mjs";
import { editorGuide } from "../src/lib/seo/guide.mjs";
import { plainify } from "../src/lib/utils/plainify.mjs";
import { clip, findFaqs, lastChanged, resolveAll } from "../src/lib/seo/resolve.mjs";
import { RESERVED, pickPages } from "../src/lib/seo/pages.mjs";
import { keepVisibleFaqs } from "../src/lib/seo/visible.mjs";

const today = "2026-11-23";
const item = (_type: string, rest = {}) => ({ _type, _key: _type, ...rest });
const crumbs = (...p: [string, string][]) => item("schemaBreadcrumb", { parents: [["Home", "/"], ...p].map(([name, path]) => ({ _key: path, name, path })) });
const entry = (docType: string, ...items: any[]) => ({ _key: docType, docType, title: "{title} | Site", description: "{description}", jsonLd: [item("schemaWebPage", { pageType: "WebPage" }), ...items] });
const text = (s: string) => `${s} gives Maryland agencies a plain description that is long enough to use.`;
const page = (_type: string, slug?: string, rest = {}): any => ({ _id: slug ? `${_type}-${slug}` : _type, _type, title: `Page ${slug ?? _type}`, description: text(slug ?? _type), ...(slug ? { slug: { current: slug } } : {}), ...rest });
const faq = (q: string, a = "Because.") => ({ _type: "faqItem", question: q, answer: a });

const world = (): any => ({
  site: {
    seoUrl: "https://site.test", socialLinks: ["https://x.com/site"],
    business: { streetAddress: "1 Main St", addressLocality: "Lanham", addressRegion: "MD", postalCode: "20706", addressCountry: "US", telephone: "+1 (240) 555-0100" },
    seo: {
      _id: "seo-site", robotsTxt: "User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: https://site.test/sitemap-index.xml\n",
      notFoundTitle: "Page not found", notFoundDescription: text("Nothing here"),
      organization: { type: "Organization", name: "Site", description: text("Site"), logo: "/logo.svg", areaServed: [{ _key: "a", type: "State", name: "Maryland" }] },
      website: { name: "Site", language: "en-US" },
      defaults: Object.keys(ROUTES).map((t) => t === "home" ? entry(t, item("schemaFaq"))
        : t === "servicePage" ? entry(t, crumbs(["Services", "/services"]), item("schemaService", { serviceType: "{title}" }), item("schemaFaq"))
        : t === "blogPost" ? entry(t, crumbs(["Blog", "/blog"]), item("schemaArticle"), item("schemaFaq"))
        : entry(t, crumbs(), item("schemaFaq"))),
    },
  },
  pages: Object.keys(ROUTES).map((t) => isRepeatable(t) ? page(t, `${t.toLowerCase()}-one`, t === "blogPost" ? { date: "2026-04-13", author: { name: "Site" }, image: "/images/p.png" } : {}) : page(t)),
  overrides: [], faqDocs: [],
});
const run = (change: (w: any) => void = () => {}, options = {}) => { const w = world(); change(w); return { w, ...resolveAll(w, { today, toText: plainify, ...options }) }; };
const lines = (ps: any[]) => ps.map((p) => `${p.path} ${p.message}`).join("\n");
const find = (r: any, id: string) => r.pages.find((p: any) => p.doc._id === id);
const types = (r: any, id: string) => buildHead(find(r, id), r.w.site).graph.map((n: any) => n["@type"]);
const svc = "servicePage-servicepage-one", post = "blogPost-blogpost-one";
const override = (id: string, fields: any) => (w: any) => w.overrides.push({ _id: overrideId(id), _type: "pageSeo", page: {}, ...fields });

const html = (main: string, qs: [string, string][]) => `<html><head><script type="application/ld+json">${serializeGraph([{ "@type": "WebPage" }, { "@type": "FAQPage", mainEntity: qs.map(([name, t]) => ({ "@type": "Question", name, acceptedAnswer: { "@type": "Answer", text: t } })) }])}</script></head><body><main id="m">${main}</main></body></html>`;

describe("contract", () => {
  const walk = (fields: any, at: string): [string, any][] => Object.entries(fields).flatMap(([k, f]: any) => [[`${at}.${k}`, f], ...(f.fields ? walk(f.fields, `${at}.${k}`) : [])] as any);
  it.each([...walk(PAGE_FIELDS, "override"), ...walk(SITE_FIELDS, "site"), ...walk(DEFAULT_FIELDS, "default"), ...Object.entries(JSON_LD_ITEMS).flatMap(([n, i]) => walk(i.fields, n))])("%s explains itself to an editor", (_n, f) => expect(f.description).toMatch(/.{5,}\.$/));
  it("docs/SEO.md is current (run npm run seo:docs)", () => expect(readFileSync(path.resolve(__dirname, "../docs/SEO.md"), "utf8")).toBe(editorGuide()));
  it("every page route is in ROUTES, and every entry has a page", () => {
    const dir = path.resolve(__dirname, "../src/pages");
    const routes = new Set<string>();
    for (const f of (readdirSync(dir, { recursive: true }) as string[]).filter((f) => f.endsWith(".astro"))) {
      const src = readFileSync(path.join(dir, f), "utf8");
      if (f === "404.astro") { expect(src).toMatch(/<Base\b[^>]*\bnotFound\b/); continue; }
      if (!/<Base\b/.test(src)) { expect(src, `${f} must render Base or redirect`).toMatch(/Astro\.redirect\(/); continue; }
      expect(src, `${f} must pass seoId`).toMatch(/<Base\b[^]*?seoId=/);
      routes.add(`/${f.replace(/\.astro$/, "").replace(/(^|\/)index$/, "").replace(/\[\w+\]/, "{slug}")}`);
    }
    expect([...routes].sort()).toEqual(Object.values(ROUTES).sort());
  });
});

describe("a new page needs no SEO work", () => {
  it.each(Object.keys(ROUTES).filter(isRepeatable))("%s", (t) => {
    const r = run((w) => w.pages.push(page(t, "brand-new", { faqs: [faq("New?")], ...(t === "blogPost" ? { date: "2026-11-01", image: "/images/n.png" } : {}) })));
    expect(lines([...r.stop, ...r.report])).toBe("");
    const p = find(r, `${t}-brand-new`), head = buildHead(p, r.w.site);
    expect(head.title).toBe("Page brand-new | Site");
    expect(head.noindex).toBe(false);
    expect(head.canonical).toBe(`https://site.test${ROUTES[t as keyof typeof ROUTES].replace("{slug}", "brand-new")}`);
    expect(head.graph.map((n: any) => n["@type"])).toEqual(expect.arrayContaining(["Organization", "WebSite", "WebPage", "BreadcrumbList", "FAQPage"]));
    const trail = head.graph.find((n: any) => n["@type"] === "BreadcrumbList").itemListElement;
    expect(trail.at(-1).item).toBe(head.canonical);
  });
  it("500 new pages at once, quickly", () => {
    const start = performance.now();
    const r = run((w) => { for (let i = 0; i < 500; i++) w.pages.push(page("servicePage", `s-${i}`, { faqs: [faq(`Q${i}?`)] })); });
    for (const p of r.pages) buildHead(p, r.w.site);
    expect(lines([...r.stop, ...r.report])).toBe("");
    expect(r.pages.length).toBe(512);
    expect(performance.now() - start).toBeLessThan(2000);
  });
  it("finds FAQs in a section design that does not exist yet, and in linked documents", () => {
    expect(findFaqs({ a: [{ _type: "futureSection", deep: { list: [faq("A?")] } }, { _ref: "f1" }, { _ref: "f1" }] }, [{ _id: "f1", items: [faq("B?"), faq(" a? ")] }]).map((f: any) => f.question)).toEqual(["A?", "B?"]);
  });
});

describe("one bad page never affects another", () => {
  const bad: [string, any][] = [
    ["no title", { title: undefined }], ["no description", { description: undefined }], ["empty after formatting", { title: "***" }],
    ["title is an object", { title: { x: 1 } }], ["description is a list", { description: [1] }], ["placeholder title", { title: "TBD" }],
  ];
  it.each(bad)("%s: kept out of search, reported, build continues", (_n, fields) => {
    const r = run((w) => w.pages.push({ ...page("servicePage", "bad"), ...fields }));
    expect(r.stop).toEqual([]);
    expect(r.report.length).toBeGreaterThan(0);
    const p = find(r, "servicePage-bad"), head = buildHead(p, r.w.site);
    expect(head.noindex).toBe(true);
    expect(head.graph).toEqual([]);
    expect(typeof head.title).toBe("string");
    if (p.route) expect(sitemapEntries(r.pages, "https://site.test").get(`https://site.test${p.route}`)!.exclude).toBe(true);
    expect(types(r, svc)).toContain("Service");
  });
  const unpublished: [string, any][] = [["no slug", undefined], ["null slug", null], ["slash", { current: "a/b" }], ["dots", { current: ".." }], ["percent", { current: "100%" }], ["spaces", { current: "a b?c" }], ["backslash", { current: "a\\b" }], ["number", { current: 5 }], ["huge", { current: "x".repeat(151) }], ["copy of another page", { current: "servicepage-one" }], ["same but capitals", { current: "SERVICEPAGE-ONE" }]];
  it.each(unpublished)("bad address (%s): not published, reported, others unaffected", (_n, slug) => {
    const r = run((w) => w.pages.push({ ...page("servicePage", "bad"), slug, _createdAt: "2027", description: undefined }));
    expect(r.stop).toEqual([]);
    expect(lines(r.report)).toMatch(/was not published/);
    expect(find(r, "servicePage-bad")).toBeUndefined();
    expect(sitemapEntries(r.pages, "https://site.test").get("https://site.test/services/servicepage-one")!.exclude).toBe(false);
  });
  it("a page can never take over a fixed page or site path", () => {
    for (const slug of ["contact", "about", "Blog", "faqs", ...RESERVED].filter((x) => /^[a-z0-9-]+$/i.test(x))) {
      const { routes, refused } = pickPages([{ ...page("legalPage", slug), _createdAt: "2000" }, ...Object.keys(ROUTES).filter((t) => !isRepeatable(t)).map((t) => ({ ...page(t), _createdAt: "2026" }))]);
      expect(refused.length, slug).toBe(1);
      expect(routes.has("contactPage")).toBe(true);
    }
  });
  it("RESERVED covers every page folder and public folder", () => {
    const top = (d: string) => readdirSync(path.resolve(__dirname, d)).map((f) => f.replace(/\..*$/, "")).filter((f) => /^[a-z0-9-]+$/i.test(f) && !["index", ...Object.values(ROUTES).map((r) => r.slice(1))].includes(f));
    for (const f of [...top("../src/pages"), ...readdirSync(path.resolve(__dirname, "../public"), { withFileTypes: true }).filter((d) => d.isDirectory() && /^[a-z0-9-]+$/i.test(d.name)).map((d) => d.name)]) expect(RESERVED.has(f), f).toBe(true);
  });
  it.each(["/\\[", "/\\", "/a\\b"])("hostile image path %s never throws", (bad) => {
    const r = run((w) => { override(svc, { ogImage: bad })(w); w.pages.find((p: any) => p._id === post).image = bad; });
    expect(r.stop).toEqual([]); expect(r.report.length).toBe(2);
  });
  it("deeply nested or huge values are refused quickly", () => {
    const start = performance.now();
    const r = run((w) => { override(svc, { title: "[your ".repeat(50000), description: "<a".repeat(100000), jsonLd: [item("schemaCustom", { label: "Deep", json: "[".repeat(20000) })] })(w); Object.assign(w.pages.find((p: any) => p._id === post), { title: "<".repeat(200000), description: "[insert ".repeat(50000) }); });
    expect(r.stop).toEqual([]); expect(performance.now() - start).toBeLessThan(1000);
    const t = performance.now();
    keepVisibleFaqs(html("<div a=\"".repeat(20000) + "&".repeat(50000) + "<!--".repeat(20000), [["Q?", "A."]]), () => {});
    expect(performance.now() - t).toBeLessThan(1500);
  });
  it("odd values never throw", () => {
    for (const junk of [null, 5, "x", [], {}, [[null]], { _type: "constructor" }]) {
      const r = run((w) => { w.pages.push({ ...page("blogPost", "junk"), date: junk, author: junk, image: junk, faqs: junk, dateModified: junk, seo: junk }); override(svc, { jsonLd: junk, title: junk, noindex: junk, canonical: junk, dateModified: junk, bogus: junk })(w); w.overrides.push({ _id: "seo-x", jsonLd: [junk] }); });
      expect(r.stop).toEqual([]);
      for (const p of r.pages) buildHead(p, r.w.site);
    }
  });
});

describe("overrides", () => {
  it("replace only what they set", () => {
    const r = run(override(svc, { title: "A better title here", jsonLd: [item("schemaService", { serviceType: "Consulting" }), item("schemaFaq", { enabled: false })] }));
    expect(lines(r.report)).toBe("");
    const head = buildHead(find(r, svc), r.w.site);
    expect(head.title).toBe("A better title here");
    expect(head.description).toBe(text("servicepage-one"));
    expect(head.graph.find((n: any) => n["@type"] === "Service")).toMatchObject({ serviceType: "Consulting", areaServed: [{ name: "Maryland" }], provider: { "@id": "https://site.test/#organization" } });
  });
  const cases: [string, any, RegExp][] = [
    ["long description", { description: "x".repeat(161) }, /161 characters/], ["short description", { description: "Too short" }, /at least 50/],
    ["HTML", { title: "A <b>bold</b> title" }, /not HTML/], ["Markdown", { title: "A **bold** title" }, /not Markdown/], ["placeholder", { title: "A title for [your company]" }, /placeholder/],
    ["misspelled field", { descripton: "x" }, /descripton is not a known field/], ["wrong type", { noindex: "true" }, /on or off/],
    ["impossible date", { dateModified: "2026-02-31" }, /real date/], ["future date", { dateModified: "2027-01-01" }, /future/],
    ["http canonical", { canonical: "http://site.test/" }, /https/], ["foreign canonical", { canonical: "https://other.test/" }, /another site/],
    ["own canonical", { canonical: "https://site.test/services/servicepage-one" }, /own address/], ["dead canonical", { canonical: "https://site.test/nope" }, /not the address/],
    ["unknown item", { jsonLd: [item("schemaNope")] }, /unknown item type/], ["prototype item", { jsonLd: [item("constructor")] }, /unknown item type/],
    ["repeated item", { jsonLd: [item("schemaFaq"), { ...item("schemaFaq"), _key: "b" }] }, /repeats schemaFaq/], ["WebPage off", { jsonLd: [item("schemaWebPage", { enabled: false })] }, /not a known field|cannot be switched off/],
    ["bad option", { jsonLd: [item("schemaWebPage", { pageType: "Webpage" })] }, /must be one of/],
    ["trail not from home", { jsonLd: [item("schemaBreadcrumb", { parents: [{ _key: "a", name: "X", path: "/services" }] })] }, /start at the homepage/],
    ["trail to nowhere", { jsonLd: [item("schemaBreadcrumb", { parents: [{ _key: "h", name: "Home", path: "/" }, { _key: "a", name: "X", path: "/nope" }] })] }, /not a page/],
    ["unknown token", { jsonLd: [item("schemaService", { serviceType: "{titel}" })] }, /uses \{titel\}/],
    ["custom bad JSON", { jsonLd: [item("schemaCustom", { label: "Video", json: "{" })] }, /not valid JSON/],
    ["custom ratings", { jsonLd: [item("schemaCustom", { label: "Video", json: '{"@type":"Product","aggregateRating":{}}' })] }, /aggregateRating/],
    ["custom nested review", { jsonLd: [item("schemaCustom", { label: "Thing", json: '{"@type":"Thing","x":{"@type":["Review"]}}' })] }, /reviews or ratings/],
    ["custom reserved", { jsonLd: [item("schemaCustom", { label: "Org", json: '{"@type":"Organization"}' })] }, /its own field/],
    ["custom context", { jsonLd: [item("schemaCustom", { label: "Video", json: '{"@type":"VideoObject","x":[{"@context":"y"}]}' })] }, /@context/],
  ];
  it.each(cases)("reports and ignores: %s", (_n, fields, message) => {
    const r = run(override(svc, fields));
    expect(r.stop).toEqual([]);
    expect(lines(r.report)).toMatch(message);
    for (const p of r.report) expect(p.help.length).toBeGreaterThan(5);
    const head = buildHead(find(r, svc), r.w.site);
    expect(head.title).toBe("Page servicepage-one | Site");
    expect(head.canonical).toBe("https://site.test/services/servicepage-one");
    expect(head.noindex).toBe(fields.noindex === "true");
    expect(head.graph.map((n: any) => n["@type"])).toEqual(expect.arrayContaining(["WebPage", "Service"]));
  });
  it("reports one that belongs to no page", () => expect(lines(run(override("gone", {})).report)).toMatch(/belongs to no published page/));
  it("accepts ordinary wording", () => { for (const title of ["What Is Coming Soon to Maryland Business Law", "Guide to SEO [Updated] for Agencies", "Help for [Business Owners] in Maryland"]) expect(lines(run(override(svc, { title })).report)).toBe(""); });
  it("adds schemaCustom and allows several", () => {
    const c = (k: string) => ({ ...item("schemaCustom", { label: "Video", json: `{"@type":"VideoObject","name":"${k}"}` }), _key: k });
    expect(types(run(override(svc, { jsonLd: [c("a"), c("b")] })), svc).filter((t: string) => t === "VideoObject").length).toBe(2);
  });
});

describe("pages", () => {
  const change = (id: string, fields: any) => (w: any) => Object.assign(w.pages.find((p: any) => p._id === id), fields);
  it("post dates: the page's own date wins", () => {
    const r = run((w) => { change(post, { dateModified: "2026-05-01" })(w); override(post, { dateModified: "2026-06-01" })(w); });
    expect(lines(r.report)).toMatch(/differs from the date on the page/);
    expect(buildHead(find(r, post), r.w.site).graph.find((n: any) => n["@type"] === "BlogPosting")).toMatchObject({ datePublished: "2026-04-13", dateModified: "2026-05-01" });
  });
  it.each([["no date", { date: null }, /publish date/], ["future date", { date: "2027-01-01" }, /future/]])("post with %s has no article markup", (_n, f, m) => { const r = run(change(post, f)); expect(lines(r.report)).toMatch(m); expect(types(r, post)).not.toContain("BlogPosting"); });
  it("byline decides the author", () => {
    const author = (name?: string) => { const r = run(change(post, { author: name ? { name } : undefined })); return buildHead(find(r, post), r.w.site).graph.find((n: any) => n["@type"] === "BlogPosting").author; };
    expect(author("Site ")).toEqual({ "@id": "https://site.test/#organization" });
    expect(author()).toEqual({ "@id": "https://site.test/#organization" });
    expect(author("Jo Doe")).toEqual({ "@type": "Person", name: "Jo Doe" });
  });
  it("reports repeated titles and addresses", () => {
    const r = run((w) => w.pages.push({ ...page("servicePage", "other"), title: "Page servicepage-one" }));
    expect(lines(r.report)).toMatch(/same title/);
  });
  it("reports an image file that does not exist and leaves it out", () => {
    const r = run(() => {}, { fileExists: () => false });
    expect(lines(r.report)).toMatch(/not in the site's files/);
    expect(JSON.stringify(buildHead(find(r, post), r.w.site).graph)).not.toMatch(/p\.png/);
  });
  it("shortens long text at a sentence or word", () => {
    expect(clip("Short.")).toBe("Short.");
    const s = `${"a".repeat(70)} one. ${"b".repeat(40)} two. ${"c".repeat(90)}`;
    expect(clip(s)).toMatch(/two\.$/);
    expect(clip("word ".repeat(80)).length).toBeLessThanOrEqual(160);
    expect(clip("x".repeat(400)).length).toBeLessThanOrEqual(160);
  });
});

describe("site-wide data stops the build", () => {
  const robots = (f: (s: string) => string) => (w: any) => (w.site.seo.robotsTxt = f(w.site.seo.robotsTxt));
  const cases: [string, (w: any) => void, RegExp][] = [
    ["no seo-site", (w) => (w.site.seo = null), /seo-site document is missing/], ["a type with no defaults", (w) => w.site.seo.defaults.shift(), /no entry for home/],
    ["a type twice", (w) => w.site.seo.defaults.push({ ...w.site.seo.defaults[0], _key: "z" }), /appears twice/],
    ["no WebPage", (w) => w.site.seo.defaults[0].jsonLd.shift(), /needs a schemaWebPage/],
    ["same title for all", (w) => (w.site.seo.defaults.find((d: any) => d.docType === "servicePage").title = "Services by Site"), /must use \{title\}/],
    ["unknown token", (w) => (w.site.seo.defaults[0].title = "{name} | Site"), /uses \{name\}/],
    ["dead breadcrumb", (w) => (w.site.seo.defaults[1].jsonLd[1].parents.push({ _key: "q", name: "Q", path: "/q" })), /not a page/],
    ["missing singleton", (w) => (w.pages = w.pages.filter((p: any) => p._id !== "home")), /home document is missing/],
    ["bad phone", (w) => (w.site.business.telephone = "240-555"), /country code/], ["bad profile", (w) => w.site.socialLinks.push("x.com/a"), /full https/],
    ["no organization", (w) => delete w.site.seo.organization, /organization is required/],
    ["crawl delay", robots((s) => `${s}Crawl-delay: 10\n`), /Crawl-delay/], ["two wildcard groups", robots((s) => `${s}User-agent: *\nAllow: /\n`), /exactly one/],
    ["query block", robots((s) => `${s}Disallow: /*?*\n`), /blocks images/], ["bare query block", robots((s) => `${s}Disallow: *?*\n`), /blocks images/],
    ["blocks everyone", robots((s) => s.replace("Allow: /", "Disallow: /")), /blocks search engines/], ["wildcard block", robots((s) => s.replace("Allow: /", "Disallow: /*")), /blocks search engines/],
    ["star-slash block", robots((s) => s.replace("Allow: /", "Disallow: */")), /blocks search engines/], ["blocks Google", robots((s) => `${s}User-agent: Googlebot\nDisallow: /\n`), /blocks search engines/],
    ["no sitemap", robots(() => "User-agent: *\nAllow: /\n"), /needs: Sitemap/],
  ];
  it.each(cases)("%s", (_n, change, message) => { const r = run(change); expect(lines(r.stop)).toMatch(message); for (const p of r.stop) expect(p.help.length).toBeGreaterThan(5); });
  it("valid data has no problems", () => { const r = run(); expect(lines([...r.stop, ...r.report])).toBe(""); });
  it("allows a narrow query rule", () => expect(run(robots((s) => `${s}User-agent: somebot\nDisallow: /*?utm_\n`)).stop).toEqual([]));
});

describe("output", () => {
  it("links its nodes together and prints no empty facts", () => {
    const r = run();
    for (const p of r.pages) {
      const { graph } = buildHead(p, r.w.site), ids = new Set(graph.map((n: any) => n["@id"]));
      JSON.stringify(graph, (_k, v) => { if (v && typeof v === "object" && Object.keys(v).length === 1 && v["@id"]) expect(ids.has(v["@id"])).toBe(true); return v; });
      expect(JSON.stringify(graph)).not.toMatch(/legalName|null|undefined/);
    }
  });
  it("cannot break out of the script tag and keeps values intact", () => {
    const out = serializeGraph([{ "@type": "Thing", name: "</script><!-- & \" '" }]);
    expect(out).not.toMatch(/<\/script|<!--/);
    expect(JSON.parse(out)["@graph"][0].name).toBe("</script><!-- & \" '");
  });
  it("sitemap dates come from the page, its own sections, its SEO and new list entries, not shared sections", () => {
    const at = (d: string) => `2026-11-${d}T10:00:00.000Z`;
    const pages = [
      { _id: "home", _type: "home", _updatedAt: at("01"), hero: { _ref: "own" }, cta: { _ref: "shared" } },
      { _id: "aboutPage", _type: "aboutPage", _updatedAt: at("02"), cta: { _ref: "shared" } },
      { _id: "blogPage", _type: "blogPage", _updatedAt: at("01") },
      { _id: "p", _type: "blogPost", _updatedAt: at("20"), _createdAt: at("07") },
    ];
    const when = lastChanged(pages, [{ _id: "seo-aboutPage", _updatedAt: at("05") }], [{ _id: "own", _updatedAt: at("03"), x: { _ref: "own" } }, { _id: "shared", _updatedAt: at("29") }]);
    expect(Object.fromEntries(when)).toEqual({ home: at("03"), aboutPage: at("05"), blogPage: at("07"), p: at("20") });
  });
  it("sitemap: no noindex pages, real dates only", () => {
    const map = sitemapEntries(run((w) => { override(svc, { noindex: true })(w); }).pages, "https://site.test");
    expect(map.get("https://site.test/services/servicepage-one")!.exclude).toBe(true);
    expect(map.get("https://site.test/blog/blogpost-one")).toEqual({ exclude: false, lastmod: undefined });
    expect(map.get("https://site.test/about")!.lastmod).toBeUndefined();
  });
  const left = (h: string) => JSON.parse(h.match(/ld\+json">(.*?)<\/script>/)![1])["@graph"];
  it("drops FAQs visitors cannot see", () => {
    const out = keepVisibleFaqs(html("<h3>Why &amp; how?</h3><p>It <b>is</b> &#39;so&#39;.</p><script>var s='Hidden? No.'</script><!-- Hidden? No. -->", [["Why & how?", "It is 'so'."], ["Hidden?", "No."]]), () => {});
    expect(left(out)[1].mainEntity.map((q: any) => q.name)).toEqual(["Why & how?"]);
  });
  const keeps = (main: string, q: string, a: string) => left(keepVisibleFaqs(html(main, [[q, a]]), () => {})).length === 2;
  it.each([
    ["words run together", "We sell SEO to eyes of others", "SEO?", "Yes."], ["letters split", "the art icle is good", "Article?", "Is good"],
    ["far apart", `Local SEO? ${"filler ".repeat(40)} Monthly.`, "Local SEO?", "Monthly."], ["hidden", "<div hidden><p>Q one?</p><p>A one.</p></div>", "Q one?", "A one."],
    ["hidden attribute later", '<div class="x" hidden="">Q one? A one.</div>', "Q one?", "A one."], ["answer first", "A one. Q one?", "Q one?", "A one."], ["template", "<template>Q one? A one.</template>", "Q one?", "A one."],
  ])("not shown: %s", (_n, main, q, a) => expect(keeps(main, q, a)).toBe(false));
  it.each([
    ["entities", "<h3>Wait&hellip; what&mdash;now?</h3><p>Caf&eacute; isn&rsquo;t&nbsp;open.</p>", "Wait… what—now?", "Café isn't open."], ["inline tags", "<b>Un</b>real?<p>It <em>is</em>.</p>", "Unreal?", "It is."],
    ["accordion icon", '<div class="hidden-x" data-hidden="1"><h3>Q one?</h3><span>+</span><p>A one.</p></div>', "Q one?", "A one."], ["second place it appears", `Q one? ${"x ".repeat(200)} Q one? A one.`, "Q one?", "A one."], ["after a hidden block", "<p hidden>x</p><p>Q one? A one.</p>", "Q one?", "A one."],
  ])("shown: %s", (_n, main, q, a) => expect(keeps(main, q, a)).toBe(true));
  it("drops the whole block when none are visible, and changes nothing when all are", () => {
    expect(left(keepVisibleFaqs(html("x", [["Hidden?", "No."]]), () => {})).map((n: any) => n["@type"])).toEqual(["WebPage"]);
    const same = html("<p>Q one? A one.</p>", [["Q one?", "A one."]]);
    expect(keepVisibleFaqs(same)).toBe(same);
    expect(keepVisibleFaqs("<html></html>")).toBe("<html></html>");
  });
});

describe("images", () => {
  const ref = "image-f3f5fd78492462bfc46f31a0c0a3de59784d9b5f-1024x768-webp";
  const url = "https://cdn.sanity.io/images/089yj83f/production/f3f5fd78492462bfc46f31a0c0a3de59784d9b5f-1024x768.webp";
  it("accepts a Sanity image, its address, or a site path", () => {
    expect(imageAddress({ _type: "image", asset: { _ref: ref } })).toBe(url);
    expect(imageAddress(`${url}?w=200`)).toBe(url);
    expect(imageAddress("/images/blog/a.webp")).toBe("/images/blog/a.webp");
  });
  it.each([undefined, null, "", "a.webp", "//evil.test/a.png", "/../secret", "javascript:alert(1)", "https://evil.test/a.png", url.replace("089yj83f", "other"), url.replace("https", "http"), {}, { asset: {} }, { asset: { _ref: "file-x" } }, 5, []])("rejects %j", (v) => expect(parseImage(v as any)).toBeUndefined());
  it("resizes, honours crop and hotspot, and leaves SVG alone", () => {
    const img = parseImage({ asset: { _ref: ref }, alt: " Alt ", crop: { left: 0.25, right: 0.25, top: 0, bottom: 0.5 }, hotspot: { x: 0.4, y: 0.6 } }) as any;
    expect(img.alt).toBe("Alt");
    const q = new URL(sanityUrl(img, { width: 600, height: 300 })).searchParams;
    expect([q.get("rect"), q.get("w"), q.get("h"), q.get("fp-x"), q.get("auto")]).toEqual(["256,0,512,384", "600", "300", "0.4", "format"]);
    const svg = parseImage({ asset: { _ref: "image-abc-10x10-svg" } }) as any;
    expect(sanityUrl(svg, { width: 5, height: 5 })).toBe(svg.url);
  });
});

describe("broken content", () => {
  const counts = (name: string, ok: number, broken: number) => ({ kinds: new Map([[name, { ok, broken }], ["block b", { ok: 9, broken: 0 }]]), pages: new Set() });
  it("bad documents never stop a production build while any page of the kind works", () => {
    for (const c of [counts("block a", 1, 3), counts("block a", 0, 9), counts("page /x", 1, 50), counts("page /x", 0, 2)]) expect(buildFault(c, false)).toBeUndefined();
  });
  it("a whole kind of page failing does", () => expect(buildFault(counts("page /x", 0, 6), false)).toMatch(/page \/x \(6\)/));
  it("previews stop when every use of a block fails, not when one does", () => { expect(buildFault(counts("block a", 0, 1), true)).toMatch(/block a/); expect(buildFault(counts("block a", 5, 1), true)).toBeUndefined(); });
  it("outages are never treated as bad content", () => {
    const e = (E: any, m: string, x = {}) => Object.assign(new E(m), x);
    for (const err of [e(Error, "connect EAI_AGAIN"), e(TypeError, "terminated"), e(TypeError, "fetch failed"), e(Error, "Sanity is down"), e(TypeError, "x", { cause: new Error("y") }), e(TypeError, "x", { code: "ECONNRESET" }), "text", null]) expect(isDataError(err), String(err)).toBe(false);
    for (const err of [e(TypeError, "Cannot read properties of null (reading 'map')"), e(RangeError, "Invalid time value"), e(Error, "Element type is invalid: expected a string but got: number."), e(Error, "Unable to render Heading because it is null!")]) expect(isDataError(err)).toBe(true);
  });
  it("a second fault in a block is logged, an outage still ends the build", () => {
    expect(() => onUnhandled(new TypeError("Cannot read properties of null"))).not.toThrow();
    expect(() => onUnhandled(new Error("connect EAI_AGAIN"))).toThrow();
  });
  it("text helpers accept any value", () => { for (const v of [null, {}, [], 5, true] as any[]) { expect(markdownify(v)).toBe(""); expect(slugify(v)).toBe(""); } });
  it("a copy of a fixed page is never used, and every fixed page is fetched by the chosen id", () => {
    const src = readFileSync(path.resolve(__dirname, "../src/lib/sanity/queries.ts"), "utf8");
    for (const t of Object.keys(ROUTES).filter((t) => !isRepeatable(t))) {
      const { routes, refused } = pickPages([{ _id: "0abc", _type: t, _createdAt: "2027" }, { _id: t, _type: t, _createdAt: "2026" }]);
      expect([...routes.keys()]).toEqual([t]); expect(refused.length).toBe(1);
      expect(src, t).toContain(`*[_type == "${t}" && _id == $id][0]`); expect(src, t).toContain(`fixedId("${t}")`);
    }
  });
});
