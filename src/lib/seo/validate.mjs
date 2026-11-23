import { JSON_LD_ITEMS, PAGE_FIELDS, REQUIRED_ITEMS, ROUTES, SITE_FIELDS, routeOf } from "./contract.mjs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PLACEHOLDER = /lorem ipsum|^\s*(coming soon|tbd|todo)\W*$|\bTBD\b|\bTODO\b|your (company|business) name here|example\.com|\[(insert|your|client|company|business|name|title|description)\b[^\]]*\]/i;
const filled = (v) => typeof v === "string" && v.trim() !== "";
const norm = (v) => v.trim().replace(/\s+/g, " ").toLowerCase();
const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
const isHttps = (v) => { try { return new URL(v).protocol === "https:"; } catch { return false; } };
const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().startsWith(v);
const isSitePath = (v) => /^\/(?!\/)[^\s?#]*$/.test(v);

/** Parse a schemaCustom body. Returns {value} or {error}. */
export function parseCustom(json) {
  let value;
  try { value = JSON.parse(json); } catch { return { error: "is not valid JSON" }; }
  if (!isObject(value)) return { error: "must be one JSON object" };
  if (typeof value["@type"] !== "string" || !value["@type"]) return { error: 'needs an "@type"' };
  const banned = new Set(["@context", "@graph", "@id"]);
  const reserved = new Set(["Organization", "LocalBusiness", "ProfessionalService", "WebSite", "WebPage", "BreadcrumbList", "Service", "BlogPosting", "FAQPage"]);
  if (reserved.has(value["@type"])) return { error: `"${value["@type"]}" has its own field or item type; use that` };
  let error;
  (function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!isObject(node)) return;
    for (const [k, v] of Object.entries(node)) {
      if (banned.has(k)) error ??= `must not contain "${k}"`;
      if (/^(aggregateRating|reviews?)$/.test(k)) error ??= `must not contain "${k}" (self-published ratings break Google's rules)`;
      walk(v);
    }
    if ([node["@type"]].flat().some((t) => /^(Review|AggregateRating|EmployerAggregateRating|CriticReview|UserReview)$/.test(t))) error ??= "must not contain reviews or ratings";
  })(value);
  return error ? { error } : { value };
}

function checkField(value, field, path, out, today) {
  const fail = (message) => out.push({ path, message, help: field.description });
  const empty = value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
  if (empty) { if (field.required) fail("is required"); return; }

  if (field.type === "boolean") { if (typeof value !== "boolean") fail("must be on or off"); return; }
  if (field.type === "object") {
    if (!isObject(value)) return fail("must be an object");
    return checkFields(value, field.fields, path, out, today);
  }
  if (field.type === "list") {
    if (!Array.isArray(value)) return fail("must be a list");
    if (field.min && value.length < field.min) fail(`needs at least ${field.min}`);
    if (field.max && value.length > field.max) fail(`allows at most ${field.max}`);
    const keys = value.map((v) => v?._key);
    if (keys.some((k) => !k) || new Set(keys).size !== keys.length) fail("every item needs a unique _key");
    if (field.fields) value.forEach((v, i) => isObject(v) ? checkFields(v, field.fields, `${path}[${i}]`, out, today) : fail(`item ${i + 1} must be an object`));
    return;
  }

  if (typeof value !== "string") return fail("must be text");
  if (value !== value.trim() && !path.endsWith("robotsTxt")) fail("has spaces at the start or end");
  if (field.min && value.trim().length < field.min) fail(`is ${value.trim().length} characters; needs at least ${field.min}`);
  if (field.max && value.length > field.max) fail(`is ${value.length} characters; allows at most ${field.max}`);
  if (field.options && !field.options.includes(value)) fail(`"${value}" must be one of: ${field.options.join(", ")}`);
  if (["string", "text"].includes(field.type) && !path.endsWith("robotsTxt")) {
    if (/<[a-z/!][^>]*>/i.test(value)) fail("must be plain text, not HTML");
    if (/\*\*|\]\(/.test(value)) fail("must be plain text, not Markdown");
    if (PLACEHOLDER.test(value)) fail("contains placeholder text");
    if (field.type === "string" && /[\r\n]/.test(value)) fail("must be one line");
  }
  if (field.type === "url" && !isHttps(value)) fail("must be a full https:// URL");
  if (field.type === "path" && !isSitePath(value) && !isHttps(value)) fail("must start with / or https://");
  if (field.type === "email" && !EMAIL.test(value)) fail("must be an email address");
  if (field.type === "date") {
    if (!isDate(value)) fail("must be a real date as YYYY-MM-DD");
    else if (value > today) fail("is in the future");
  }
  if (field.type === "json") { const { error } = parseCustom(value); if (error) fail(error); }
}

