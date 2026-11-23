import { DEFAULT_FIELDS, JSON_LD_ITEMS, PAGE_FIELDS, ROUTES, SITE_FIELDS, TOKENS, isRepeatable } from "./contract.mjs";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PLACEHOLDER = /lorem ipsum|^\s*(coming soon|tbd|todo)\W*$|\bTBD\b|\bTODO\b|your (company|business) name here|example\.com|\[(insert\b|your\b|(client|company|business|page) (name|title)|name|title|description)[^\]]*\]/i;
export const filled = (v) => typeof v === "string" && v.trim() !== "";
export const norm = (v) => v.trim().replace(/\s+/g, " ").toLowerCase();
export const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
export const isHttps = (v) => { try { return new URL(v).protocol === "https:"; } catch { return false; } };
export const isDate = (v) => /^\d{4}-\d{2}-\d{2}$/.test(v) && !Number.isNaN(Date.parse(v)) && new Date(v).toISOString().startsWith(v);
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

export function checkField(value, field, path, out, today) {
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
  if (field.type === "template") {
    for (const [, token] of value.matchAll(/\{([^}]*)\}/g)) if (!TOKENS.includes(token)) fail(`uses {${token}}; use one of: ${TOKENS.map((t) => `{${t}}`).join(", ")}`);
  }
  if (["string", "text", "template"].includes(field.type) && !path.endsWith("robotsTxt")) {
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

export function checkFields(value, fields, path, out, today) {
  for (const [name, field] of Object.entries(fields)) checkField(value[name], field, `${path}.${name}`, out, today);
  for (const name of Object.keys(value)) {
    if (name.startsWith("_") || name in fields) continue;
    out.push({ path: `${path}.${name}`, message: "is not a known field (misspelled?)", help: `Known fields: ${Object.keys(fields).join(", ")}` });
  }
}

export const now = () => new Date().toISOString().slice(0, 10);

/** Problems with a list of JSON-LD items. */
export function checkItems(items, path, out, { today = now(), full = false } = {}) {
  const count = {};
  (Array.isArray(items) ? items : []).forEach((item, i) => {
    const at = `${path}[${i}]`;
    const spec = typeof item?._type === "string" && Object.hasOwn(JSON_LD_ITEMS, item._type) ? JSON_LD_ITEMS[item._type] : undefined;
    if (!spec) return out.push({ path: at, message: `unknown item type "${item?._type}"`, help: `Use one of: ${Object.keys(JSON_LD_ITEMS).join(", ")}` });
    count[item._type] = (count[item._type] ?? 0) + 1;
    const complete = full || item._type === "schemaCustom";
    const fields = Object.fromEntries(Object.entries(spec.fields).map(([k, f]) => [k, { ...f, required: f.required || (complete && spec.required.includes(k)) }]));
    checkFields(item, fields, at, out, today);
    if (Array.isArray(item.parents) && item.parents.length) {
      const trail = item.parents.map((c) => c?.path);
      if (trail[0] !== "/") out.push({ path: at, message: "must start at the homepage (/)", help: spec.description });
      if (new Set(trail).size !== trail.length) out.push({ path: at, message: "repeats a path", help: spec.description });
    }
  });
  for (const [type, n] of Object.entries(count)) if (n > 1 && !JSON_LD_ITEMS[type].repeatable) out.push({ path, message: `has ${n} ${type} items; use one`, help: JSON_LD_ITEMS[type].description });
  if (full && !count.schemaWebPage) out.push({ path, message: "needs a schemaWebPage item", help: JSON_LD_ITEMS.schemaWebPage.description });
}

/** Problems that affect the whole site. Any of these stops a build. */
export function validateSite(site, { today = now() } = {}) {
  const out = [];
  const need = (ok, path, message, help) => { if (!ok) out.push({ path: `siteSettings.${path}`, message, help }); };
  if (!isObject(site)) return [{ path: "siteSettings", message: "is missing", help: "Create the site settings document." }];
  need(isHttps(site.seoUrl) && new URL(site.seoUrl).pathname === "/" && !site.seoUrl.endsWith("/"), "seoUrl", "must be https with no trailing slash", "The site's address, such as https://marylandinsights.com");
  if (!isObject(site.seo)) return [...out, { path: "seo-site", message: "document is missing", help: "See docs/SEO.md." }];
  checkFields(site.seo, SITE_FIELDS, "seo-site", out, today);
  const seen = new Set();
  (Array.isArray(site.seo.defaults) ? site.seo.defaults : []).forEach((d, i) => {
    const at = `seo-site.defaults[${d?.docType ?? i}]`;
    if (seen.has(d?.docType)) out.push({ path: at, message: "appears twice", help: DEFAULT_FIELDS.docType.description });
    seen.add(d?.docType);
    checkItems(d?.jsonLd, `${at}.jsonLd`, out, { today, full: true });
    if (typeof d?.title === "string" && Object.hasOwn(ROUTES, d?.docType ?? "") && isRepeatable(d.docType) && !d.title.includes("{title}")) out.push({ path: `${at}.title`, message: "must use {title}, or every page gets the same title", help: DEFAULT_FIELDS.title.description });
    if (typeof d?.description === "string" && Object.hasOwn(ROUTES, d?.docType ?? "") && isRepeatable(d.docType) && !/\{(description|title)\}/.test(d.description)) out.push({ path: `${at}.description`, message: "must use {description} or {title}, or every page gets the same one", help: DEFAULT_FIELDS.description.description });
  });
  for (const t of Object.keys(ROUTES)) if (!seen.has(t)) out.push({ path: "seo-site.defaults", message: `has no entry for ${t}`, help: SITE_FIELDS.defaults.description });
  const b = site.business ?? {};
  for (const k of ["streetAddress", "addressLocality", "addressRegion", "postalCode", "addressCountry", "telephone"]) need(typeof b[k] === "string" && b[k].trim(), `business.${k}`, "is required", "Used in the organization's structured data.");
  if (b.telephone) need(/^\+[\d\s().-]{8,24}$/.test(b.telephone), "business.telephone", "must start with + and the country code", "Example: +1-240-441-5259");
  for (const url of site.socialLinks ?? []) need(isHttps(url), "socialLinks", `"${url}" must be a full https:// URL`, "Links to official profiles.");

  const robots = site.seo.robotsTxt;
  if (typeof robots === "string") {
    const bad = (message) => out.push({ path: "seo-site.robotsTxt", message, help: SITE_FIELDS.robotsTxt.description });
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

export const formatProblems = (problems) => problems.map((p) => `  ${p.path} ${p.message}\n      ${p.help}`).join("\n");
