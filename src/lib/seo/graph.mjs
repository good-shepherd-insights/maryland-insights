import { parseCustom } from "./validate.mjs";

// Turns resolved SEO into head values and a schema.org graph. It maps fields
// only: every value printed comes from Sanity.

const prune = (v) => {
  if (Array.isArray(v)) { const a = v.map(prune).filter((x) => x !== undefined); return a.length ? a : undefined; }
  if (v && typeof v === "object") {
    const o = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, prune(x)]).filter(([, x]) => x !== undefined));
    return Object.keys(o).some((k) => k !== "@type") ? o : undefined;
  }
  return v === "" || v === null ? undefined : v;
};
const areas = (list) => list?.map((a) => ({ "@type": a.type, name: a.name }));

export function buildHead({ seo, route }, site) {
  const base = site.seoUrl;
  const abs = (p) => (p ? new URL(p, `${base}/`).toString() : undefined);
  const own = route ? abs(route) : undefined;
  const url = seo.canonical || own;
  const orgId = `${base}/#organization`, siteId = `${base}/#website`, pageId = `${url}#webpage`;
  const org = site.seo.organization, b = site.business ?? {}, lang = site.seo.website.language;
  const has = (t) => seo.items.some((i) => i._type === t);

  const graph = seo.items.length === 0 ? [] : [
    {
      "@type": org.type, "@id": orgId, name: org.name, legalName: org.legalName, url: `${base}/`, description: org.description,
      logo: { "@type": "ImageObject", url: abs(org.logo) }, email: org.email, telephone: b.telephone,
      address: { "@type": "PostalAddress", streetAddress: b.streetAddress, addressLocality: b.addressLocality, addressRegion: b.addressRegion, postalCode: b.postalCode, addressCountry: b.addressCountry },
      areaServed: areas(org.areaServed), sameAs: site.socialLinks,
    },
    { "@type": "WebSite", "@id": siteId, url: `${base}/`, name: site.seo.website.name, inLanguage: lang, publisher: { "@id": orgId } },
  ];
  const map = {
    schemaWebPage: (i) => ({
      "@type": i.pageType, "@id": pageId, url, name: seo.title, description: seo.description, datePublished: seo.datePublished, dateModified: seo.dateModified,
      inLanguage: lang, isPartOf: { "@id": siteId }, about: route === "/" || i.pageType === "AboutPage" ? { "@id": orgId } : undefined,
      breadcrumb: has("schemaBreadcrumb") ? { "@id": `${url}#breadcrumb` } : undefined,
    }),
    schemaBreadcrumb: (i) => ({
      "@type": "BreadcrumbList", "@id": `${url}#breadcrumb`,
      itemListElement: i.parents.map((c, n) => ({ "@type": "ListItem", position: n + 1, name: c.name, item: abs(c.path) })),
    }),
    schemaService: (i) => ({
      "@type": "Service", "@id": `${url}#service`, name: i.name, description: seo.description, serviceType: i.serviceType, url,
      provider: { "@id": orgId }, areaServed: areas(i.areaServed), mainEntityOfPage: { "@id": pageId },
    }),
    schemaArticle: (i) => ({
      "@type": "BlogPosting", "@id": `${url}#article`, headline: i.headline, description: seo.description, image: i.image ? [abs(i.image)] : undefined, url,
      datePublished: seo.datePublished, dateModified: seo.dateModified ?? seo.datePublished, inLanguage: lang,
      author: i.author ? { "@type": "Person", name: i.author } : { "@id": orgId }, publisher: { "@id": orgId }, mainEntityOfPage: { "@id": pageId },
    }),
    schemaFaq: (i) => ({
      "@type": "FAQPage", "@id": `${url}#faq`, isPartOf: { "@id": pageId },
      mainEntity: i.faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
    }),
    schemaCustom: (i) => parseCustom(i.json).value,
  };
  for (const item of seo.items) graph.push(map[item._type](item));

  return {
    title: seo.title, description: seo.description, canonical: url, noindex: seo.noindex, dateModified: seo.dateModified,
    ogTitle: seo.ogTitle ?? seo.title, ogDescription: seo.ogDescription ?? seo.description, ogImage: abs(seo.ogImage),
    graph: graph.map(prune).filter(Boolean),
  };
}

/** JSON safe inside a <script> tag, without changing any value. */
export const serializeGraph = (graph) => JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");

/** Sitemap entries by URL: which pages to leave out, and real dates only. */
export const sitemapEntries = (pages, baseUrl) => new Map(pages.filter((p) => p.route).map((p) => [
  new URL(p.route, `${baseUrl}/`).toString().replace(/\/$/, ""),
  { exclude: p.seo.noindex || Boolean(p.seo.canonical), lastmod: p.seo.dateModified ?? p.seo.datePublished },
]));
