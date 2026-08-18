import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";

// Rendered-output SEO infra tests. Treats dist/ as source of truth — parses the
// actual built HTML/JSON-LD rather than trusting source code, per the project's
// astro-seo-infra-readiness audit method.

const DIST = path.resolve(__dirname, "../dist");
const ENTITY_PATTERN = /&(amp|lt|gt|quot|apos);/;

function walkHtmlFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) out.push(...walkHtmlFiles(full));
    else if (entry.endsWith(".html")) out.push(full);
  }
  return out;
}

function containsEntityEscape(value: unknown): string | null {
  if (typeof value === "string" && ENTITY_PATTERN.test(value)) return value;
  if (Array.isArray(value)) {
    for (const item of value) {
      const hit = containsEntityEscape(item);
      if (hit) return hit;
    }
    return null;
  }
  if (value && typeof value === "object") {
    for (const v of Object.values(value)) {
      const hit = containsEntityEscape(v);
      if (hit) return hit;
    }
  }
  return null;
}

describe("SEO infra: rendered dist output", () => {
  if (!existsSync(DIST)) {
    it.skip("dist/ not found — run `astro build` first", () => {});
    return;
  }

  const htmlFiles = walkHtmlFiles(DIST);

  it("found built pages to audit", () => {
    expect(htmlFiles.length).toBeGreaterThan(0);
  });

  for (const file of htmlFiles) {
    const relPath = path.relative(DIST, file);

    describe(relPath, () => {
      const html = readFileSync(file, "utf-8");
      const $ = cheerio.load(html);

      it("has exactly one canonical link", () => {
        expect($('link[rel="canonical"]').length).toBe(1);
      });

      // Astro.redirect() stub pages (get-started, start-for-free, enterprise-support)
      // render bare <title>/refresh/canonical HTML with no <Base>/SEO component at all —
      // they're meta-refresh redirects, not indexable content, so no description is expected.
      const isRedirectStub = $('meta[http-equiv="refresh"]').length > 0;

      it("has a title", () => {
        expect($("title").text().trim().length).toBeGreaterThan(0);
      });

      it.skipIf(isRedirectStub)("has a meta description", () => {
        expect($('meta[name="description"]').attr("content")?.length).toBeGreaterThan(0);
      });

      it.skipIf(isRedirectStub)("has an og:description", () => {
        expect($('meta[property="og:description"]').attr("content")?.length).toBeGreaterThan(0);
      });

      it("title, meta description, and og:description carry no leading/trailing whitespace", () => {
        const fields = [
          $("title").text(),
          $('meta[name="description"]').attr("content"),
          $('meta[property="og:description"]').attr("content"),
        ].filter((v): v is string => Boolean(v));
        for (const value of fields) {
          expect(value, `whitespace leaked into: ${JSON.stringify(value)}`).toBe(value.trim());
        }
      });

      it.skipIf(isRedirectStub)("canonical and og:url are both present and equal", () => {
        const canonical = $('link[rel="canonical"]').attr("href");
        const ogUrl = $('meta[property="og:url"]').attr("content");
        expect(canonical, "missing canonical").toBeTruthy();
        expect(ogUrl, "missing og:url").toBeTruthy();
        expect(canonical).toBe(ogUrl);
      });

      it("every JSON-LD script parses and carries no leaked HTML entities", () => {
        const scripts = $('script[type="application/ld+json"]');
        scripts.each((_, el) => {
          const raw = $(el).contents().text();
          const parsed = JSON.parse(raw); // throws on invalid JSON-LD
          const leaked = containsEntityEscape(parsed);
          expect(leaked, `entity-escaped value found in JSON-LD: ${leaked}`).toBeNull();
        });
      });

      const isNoindex = $('meta[name="robots"]')
        .toArray()
        .some((el) => ($(el).attr("content") || "").includes("noindex"));

      if (!isNoindex) {
        it("active indexable page: WebSite + LocalBusiness graph nodes present", () => {
          const scripts = $('script[type="application/ld+json"]');
          let types: string[] = [];
          scripts.each((_, el) => {
            const parsed = JSON.parse($(el).contents().text());
            const graph = parsed["@graph"] || [parsed];
            types.push(...graph.map((n: any) => n["@type"]));
          });
          expect(types).toContain("WebSite");
          expect(types).toContain("LocalBusiness");
        });
      }
    });
  }
});

describe("SEO infra: sitemap consistency", () => {
  if (!existsSync(DIST)) {
    it.skip("dist/ not found — run `astro build` first", () => {});
    return;
  }

  const sitemapPath = path.join(DIST, "sitemap-0.xml");

  // Hard requirement, not skipIf: if dist/ was built, the sitemap must exist.
  // A missing sitemap here is itself a real infra failure, not something to skip past.
  it("sitemap-0.xml exists", () => {
    expect(existsSync(sitemapPath), `expected ${sitemapPath} to exist after build`).toBe(true);
  });

  if (!existsSync(sitemapPath)) return;

  const sitemapXml = readFileSync(sitemapPath, "utf-8");
  const htmlFiles = walkHtmlFiles(DIST);

  for (const file of htmlFiles) {
    const relPath = path.relative(DIST, file);
    const html = readFileSync(file, "utf-8");
    const $ = cheerio.load(html);
    const isNoindex = $('meta[name="robots"]')
      .toArray()
      .some((el) => ($(el).attr("content") || "").includes("noindex"));
    const isRedirectStub = $('meta[http-equiv="refresh"]').length > 0;
    const canonical = $('link[rel="canonical"]').attr("href");

    if (isNoindex) {
      it(`${relPath}: noindex page is not present in the sitemap`, () => {
        expect(canonical, "noindex page has no canonical to check").toBeTruthy();
        expect(sitemapXml.includes(canonical!), `noindex page ${canonical} found in sitemap`).toBe(false);
      });
    } else if (!isRedirectStub) {
      it(`${relPath}: active indexable page's canonical is present in the sitemap`, () => {
        expect(canonical, "active page has no canonical to check").toBeTruthy();
        expect(sitemapXml.includes(canonical!), `active page ${canonical} missing from sitemap`).toBe(true);
      });
    }
  }
});
