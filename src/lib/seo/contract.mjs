// The SEO contract: every SEO field Sanity holds, what it means, and the rules
// it must pass. It contains no page copy and no business facts. Validation,
// rendering, the editor guide (docs/SEO.md) and the write script all read it.
//
// Three layers, all in Sanity:
//   1. seo-site        one document: organization, robots.txt, defaults per page type
//   2. the page itself its own title, description, dates, image and FAQ
//   3. seo-<page id>   optional overrides for one page
// SEO lives outside page documents, so publishing a page draft cannot erase it.
//
// Plain JavaScript so Astro, Vitest and node scripts share one copy.

/**
 * @typedef {object} Field
 * @property {"string"|"text"|"template"|"boolean"|"date"|"url"|"path"|"email"|"json"|"list"|"object"} type
 * @property {string} description  What an editor needs to know.
 * @property {string} [example]
 * @property {boolean} [required]
 * @property {number} [min]   Shortest length (or fewest list items).
 * @property {number} [max]   Longest length (or most list items).
 * @property {string[]} [options]
 * @property {Record<string, Field>} [fields]  For "object" and "list" items.
 */

/** Page document type to URL. A "{slug}" type can have any number of pages. */
export const ROUTES = {
  home: "/",
  aboutPage: "/about",
  servicesPage: "/services",
  servicePage: "/services/{slug}",
  featurePage: "/features/{slug}",
  integrationsPage: "/integrations",
  toolsPage: "/tools",
  faqsPage: "/faqs",
  contactPage: "/contact",
  blogPage: "/blog",
  blogPost: "/blog/{slug}",
  legalPage: "/{slug}",
};
export const isRepeatable = (type) => ROUTES[type].includes("{slug}");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;
const SLUG_MAX = 150;
export const routeOf = (doc) => {
  if (!Object.hasOwn(ROUTES, doc?._type ?? "")) return undefined;
  if (!isRepeatable(doc._type)) return ROUTES[doc._type];
  const slug = doc.slug?.current;
  return typeof slug === "string" && slug.length <= SLUG_MAX && SLUG.test(slug) ? ROUTES[doc._type].replace("{slug}", slug) : undefined;
};

/** What a template may use. Each is read from the page document. */
export const TOKENS = ["title", "description", "image"];

const area = {
  type: "list", max: 30, description: "Places served. Only list places the page or business really covers.",
  fields: {
    type: { type: "string", required: true, options: ["State", "AdministrativeArea", "City"], description: "State, AdministrativeArea (a county) or City." },
    name: { type: "string", required: true, max: 80, description: "Place name.", example: "Maryland" },
  },
};
const enabled = { type: "boolean", description: "Off hides this item on this page. Leave empty for on." };
const PAGE_TYPES = ["WebPage", "AboutPage", "ContactPage", "CollectionPage", "ItemPage"];

/** JSON-LD items. `defaults`: fields a page type sets. `fields`: fields one page may override. */
export const JSON_LD_ITEMS = {
  schemaWebPage: {
    alwaysOn: true,
    description: "Says what kind of page this is. Title, description and dates are filled in automatically.",
    fields: { pageType: { type: "string", options: PAGE_TYPES, description: "WebPage for most pages, AboutPage, ContactPage, CollectionPage for lists, ItemPage for one item." } },
    required: ["pageType"],
  },
  schemaBreadcrumb: {
    description: "The trail from the homepage to this page. This page is added to the end automatically.",
    fields: {
      enabled,
      parents: {
        type: "list", max: 5, description: "The pages above this one, in order, homepage first. Every path must be a real page.",
        fields: {
          name: { type: "string", required: true, max: 110, description: "Label.", example: "Services" },
          path: { type: "path", required: true, description: "Site path starting with /.", example: "/services" },
        },
      },
    },
    required: ["parents"],
  },
  schemaService: {
    description: "A service this page sells. Name and description come from the page; the provider is always the organization.",
    fields: {
      enabled,
      serviceType: { type: "template", max: 80, description: "Plain category. {title} uses the page's own title.", example: "Local search engine optimization" },
      areaServed: { ...area, description: "Leave empty to use the organization's areas." },
    },
    required: ["serviceType"],
  },
  schemaArticle: {
    description: "A blog post. Headline, image, author and dates come from the post. A byline matching the organization's name uses the organization; any other is a person.",
    fields: { enabled, image: { type: "path", description: "Leave empty to use the post's main image." } },
    required: [],
  },
  schemaFaq: {
    description: "Marks up FAQ items found in the page's own content. Only questions and answers visible on the page are published, so nothing is typed here.",
    fields: { enabled },
    required: [],
  },
  schemaCustom: {
    repeatable: true,
    description: "Any other schema.org item, as JSON. Use only when no type above fits. Describe only what visitors can see on the page.",
    fields: {
      enabled,
      label: { type: "string", min: 3, max: 60, description: "What this is, for other editors." },
      json: { type: "json", max: 5000, description: "One JSON object with an @type and no @context. No reviews or ratings of ourselves.", example: '{"@type":"VideoObject","name":"..."}' },
    },
    required: ["label", "json"],
  },
};