function checkFields(value, fields, path, out, today) {
  for (const [name, field] of Object.entries(fields)) checkField(value[name], field, `${path}.${name}`, out, today);
  for (const name of Object.keys(value)) {
    if (name.startsWith("_") || name in fields) continue;
    out.push({ path: `${path}.${name}`, message: "is not a known field (misspelled?)", help: `Known fields: ${Object.keys(fields).join(", ")}` });
  }
}

const now = () => new Date().toISOString().slice(0, 10);

/** Problems with one page document (the PAGE_QUERY shape). */
export function validatePage(doc, { today = now(), paths, baseUrl, orgName } = {}) {
  const out = [];
  const id = doc?._id ?? "(missing document)";
  if (!isObject(doc) || !Object.hasOwn(ROUTES, doc._type)) return [{ path: id, message: `type "${doc?._type}" has no route in contract.mjs`, help: "Add it to ROUTES." }];
  if (ROUTES[doc._type].length > 0 && !filled(doc.slug)) out.push({ path: `${id}.slug`, message: "is required", help: "The page needs a URL slug." });
  if (!isObject(doc.seo)) return [...out, { path: `${id}.seo`, message: "is required", help: "Every page needs an seo object. See docs/SEO.md." }];
  checkFields(doc.seo, PAGE_FIELDS, `${id}.seo`, out, today);

  const items = Array.isArray(doc.seo.jsonLd) ? doc.seo.jsonLd : [];
  const count = {};
  items.forEach((item, i) => {
    const path = `${id}.seo.jsonLd[${i}]`;
    const spec = typeof item?._type === "string" && Object.hasOwn(JSON_LD_ITEMS, item._type) ? JSON_LD_ITEMS[item._type] : undefined;
    if (!spec) return out.push({ path, message: `unknown item type "${item?._type}"`, help: `Use one of: ${Object.keys(JSON_LD_ITEMS).join(", ")}` });
    count[item._type] = (count[item._type] ?? 0) + 1;
    checkFields(item, spec.fields, path, out, today);
    const add = (message, help = spec.description) => out.push({ path, message, help });

    if (item._type === "schemaBreadcrumb" && Array.isArray(item.items) && item.items.length) {
      const trail = item.items.map((c) => c?.path);
      if (trail[0] !== "/") add("must start at the homepage (/)");
      if (trail.at(-1) !== routeOf(doc)) add(`must end at this page (${routeOf(doc)})`);
      if (new Set(trail).size !== trail.length) add("repeats a path");
      if (paths) trail.filter((p) => !paths.has(p)).forEach((p) => add(`links to ${p}, which is not a page`));
    }
    if (item._type === "schemaArticle") {
      if (item.authorType === "Person" && !item.authorName) add("needs authorName when authorType is Person");
      if (item.authorType === "Person" && item.authorName && doc.byline && item.authorName !== doc.byline) add(`authorName must match the byline on the page ("${doc.byline}")`);
      if (item.authorType === "Organization" && item.authorName) add("authorName must be empty when authorType is Organization");
      if (item.authorType === "Organization" && doc.byline && orgName && doc.byline !== orgName) add(`the page's byline is "${doc.byline}"; use Person`);
      const published = String(doc.datePublished ?? "").slice(0, 10);
      if (!isDate(published)) add("needs the post's own publish date");
      else if (published > today) add("the post's publish date is in the future");
      else if (doc.seo.dateModified && doc.seo.dateModified < doc.datePublished.slice(0, 10)) add("dateModified is before the publish date");
    }
    if (item._type === "schemaFaq" && item.enabled === true) {
      const faqs = doc.faqs ?? [];
      if (!faqs.length) add("is on, but this page shows no FAQ");
      if (faqs.some((f) => !filled(f?.question) || !filled(f?.answer))) add("a question on the page has no question or answer text");
      else if (new Set(faqs.map((f) => norm(f.question))).size !== faqs.length) add("the page repeats a question");
    }
  });
  for (const [type, spec] of Object.entries(JSON_LD_ITEMS)) if (spec.once && count[type] > 1) out.push({ path: `${id}.seo.jsonLd`, message: `has ${count[type]} ${type} items; use one`, help: spec.description });
  for (const type of ["schemaWebPage", ...(REQUIRED_ITEMS[doc._type] ?? [])]) {
    if (!count[type]) out.push({ path: `${id}.seo.jsonLd`, message: `needs a ${type} item`, help: JSON_LD_ITEMS[type].description });
  }
  for (const type of ["schemaWebPage", ...(REQUIRED_ITEMS[doc._type] ?? [])]) {
    if (items.some((i) => i?._type === type && i.enabled === false)) out.push({ path: `${id}.seo.jsonLd`, message: `${type} must stay on`, help: JSON_LD_ITEMS[type].description });
  }
  if (doc.docModified && String(doc.docModified).slice(0, 10) !== doc.seo.dateModified) out.push({ path: `${id}.seo.dateModified`, message: `must match the "updated" date shown on the page (${String(doc.docModified).slice(0, 10)})`, help: PAGE_FIELDS.dateModified.description });
  if (doc.seo.canonical && baseUrl && isHttps(doc.seo.canonical) && new URL(doc.seo.canonical).origin !== new URL(baseUrl).origin) out.push({ path: `${id}.seo.canonical`, message: "points to another site", help: PAGE_FIELDS.canonical.description });
  else if (doc.seo.canonical && isHttps(doc.seo.canonical)) {
    const { pathname, search, hash } = new URL(doc.seo.canonical);
    if (pathname === routeOf(doc)) out.push({ path: `${id}.seo.canonical`, message: "is this page's own address; leave it empty", help: PAGE_FIELDS.canonical.description });
    else if (search || hash || (paths && !paths.has(pathname))) out.push({ path: `${id}.seo.canonical`, message: "is not the address of a page on this site", help: PAGE_FIELDS.canonical.description });
  }
  return out;
}

