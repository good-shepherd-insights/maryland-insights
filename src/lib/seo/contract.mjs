// The SEO contract: every SEO field Sanity holds, what it means, and the rules
// it must pass. It contains no page copy and no business facts. Validation,
// rendering, the editor guide (docs/SEO.md) and the write script all read it.
//
// Plain JavaScript so Astro, Vitest and node scripts share one copy.

/**
 * @typedef {object} Field
 * @property {"string"|"text"|"boolean"|"date"|"url"|"path"|"email"|"json"|"list"|"object"} type
 * @property {string} description  What an editor needs to know.
 * @property {string} [example]
 * @property {boolean} [required]
 * @property {number} [min]   Shortest length (or fewest list items).
 * @property {number} [max]   Longest length (or most list items).
 * @property {string[]} [options]
 * @property {Record<string, Field>} [fields]  For "object" and "list" items.
 */

/** @type {Record<string, Field>} */
export const PAGE_FIELDS = {
  title: {
    type: "string", required: true, min: 10, max: 80,
    description: "The full browser-tab and search-result title, used exactly as written. Name the page and who it is for. Must be unique across the site. Search engines may shorten titles over about 60 characters.",
    example: "Local SEO for Maryland Businesses | Maryland Insights",
  },
  description: {
    type: "text", required: true, min: 50, max: 160,
    description: "The search-result summary. One or two plain sentences saying what the page offers. This is not the visible intro on the page. Must be unique across the site.",
    example: "Google Business Profile, listings and review work that helps Maryland businesses get found, county by county.",
  },
  canonical: {
    type: "url",
    description: "Leave empty. Fill only when this page duplicates another URL that should rank instead.",
  },
  noindex: {
    type: "boolean",
    description: "Turn on to keep the page out of search engines and the sitemap. Leave off for normal pages.",
  },
  ogTitle: { type: "string", min: 10, max: 90, description: "Title on shared links. Leave empty to use the title." },
  ogDescription: { type: "text", min: 30, max: 200, description: "Summary on shared links. Leave empty to use the description." },
  ogImage: { type: "path", description: "Share image: a site path or https URL, 1200x630. Leave empty to use the generated image.", example: "/images/share/local-seo.png" },
  dateModified: {
    type: "date",
    description: "The day the page's content last changed in a way a reader would notice. Sets the sitemap date. Leave empty if you do not know. Never set a future date.",
    example: "2026-10-14",
  },
  jsonLd: {
    type: "list", required: true, min: 1, max: 10,
    description: "The structured data for this page. Add one item per thing the page describes. Every page needs exactly one schemaWebPage.",
  },
};

const enabled = { type: "boolean", required: true, description: "On publishes this item. Off keeps it saved but hidden." };
const area = {
  type: "list", max: 30, description: "Places served. Only list places the page or business really covers.",
  fields: {
    type: { type: "string", required: true, options: ["State", "AdministrativeArea", "City"], description: "State, AdministrativeArea (a county) or City." },
    name: { type: "string", required: true, description: "Place name.", example: "Maryland" },
  },
};

/** @type {Record<string, {description: string, once?: boolean, fields: Record<string, Field>}>} */
export const JSON_LD_ITEMS = {
  schemaWebPage: {
    once: true,
    description: "Says what kind of page this is. Title, description and dates come from the fields above.",
    fields: {
      enabled,
      pageType: {
        type: "string", required: true,
        options: ["WebPage", "AboutPage", "ContactPage", "CollectionPage", "ItemPage"],
        description: "WebPage for most pages, AboutPage, ContactPage, CollectionPage for lists (blog, services, tools), ItemPage for one item.",
      },
    },
  },
  schemaBreadcrumb: {
    once: true,
    description: "The trail from the homepage to this page. The last item is this page.",
    fields: {
      enabled,
      items: {
        type: "list", required: true, min: 2, max: 6, description: "In order, homepage first. Every path must be a real page.",
        fields: {
          name: { type: "string", required: true, max: 110, description: "Label.", example: "Services" },
          path: { type: "path", required: true, description: "Site path starting with /.", example: "/services" },
        },
      },
    },
  },
  schemaService: {
    once: true,
    description: "A service this page sells. The provider is always the organization in site settings.",
    fields: {
      enabled,
      name: { type: "string", required: true, min: 3, max: 110, description: "Service name as shown on the page.", example: "Local SEO" },
      description: { type: "text", required: true, min: 50, max: 500, description: "What the service includes. Must match what the page says." },
      serviceType: { type: "string", required: true, min: 3, max: 80, description: "Plain category.", example: "Local search engine optimization" },
      areaServed: area,
    },
  },
  schemaArticle: {
    once: true,
    description: "A blog post. The publish date comes from the post's own date; the modified date from dateModified.",
    fields: {
      enabled,
      headline: { type: "string", required: true, min: 10, max: 110, description: "The post's headline as shown." },
      image: { type: "path", required: true, description: "The post's main image." },
      authorType: { type: "string", required: true, options: ["Organization", "Person"], description: "Organization uses the site's organization as author. Person needs authorName." },
      authorName: { type: "string", max: 80, description: "Required when authorType is Person. Must match the byline on the page." },
    },
  },
  schemaFaq: {
    once: true,
    description: "Marks up the questions this page shows. They are read from the page's own FAQ, so there is nothing to type and nothing to drift.",
    fields: { enabled },
  },
  schemaCustom: {
    description: "Any other schema.org item, as JSON. Use only when no type above fits. Describe only what visitors can see on the page.",
    fields: {
      enabled,
      label: { type: "string", required: true, min: 3, max: 60, description: "What this is, for other editors." },
      json: { type: "json", required: true, description: "One JSON object with an @type and no @context. No reviews or ratings of ourselves." , example: '{"@type":"VideoObject","name":"..."}' },
    },
  },
};

