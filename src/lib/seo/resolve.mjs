import { buildHead } from "./graph.mjs";
import { pickPages } from "./pages.mjs";
import { JSON_LD_ITEMS, LISTS, PAGE_FIELDS, ROUTES, overrideId, routeOf } from "./contract.mjs";
import { imageAddress, parseImage } from "../images.mjs";
import { PLACEHOLDER, checkField, checkItems, filled, isDate, isObject, norm, now, validateSite } from "./validate.mjs";

// Works out each page's SEO: the page type's defaults, filled from the page's
// own content, then that page's overrides. A bad value is reported and skipped,
// never published, and never affects another page.

const day = (v) => (typeof v === "string" && isDate(v.slice(0, 10)) ? v.slice(0, 10) : undefined);

/** Shorten to whole sentences, or whole words, within `max`. */
export function clip(text, max = 160) {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= max) return t;
  const sentences = [...t.slice(0, max).matchAll(/[.!?](?=\s)/g)].map((m) => m.index + 1).filter((n) => n >= 60);
  if (sentences.length) return t.slice(0, sentences.at(-1));
  const cut = t.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > 0 ? cut.slice(0, space) : cut).replace(/[\s,;:.–—-]+$/, "")}…`;
}

/** Every FAQ item in a page, wherever it sits, and in FAQ documents it links to. */
export function findFaqs(doc, faqDocs = []) {
  const linked = new Map(faqDocs.map((d) => [d._id, d]));
  const found = [], followed = new Set();
  (function walk(node) {
    if (Array.isArray(node)) return node.forEach(walk);
    if (!isObject(node)) return;
    if (node._type === "faqItem") { if (filled(node.question) && filled(node.answer)) found.push(node); return; }
    if (linked.has(node._ref) && !followed.has(node._ref)) { followed.add(node._ref); walk(linked.get(node._ref).items); }
    Object.values(node).forEach(walk);
  })(doc);
  const seen = new Set();
  return found.filter((f) => !seen.has(norm(f.question)) && seen.add(norm(f.question)));
}

/** Own text of a page, as plain text. */
function source(doc, toText) {
  // Only the start is ever used; cutting first keeps huge text cheap.
  const text = (...values) => { const v = values.find(filled); return v ? toText(v.slice(0, 2000)).trim().replace(/\s+/g, " ") || undefined : undefined; };
  return {
    title: text(doc.title, doc.header_?.title, doc.hero_?.title),
    description: text(doc.description, doc.header_?.description, doc.hero_?.description),
    image: imageAddress(doc.image),
  };
}
/** Fill a template; undefined if a value it needs is missing. */
const fill = (template, values) => {
  let ok = true;
  const out = template.replace(/\{(\w+)\}/g, (_, k) => values[k] ?? ((ok = false), ""));
  return ok ? out.trim() : undefined;
};

/** SEO for one page, plus anything wrong with it. Expects valid site settings. */
export function resolvePage(doc, override, site, { faqDocs = [], paths, fileExists = () => true, today = now(), toText = (s) => s } = {}) {
  const problems = [];
  const report = (path, message, help) => problems.push({ path: `${doc._id}${path}`, message, help });
  const route = routeOf(doc);

  // Keep only override values that pass their rules.
  const own = {};
  for (const [name, field] of Object.entries(PAGE_FIELDS)) {
    if (name === "jsonLd") continue;
    const found = [];
    checkField(override?.[name], field, `${overrideId(doc._id)}.${name}`, found, today);
    problems.push(...found);
    if (found.length === 0 && override?.[name] != null && override[name] !== "" && !Array.isArray(override[name])) own[name] = override[name];
  }
  for (const name of Object.keys(override ?? {})) {
    if (!name.startsWith("_") && name !== "page" && !(name in PAGE_FIELDS)) problems.push({ path: `${overrideId(doc._id)}.${name}`, message: "is not a known field (misspelled?)", help: `Known fields: ${Object.keys(PAGE_FIELDS).join(", ")}` });
  }
  // Anything but a clear "off" keeps a page out of search.
  const noindexAsked = override?.noindex != null && override.noindex !== false;

  const defaults = site.seo.defaults.find((d) => d.docType === doc._type);
  const values = source(doc, toText);
  const picture = parseImage(doc.image);
  if (doc.image != null && doc.image !== "" && !picture) report(".image", "cannot be used", "Use a Sanity image, its https://cdn.sanity.io address, or a path such as /images/blog/name.webp.");
  else if (picture?.kind === "local" && !fileExists(picture.path)) {
    report(".image", `points to ${picture.path}, which is not in the site's files, so no image shows`, "Upload the image to Sanity and use the image field or its https://cdn.sanity.io address.");
    values.image = undefined;
  }
  const usable = (v) => (filled(v) && !PLACEHOLDER.test(v.slice(0, 500)) ? v : undefined);
  const title = own.title ?? usable(fill(defaults.title, values));
  const rawDescription = own.description ?? usable(fill(defaults.description, values));
  const description = rawDescription && (own.description ?? clip(rawDescription));
  if (!title) report("", "has no usable title", "Give the page a title, or an override.");
  if (!description) report("", "has no usable description", "Give the page a description, or an override.");

  if (own.canonical) {
    const url = new URL(own.canonical);
    const bad = url.origin !== new URL(site.seoUrl).origin ? "points to another site"
      : url.pathname === route ? "is this page's own address; leave it empty"
      : url.search || url.hash || (paths && !paths.has(url.pathname)) ? "is not the address of a page on this site" : undefined;
    if (bad) { report(".canonical", bad, PAGE_FIELDS.canonical.description); delete own.canonical; }
  }

  // Dates: what the page shows wins.
  const published = day(doc.date) ?? day(doc.datePublished);
  const shown = day(doc.dateModified) ?? day(doc.lastUpdated);
  let modified = shown ?? own.dateModified;
  if (shown && own.dateModified && shown !== own.dateModified) report(".dateModified", `override differs from the date on the page (${shown}); the page's date is used`, PAGE_FIELDS.dateModified.description);
  if (modified && modified > today) { report(".dateModified", "is in the future", PAGE_FIELDS.dateModified.description); modified = undefined; }
  if (modified && published && modified < published) { report(".dateModified", "is before the publish date", PAGE_FIELDS.dateModified.description); modified = undefined; }

  // Structured data: defaults, with overrides laid on top item by item.
  const changes = Array.isArray(override?.jsonLd) ? override.jsonLd : [];
  if (override?.jsonLd != null && !Array.isArray(override.jsonLd)) problems.push({ path: `${overrideId(doc._id)}.jsonLd`, message: "must be a list", help: PAGE_FIELDS.jsonLd.description });
  const seen = new Set();
  const good = changes.filter((item, i) => {
    const found = [];
    checkItems([item], `${overrideId(doc._id)}.jsonLd[${i}]`, found, { today });
    if (item?._type && seen.has(item._type) && !JSON_LD_ITEMS[item._type]?.repeatable) found.push({ path: `${overrideId(doc._id)}.jsonLd[${i}]`, message: `repeats ${item._type}; use one`, help: JSON_LD_ITEMS[item._type]?.description ?? "" });
    seen.add(item?._type);
    if (JSON_LD_ITEMS[item?._type]?.alwaysOn && item.enabled === false) found.push({ path: `${overrideId(doc._id)}.jsonLd[${i}]`, message: "cannot be switched off", help: JSON_LD_ITEMS[item._type].description });
    problems.push(...found);
    return found.length === 0;
  });
  const byType = new Map(good.filter((i) => !JSON_LD_ITEMS[i._type].repeatable).map((i) => [i._type, i]));
  const merged = [
    ...defaults.jsonLd.map((d) => {
      if (JSON_LD_ITEMS[d._type].repeatable) return d;
      const o = byType.get(d._type);
      byType.delete(d._type);
      return o ? { ...d, ...Object.fromEntries(Object.entries(o).filter(([, v]) => v !== "" && v != null && !(Array.isArray(v) && v.length === 0))) } : d;
    }),
    ...byType.values(),
    ...good.filter((i) => JSON_LD_ITEMS[i._type].repeatable),
  ].filter((i) => i.enabled !== false);

  const items = [];
  for (const item of merged) {
    const skip = (message) => report(`.${item._type}`, `${message}; left out`, JSON_LD_ITEMS[item._type].description);
    const missing = JSON_LD_ITEMS[item._type].required.filter((k) => item[k] === undefined || item[k] === "");
    if (missing.length) { skip(`needs ${missing.join(", ")}`); continue; }
    if (item._type === "schemaBreadcrumb") {
      const lost = item.parents.filter((c) => paths && !paths.has(c.path));
      if (lost.length) { skip(`links to ${lost.map((c) => c.path).join(", ")}, which is not a page`); continue; }
      if (item.parents.some((c) => c.path === route)) { skip("lists this page as its own parent"); continue; }
      if (!item.parents.length) { skip("has no parent pages"); continue; }
      items.push({ ...item, parents: [...item.parents, { name: values.title ?? title, path: route }] });
    } else if (item._type === "schemaService") {
      const serviceType = fill(item.serviceType, values);
      if (!serviceType || !values.title) { skip("needs the page's title"); continue; }
      items.push({ ...item, serviceType, name: values.title, areaServed: item.areaServed?.length ? item.areaServed : site.seo.organization.areaServed });
    } else if (item._type === "schemaArticle") {
      if (!values.title) { skip("needs the post's title"); continue; }
      if (!published) { skip("needs the post's publish date"); continue; }
      if (published > today) { skip("the post's publish date is in the future"); continue; }
      const byline = filled(doc.author?.name) ? doc.author.name.trim() : undefined;
      items.push({ ...item, headline: values.title, image: item.image || values.image, author: byline && byline !== site.seo.organization.name.trim() ? byline : undefined });
    } else if (item._type === "schemaFaq") {
      const faqs = findFaqs(doc, faqDocs).map((f) => ({ question: toText(f.question).trim(), answer: toText(f.answer).trim() })).filter((f) => f.question && f.answer);
      if (faqs.length) items.push({ ...item, faqs });
    } else items.push(item);
  }

  const incomplete = !route || !title || !description;
  return {
    problems, incomplete, route,
    seo: {
      title: title ?? values.title ?? site.seo.website.name, description, canonical: own.canonical,
      noindex: noindexAsked || incomplete, ogTitle: own.ogTitle, ogDescription: own.ogDescription, ogImage: own.ogImage,
      datePublished: published, dateModified: modified, items: incomplete ? [] : items,
    },
  };
}