/** Problems with site settings (the SITE_QUERY shape). */
export function validateSite(site, { today = now(), everything = true } = {}) {
  const out = [];
  const need = (ok, path, message, help) => { if (!ok) out.push({ path: `siteSettings.${path}`, message, help }); };
  if (!isObject(site)) return [{ path: "siteSettings", message: "is missing", help: "Create the site settings document." }];
  need(isHttps(site.seoUrl) && new URL(site.seoUrl).pathname === "/" && !site.seoUrl.endsWith("/"), "seoUrl", "must be https with no trailing slash", "The site's address, such as https://marylandinsights.com");
  if (!isObject(site.seo)) return [...out, { path: "siteSettings.seo", message: "is required", help: "See docs/SEO.md." }];
  // Page output needs only the organization and website, so a robots or 404
  // mistake must not cost other pages their markup.
  if (everything) checkFields(site.seo, SITE_FIELDS, "siteSettings.seo", out, today);
  else for (const key of ["organization", "website"]) checkField(site.seo[key], SITE_FIELDS[key], `siteSettings.seo.${key}`, out, today);
  const b = site.business ?? {};
  for (const k of ["streetAddress", "addressLocality", "addressRegion", "postalCode", "addressCountry", "telephone"]) need(typeof b[k] === "string" && b[k].trim(), `business.${k}`, "is required", "Used in the organization's structured data.");
  if (b.telephone) need(/^\+[\d\s().-]{8,24}$/.test(b.telephone), "business.telephone", "must start with + and the country code", "Example: +1-240-441-5259");
  for (const url of site.socialLinks ?? []) need(isHttps(url), "socialLinks", `"${url}" must be a full https:// URL`, "Links to official profiles.");

  const robots = site.seo.robotsTxt;
  if (everything && typeof robots === "string") {
    const bad = (message) => out.push({ path: "siteSettings.seo.robotsTxt", message, help: SITE_FIELDS.robotsTxt.description });
    const lines = robots.split(/\r?\n/).map((l) => l.replace(/#.*/, "").trim()).filter(Boolean);
    if (lines.filter((l) => /^user-agent:\s*\*$/i.test(l)).length !== 1) bad("needs exactly one 'User-agent: *' line");
    if (lines.some((l) => /^crawl-delay:/i.test(l))) bad("must not set Crawl-delay");
    if (lines.some((l) => /^disallow:\s*\/?\*?\?\*?\$?$/i.test(l))) bad("must not block every URL with a ? (it blocks images)");
    if (!lines.some((l) => l.toLowerCase() === `sitemap: ${site.seoUrl}/sitemap-index.xml`.toLowerCase())) bad(`needs: Sitemap: ${site.seoUrl}/sitemap-index.xml`);
    const agents = []; let blocksAll = false, lastWasAgent = false;
    for (const l of lines) {
      const ua = l.match(/^user-agent:\s*(.+)$/i);
      if (ua) { if (!lastWasAgent) agents.length = 0; agents.push(ua[1].toLowerCase()); lastWasAgent = true; continue; }
      lastWasAgent = false;
      if (/^disallow:\s*(\/|\/?\*+\$?|\*+\/)$/i.test(l) && agents.some((a) => ["*", "googlebot", "bingbot"].includes(a))) blocksAll = true;
      if (!/^(allow|disallow|sitemap|content-signal):/i.test(l)) bad(`has an unknown line: "${l}"`);
    }
    if (blocksAll) bad("blocks search engines from the whole site");
  }
  return out;
}

/** Everything: site settings, each page, and rules across pages. */
export function validateAll(site, pages, options = {}) {
  const paths = new Set(pages.map(routeOf));
  const out = [...validateSite(site, options), ...pages.flatMap((p) => validatePage(p, { ...options, paths, baseUrl: site?.seoUrl, orgName: site?.seo?.organization?.name }))];
  for (const field of ["title", "description"]) {
    const seen = new Map();
    for (const p of pages) {
      const v = p.seo?.[field]?.trim?.().toLowerCase();
      if (!v) continue;
      if (seen.has(v)) out.push({ path: `${p._id}.seo.${field}`, message: `is the same as ${seen.get(v)}`, help: "Must be unique across the site." });
      else seen.set(v, p._id);
    }
  }
  const routes = new Map();
  for (const p of pages) { const r = routeOf(p); if (routes.has(r)) out.push({ path: p._id, message: `shares the URL ${r} with ${routes.get(r)}`, help: "Each page needs its own URL." }); else routes.set(r, p._id); }
  for (const t of Object.keys(ROUTES)) if (ROUTES[t].length === 0 && !pages.some((p) => p._type === t)) out.push({ path: t, message: "document is missing", help: `The page ${ROUTES[t]()} needs it.` });
  return out;
}

export const formatProblems = (problems) => problems.map((p) => `  ${p.path} ${p.message}\n      ${p.help}`).join("\n");