/** One page's overrides: the seo-<page id> document. Everything is optional. */
export const PAGE_FIELDS = {
  title: {
    type: "string", min: 10, max: 80,
    description: "The full browser-tab and search-result title, used exactly as written. Must be unique. Search engines may shorten titles over about 60 characters. Leave empty to use the page type's template.",
    example: "Local SEO for Maryland Businesses | Maryland Insights",
  },
  description: {
    type: "text", min: 50, max: 160,
    description: "The search-result summary, in one or two plain sentences. Must be unique. This is not the visible intro. Leave empty to use the start of the page's own description.",
  },
  canonical: { type: "url", description: "Leave empty. Fill only when this page duplicates another page here that should rank instead." },
  noindex: { type: "boolean", description: "On keeps the page out of search engines and the sitemap. Leave empty for normal pages." },
  ogTitle: { type: "string", min: 10, max: 90, description: "Title on shared links. Leave empty to use the title." },
  ogDescription: { type: "text", min: 30, max: 200, description: "Summary on shared links. Leave empty to use the description." },
  ogImage: { type: "path", description: "Share image, 1200x630: a site path or https URL. Leave empty to use the generated image.", example: "/images/share/local-seo.png" },
  dateModified: { type: "date", description: "The day the content last changed in a way a reader would notice. Used in structured data only; sitemap dates are automatic. Only for pages with no date of their own; a date on the page always wins. Never a future date.", example: "2026-10-14" },
  jsonLd: { type: "list", max: 10, description: "Changes to the page type's structured data. Add an item to change or switch off that item, or to add a schemaCustom." },
};

/** Defaults for one page type, inside seo-site.defaults. */
export const DEFAULT_FIELDS = {
  docType: { type: "string", required: true, options: Object.keys(ROUTES), description: "The page type these defaults apply to. Every type needs exactly one entry." },
  title: { type: "template", required: true, max: 120, description: "Title pattern. {title} is the page's own title.", example: "{title} | Maryland Insights" },
  description: { type: "template", required: true, max: 200, description: "Description pattern. {description} is the page's own description, cut at a sentence or word to fit 160 characters.", example: "{description}" },
  jsonLd: { type: "list", required: true, min: 1, max: 10, description: "Structured data every page of this type gets. Must include schemaWebPage." },
};

/** The seo-site document. */
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
  defaults: { type: "list", required: true, min: 1, max: 60, fields: DEFAULT_FIELDS, description: "What every page of each type gets with no setup. A new page works as soon as it is published." },
};

export const SITE_ID = "seo-site";
/** IDs use "-" because Sanity hides documents whose _id contains "." from public reads. */
export const overrideId = (pageId) => `seo-${pageId}`;

const types = JSON.stringify(Object.keys(ROUTES));
const page = `{..., "header_": header->{title, description}, "hero_": hero->{title, "description": content}}`;
const site = `{
  "seo": *[_id == "${SITE_ID}"][0],
  ...*[_type == "siteSettings"][0]{seoUrl, business, "socialLinks": socialLinks[].url}
}`;
// FAQ documents that pages reference.
const faqDocs = `*[count(items[_type == "faqItem"]) > 0]{_id, items}`;
/** Pages that list others: a new one of these is an update to the list. */
export const LISTS = { servicesPage: "servicePage", blogPage: "blogPost" };
// Section documents, for finding when a page's own content last changed.
const parts = `*[!(_type in ${types}) && !(_type in ["pageSeo", "seoSite", "siteSettings"]) && !(_type match "sanity.*") && !(_type match "system.*") && !(_id in path("_.**"))]`;
export const ALL_QUERY = `{
  "parts": ${parts},
  "site": ${site},
  "pages": *[_type in ${types} && draft != true]${page},
  "overrides": *[_type == "pageSeo" && defined(_id)],
  "faqDocs": ${faqDocs}
}`;
export const ONE_QUERY = `{
  "all": *[_type in ${types} && draft != true]{_id, _type, slug, _createdAt},
  "site": ${site},
  "pages": *[_id == $id]${page},
  "overrides": *[_id == $seoId],
  "faqDocs": ${faqDocs}
}`;
/** Just enough to know which documents become pages. */
export const PAGE_LIST_QUERY = `*[_type in ${types} && draft != true]{_id, _type, slug, _createdAt}`;
