import { routeOf } from "./contract.mjs";
import { parseCustom } from "./validate.mjs";

// Turns validated Sanity data into head values and a schema.org graph.
// It maps fields only: every value printed comes from Sanity.

const prune = (v) => {
  if (Array.isArray(v)) { const a = v.map(prune).filter((x) => x !== undefined); return a.length ? a : undefined; }
  if (v && typeof v === "object") {
    const o = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, prune(x)]).filter(([, x]) => x !== undefined));
    return Object.keys(o).some((k) => k !== "@type") ? o : undefined;
  }
  return v === "" || v === null ? undefined : v;
};
const areas = (list) => list?.map((a) => ({ "@type": a.type, name: a.name }));

export function buildHead(doc, site, { toText }) {
  const base = site.seoUrl;
  const abs = (p) => (p ? new URL(p, `${base}/`).toString() : undefined);
  const path = routeOf(doc);
  const seo = doc.seo;
  // The homepage URL has a trailing slash, matching the site's canonical tag.
  const url = seo.canonical || new URL(path, `${base}/`).toString();
  const orgId = `${base}/#organization`, siteId = `${base}/#website`, pageId = `${url}#webpage`;
  const org = site.seo.organization, b = site.business ?? {};
  const on = (seo.jsonLd ?? []).filter((i) => i.enabled);
  const has = (t) => on.some((i) => i._type === t);

  const graph = [
    {
      "@type": org.type, "@id": orgId, name: org.name, legalName: org.legalName, url: `${base}/`, description: org.description,
      logo: { "@type": "ImageObject", url: abs(org.logo) }, email: org.email, telephone: b.telephone,
      address: { "@type": "PostalAddress", streetAddress: b.streetAddress, addressLocality: b.addressLocality, addressRegion: b.addressRegion, postalCode: b.postalCode, addressCountry: b.addressCountry },
      areaServed: areas(org.areaServed), sameAs: site.socialLinks,
    },
    { "@type": "WebSite", "@id": siteId, url: `${base}/`, name: site.seo.website.name, inLanguage: site.seo.website.language, publisher: { "@id": orgId } },
  ];

  for (const item of on) {
    if (item._type === "schemaWebPage") graph.push({
      "@type": item.pageType, "@id": pageId, url, name: seo.title, description: seo.description, dateModified: seo.dateModified,
      datePublished: doc.datePublished, inLanguage: site.seo.website.language, isPartOf: { "@id": siteId },
      about: path === "/" || item.pageType === "AboutPage" ? { "@id": orgId } : undefined,
      breadcrumb: has("schemaBreadcrumb") ? { "@id": `${url}#breadcrumb` } : undefined,
    });
    if (item._type === "schemaBreadcrumb") graph.push({
      "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
      itemListElement: item.items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: abs(c.path) })),
    });
    if (item._type === "schemaService") graph.push({
      "@type": "Service", "@id": `${url}#service`, name: item.name, description: item.description, serviceType: item.serviceType, url,
      provider: { "@id": orgId }, areaServed: areas(item.areaServed), mainEntityOfPage: { "@id": pageId },
    });
    if (item._type === "schemaArticle") graph.push({
      "@type": "BlogPosting", "@id": `${url}#article`, headline: item.headline, description: seo.description, image: [abs(item.image)], url,
      datePublished: doc.datePublished, dateModified: seo.dateModified ?? doc.datePublished, inLanguage: site.seo.website.language,
      author: item.authorType === "Person" ? { "@type": "Person", name: item.authorName } : { "@id": orgId },
      publisher: { "@id": orgId }, mainEntityOfPage: { "@id": pageId },
    });
    if (item._type === "schemaFaq") graph.push({
      "@type": "FAQPage", "@id": `${url}#faq`, isPartOf: { "@id": pageId },
      mainEntity: (doc.faqs ?? []).map((f) => ({ "@type": "Question", name: toText(f.question), acceptedAnswer: { "@type": "Answer", text: toText(f.answer) } })),
    });
    if (item._type === "schemaCustom") { const { value } = parseCustom(item.json); if (value) graph.push(value); }
  }

  return {
    title: seo.title, description: seo.description, dateModified: seo.dateModified, canonical: url, noindex: seo.noindex === true,
    ogTitle: seo.ogTitle || seo.title, ogDescription: seo.ogDescription || seo.description, ogImage: abs(seo.ogImage),
    graph: graph.map(prune).filter(Boolean),
  };
}

/** JSON safe inside a <script> tag, without changing any value. */
export const serializeGraph = (graph) =>
  JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

/** Sitemap entries: indexable pages only, with a date only when Sanity has one. */
export const sitemapEntries = (pages, baseUrl) => new Map(pages.filter((p) => p.seo).map((p) => [
  new URL(routeOf(p), `${baseUrl}/`).toString().replace(/\/$/, ""),
  { noindex: p.seo.noindex === true || Boolean(p.seo.canonical), lastmod: p.seo.dateModified ?? p.datePublished?.slice(0, 10) },
]));