/**
 * When each page last changed, from Sanity's own edit times: the page, the
 * sections only it uses, its SEO document and, for lists, the newest entry.
 * Sections shared by several pages do not count, so one edit to a shared
 * block does not re-date the whole site.
 */
export function lastChanged(pages, overrides = [], parts = []) {
  const partById = new Map(parts.filter(isObject).map((d) => [d._id, d]));
  const uses = new Map(), usedBy = new Map();
  for (const doc of pages) {
    const found = new Set();
    (function walk(node) {
      if (Array.isArray(node)) return node.forEach(walk);
      if (!isObject(node)) return;
      const part = partById.get(node._ref);
      if (part && !found.has(part._id)) { found.add(part._id); walk(part); }
      Object.values(node).forEach(walk);
    })(doc);
    uses.set(doc._id, found);
    for (const id of found) usedBy.set(id, (usedBy.get(id) ?? 0) + 1);
  }
  const seo = new Map(overrides.filter(isObject).map((o) => [o._id, o]));
  return new Map(pages.map((doc) => {
    const times = [doc._updatedAt, seo.get(overrideId(doc._id))?._updatedAt];
    for (const id of uses.get(doc._id)) if (usedBy.get(id) === 1) times.push(partById.get(id)._updatedAt);
    if (Object.hasOwn(LISTS, doc._type)) for (const p of pages) if (p._type === LISTS[doc._type]) times.push(p._createdAt);
    const valid = times.filter((t) => typeof t === "string" && !Number.isNaN(Date.parse(t))).map((t) => new Date(t).toISOString());
    return [doc._id, valid.sort().at(-1)];
  }));
}