/** @type {Record<string, Field>} */
export const SITE_FIELDS = {
  robotsTxt: { type: "text", required: true, min: 20, max: 8000, description: "The whole robots.txt file. One 'User-agent: *' group, no Crawl-delay, and a Sitemap line. Cloudflare can add its own rules in front." },
  notFoundTitle: { type: "string", required: true, min: 10, max: 80, description: "Title of the 404 page." },
  notFoundDescription: { type: "text", required: true, min: 50, max: 160, description: "Description of the 404 page. It is never indexed." },
  organization: {
    type: "object", required: true, description: "Who runs the site. Address and phone come from Business in site settings, social profiles from Social links.",
    fields: {
      type: { type: "string", required: true, options: ["Organization", "LocalBusiness", "ProfessionalService"], description: "Organization unless customers can visit in person during listed hours." },
      name: { type: "string", required: true, min: 2, max: 80, description: "Public name." },
      legalName: { type: "string", max: 120, description: "Registered legal name. Leave empty if unsure." },
      description: { type: "text", required: true, min: 50, max: 300, description: "What the company does and for whom." },
      logo: { type: "path", required: true, description: "Logo path or https URL, at least 112x112." },
      email: { type: "email", description: "Public contact email." },
      areaServed: area,
    },
  },
  website: {
    type: "object", required: true, description: "The site itself.",
    fields: {
      name: { type: "string", required: true, min: 2, max: 80, description: "Site name." },
      language: { type: "string", required: true, options: ["en-US"], description: "Content language." },
    },
  },
};

/** Document type to URL. Every type listed here must have valid `seo`. */
export const ROUTES = {
  home: () => "/",
  aboutPage: () => "/about",
  servicesPage: () => "/services",
  servicePage: (slug) => `/services/${slug}`,
  featurePage: (slug) => `/features/${slug}`,
  integrationsPage: () => "/integrations",
  toolsPage: () => "/tools",
  faqsPage: () => "/faqs",
  contactPage: () => "/contact",
  blogPage: () => "/blog",
  blogPost: (slug) => `/blog/${slug}`,
  legalPage: (slug) => `/${slug}`,
};

/** Items a document type must carry (beyond schemaWebPage). */
export const REQUIRED_ITEMS = {
  servicePage: ["schemaBreadcrumb", "schemaService"],
  featurePage: ["schemaBreadcrumb", "schemaService"],
  blogPost: ["schemaBreadcrumb", "schemaArticle"],
};

export const routeOf = (doc) => ROUTES[doc._type]?.(doc.slug);

const types = JSON.stringify(Object.keys(ROUTES));
/** One projection for every page. `faqs` is exactly what each page renders. */
const projection = `{
  _id, _type, title, seo, "slug": slug.current, "datePublished": date, "byline": author.name, _rev,
  "docModified": coalesce(dateModified, lastUpdated),
  "faqs": select(
    _type == "home" => faq->items,
    _type == "faqsPage" => list->items,
    _type == "featurePage" => sections[_type in ["featureFaq","featureShortAnswers","featureFaqStat","featureFaqStats"]].items[],
    _type in ["servicePage","blogPost"] => faqs
  )[]{question, answer}
}`;
// Singletons keep their fixed _id; slugged types are read by type.
export const ALL_PAGES_QUERY = `*[_type in ${types} && draft != true && !(_id in path("drafts.**")) && !(_id in path("versions.**"))]${projection}`;
export const PAGE_QUERY = `*[_id == $id][0]${projection}`;
export const SITE_QUERY = `*[_type == "siteSettings" && !(_id in path("drafts.**"))][0]{_id, _rev, seo, seoUrl, locale, business, "socialLinks": socialLinks[].url, "ogWidth": metaImageWidth, "ogHeight": metaImageHeight}`;