/** One page, including its finished head. Never throws: a page that cannot be worked out is noindex. */
export function resolveSafely(doc, override, site, options) {
  try {
    const page = { doc, ...resolvePage(doc, override, site, options) };
    return { ...page, head: buildHead(page, site) };
  } catch (error) {
    const route = routeOf(doc);
    const seo = { title: site.seo.website.name, noindex: true, items: [] };
    return { doc, route, seo, incomplete: true, head: buildHead({ seo, route }, site), problems: [{ path: doc._id, message: `could not be read (${error.message}); kept out of search`, help: "Check this page's fields and its override." }] };
  }
}

/** Everything. `stop` blocks a build; `report` lists pages that need attention. */
export function resolveAll({ site, pages, overrides, faqDocs, parts }, options = {}) {
  const stop = validateSite(site, options);
  if (stop.length) return { stop, report: [], pages: [] };
  pages = pages.filter(isObject);
  const { routes, refused } = pickPages(pages);
  const paths = new Set(routes.values());
  for (const t of Object.keys(ROUTES)) if (!ROUTES[t].includes("{slug}") && !pages.some((p) => p._type === t)) stop.push({ path: t, message: "document is missing", help: `The page ${ROUTES[t]} needs it.` });
  for (const d of site.seo.defaults) for (const i of d.jsonLd) for (const c of i.parents ?? []) if (!paths.has(c.path)) stop.push({ path: `seo-site.defaults[${d.docType}]`, message: `breadcrumb links to ${c.path}, which is not a page`, help: JSON_LD_ITEMS.schemaBreadcrumb.description });

  const byId = new Map(overrides.filter(isObject).map((o) => [o._id, o]));
  const changed = lastChanged(pages.filter((p) => routes.has(p._id)), overrides, parts);
  const resolved = [], report = refused.map(({ row, message }) => ({ path: row._id, message, help: "Give it its own slug: words joined with hyphens, not used by another page." }));
  for (const doc of pages) {
    if (!routes.has(doc._id)) continue;
    resolved.push({ ...resolveSafely(doc, byId.get(overrideId(doc._id)), site, { ...options, faqDocs, paths }), lastmod: changed.get(doc._id) });
  }
  report.push(...resolved.flatMap((r) => r.problems));
  const ids = new Set(pages.map((p) => overrideId(p._id)));
  for (const o of overrides.filter(isObject)) if (!ids.has(o._id)) report.push({ path: o._id, message: "belongs to no published page", help: "Its _id must be seo-<page id>." });
  for (const field of ["title", "description"]) {
    const first = new Map();
    for (const r of resolved) {
      if (r.seo.noindex || !r.seo[field]) continue;
      const v = norm(r.seo[field]);
      if (first.has(v)) report.push({ path: r.doc._id, message: `has the same ${field} as ${first.get(v)}`, help: "Each should be unique. Change the page's own text or add an override." });
      else first.set(v, r.doc._id);
    }
  }
  return { stop, report, pages: resolved };
}
