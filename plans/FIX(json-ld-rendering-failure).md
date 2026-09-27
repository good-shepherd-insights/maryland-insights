# FIX(json-ld-rendering-failure)

## Request
The JSON-LD schema is failing to render due to Markdown and HTML tags leaking into the raw schema definitions inside `Base.astro` and individual page files. We will integrate `astro-seo`, `astro-seo-schema`, and `schema-dts` to formally type-check and sanitize schema rendering. The schema implementation must be comprehensively applied to **every** page in the project, surfacing all relevant semantic data.

## Directory Map
```text
src/
  layouts/
    Base.astro                       (modify)
  pages/
    [regular].astro                  (modify)
    about.astro                      (modify)
    contact.astro                    (modify)
    faqs.astro                       (modify)
    index.astro                      (modify)
    integrations.astro               (modify)
    pricing.astro                    (modify)
    search.astro                     (modify)
    blog/
      index.astro                    (modify)
      [single].astro                 (modify)
    features/
      [single].astro                 (modify)
package.json                         (modify)
```

## Modification Table
| File | Action | Why |
|---|---|---|
| `package.json` | Modify | Add `astro-seo`, `astro-seo-schema`, and `schema-dts` to provide strict schemas. |
| `src/layouts/Base.astro` | Modify | Implement `<SEO>` and `<Schema>` logic with typed `LocalBusiness` and `BreadcrumbList`. |
| `src/pages/[regular].astro` | Modify | Implement `Article` schema. |
| `src/pages/about.astro` | Modify | Implement `AboutPage` and `Person` schema. |
| `src/pages/contact.astro` | Modify | Implement `ContactPage` schema. |
| `src/pages/faqs.astro` | Modify | Implement `FAQPage` schema. |
| `src/pages/index.astro` | Modify | Implement `WebSite` schema with global `SearchAction`. |
| `src/pages/integrations.astro` | Modify | Implement `CollectionPage` schema. |
| `src/pages/pricing.astro` | Modify | Implement `Product` & `AggregateOffer`. |
| `src/pages/search.astro` | Modify | Implement `SearchResultsPage` schema. |
| `src/pages/blog/index.astro` | Modify | Implement `Blog` and `BlogPosting` schema. |
| `src/pages/blog/[single].astro`| Modify | Implement `BlogPosting` schema. |
| `src/pages/features/[single].astro` | Modify | Implement `SoftwareApplication` schema. |

## File-by-File Changes

### `package.json`
**Action:** Modify  
**Why:** Integrate strict typing schema dependencies.

#### Before
```json
  "dependencies": {
    "@astrojs/check": "0.9.6",
    "@astrojs/mdx": "4.3.13",
    "@astrojs/react": "4.4.2",
    "@astrojs/sitemap": "3.6.0",
    "@digi4care/astro-google-tagmanager": "^1.6.0",
    "@justinribeiro/lite-youtube": "^1.9.0",
    "aos": "^2.3.4",
```
#### After
```json
  "dependencies": {
    "@astrojs/check": "0.9.6",
    "@astrojs/mdx": "4.3.13",
    "@astrojs/react": "4.4.2",
    "@astrojs/sitemap": "3.6.0",
    "@digi4care/astro-google-tagmanager": "^1.6.0",
    "@justinribeiro/lite-youtube": "^1.9.0",
    "aos": "^2.3.4",
    "astro-seo": "^0.8.4",
    "astro-seo-schema": "^3.0.1",
    "schema-dts": "^1.1.2",
```

### `src/layouts/Base.astro`
**Action:** Modify  
**Why:** Replaces rigid tags custom generic layout rendering stringification with strict SEO tagging.

#### Before
```astro
---
import TwSizeIndicator from "@/components/TwSizeIndicator.astro";
// ... (unchanged config/module imports)
import { ClientRouter } from "astro:transitions";

// ... (unchanged fonts config)

// types for frontmatters
export interface Props {
  title?: string;
  meta_title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  canonical?: string;
  schema?: any[];
}

const { title, meta_title, description, image, noindex, canonical } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <!-- google tag manager -->
    {
      config.google_tag_manager.enable && (
        <GoogleTagmanager id={config.google_tag_manager.gtm_id} />
      )
    }
    <!-- favicon -->
    <link rel="shortcut icon" href={config.site.favicon} />
    <!-- ... (unchanged link/meta tags, AstroFont block, up to title) ... -->

    <!-- title -->
    <title>
      {plainify(meta_title ? meta_title : title ? title : config.site.title)}
    </title>

    <!-- canonical url -->
    <link
      rel="canonical"
      href={canonical || `${config.site.base_url}/${Astro.url.pathname.replace("/", "")}`}
      item-prop="url"
    />

    <!-- ... (legacy OG and twitter tags removed from here to end of head) ... -->

    <!-- structured data -->
    <script
      type="application/ld+json"
      set:html={JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          // ... (legacy untyped schema)
        ],
      })}
    />
  </head>
```

#### After
```astro
---
import TwSizeIndicator from "@/components/TwSizeIndicator.astro";
// ... (unchanged config/module imports)
import { ClientRouter } from "astro:transitions";
import { SEO } from "astro-seo";
import { Schema } from "astro-seo-schema";
import type { LocalBusiness, BreadcrumbList, ItemList } from "schema-dts";

// ... (unchanged fonts config)

export interface Props {
  title?: string;
  meta_title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  canonical?: string;
  schema?: any[];
}

const { title, meta_title, description, image, noindex, canonical } = Astro.props;

// Compile Breadcrumbs
const pathArr = Astro.url.pathname.split("/").filter(Boolean);
const breadcrumbItems = [
  {
    "@type": "ListItem",
    position: 1,
    name: "Home",
    item: config.site.base_url,
  },
  ...pathArr.map((path, index) => ({
    "@type": "ListItem",
    position: index + 2,
    name: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " "),
    item: `${config.site.base_url}/${pathArr.slice(0, index + 1).join("/")}`,
  })),
];

const graphItems: any[] = [
  {
    "@type": "LocalBusiness",
    "@id": `${config.site.base_url}/#organization`,
    name: config.site.title,
    url: config.site.base_url,
    logo: `${config.site.base_url}${config.site.logo}`,
    image: `${config.site.base_url}/images/og-image.png`,
    description: config.metadata.meta_description,
    address: {
      "@type": "PostalAddress",
      streetAddress: "7375 Executive Pl. Suite 400",
      addressLocality: "Lanham",
      addressRegion: "MD",
      postalCode: "20706",
      addressCountry: "US",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 38.9800,
      longitude: -76.8500,
    },
    telephone: "+1-240-441-5259",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-240-441-5259",
      contactType: "customer service",
      areaServed: "Maryland",
    },
  } as LocalBusiness,
  {
    "@type": "BreadcrumbList",
    "@id": `${config.site.base_url}${Astro.url.pathname}#breadcrumb`,
    itemListElement: breadcrumbItems,
  } as BreadcrumbList,
  {
    "@type": "ItemList",
    "@id": `${config.site.base_url}/#navigation`,
    name: "Main Menu",
    itemListElement: menu.main.map((item, index) => ({
      "@type": "SiteNavigationElement",
      position: index + 1,
      name: item.name,
      url: `${config.site.base_url}${item.url !== "/" ? item.url : ""}`,
    })),
  } as ItemList,
  ...(Astro.props.schema || []),
];
---

<!doctype html>
<html lang="en">
  <head>
    <!-- google tag manager -->
    {
      config.google_tag_manager.enable && (
        <GoogleTagmanager id={config.google_tag_manager.gtm_id} />
      )
    }

    <SEO
      title={plainify(meta_title ? meta_title : title ? title : config.site.title)}
      description={plainify(description ? description : config.metadata.meta_description)}
      canonical={canonical || `${config.site.base_url}/${Astro.url.pathname.replace("/", "")}`}
      noindex={noindex}
      openGraph={{
        basic: {
          title: plainify(meta_title ? meta_title : title ? title : config.site.title),
          type: "website",
          image: `${config.site.base_url}${image ? image : config.metadata.meta_image}`
        }
      }}
      twitter={{
        card: "summary_large_image",
        title: plainify(meta_title ? meta_title : title ? title : config.site.title),
        description: plainify(description ? description : config.metadata.meta_description),
        image: `${config.site.base_url}${image ? image : config.metadata.meta_image}`
      }}
      extend={{
        meta: [
          { name: "theme-name", content: "Maryland-Insights" },
          { name: "msapplication-TileColor", content: "#000000" },
          { name: "theme-color", content: "#fff", media: "(prefers-color-scheme: light)" },
          { name: "theme-color", content: "#000", media: "(prefers-color-scheme: dark)" },
          { name: "author", content: config.metadata.meta_author }
        ],
        link: [
          { rel: "shortcut icon", href: config.site.favicon },
          { rel: "security", href: "/.well-known/security.txt" },
          { rel: "search", type: "application/opensearchdescription+xml", title: "Maryland Insights", href: "/opensearch.xml" }
        ]
      }}
    />

    <!-- DM Sans font for logo -->
    <link
      href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap"
      rel="stylesheet"
    />

    <meta name="generator" content={Astro.generator} />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />

    <!-- ... (unchanged google font css / AstroFont component) ... -->

    <!-- responsive meta -->
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1, maximum-scale=5"
    />

    <ClientRouter />

    <Schema
      item={{
        "@context": "https://schema.org",
        "@graph": graphItems,
      } as any}
    />
  </head>
```


### `src/pages/[regular].astro`
**Action:** Modify  
**Why:** Regular dynamic pages currently lack typing context.

#### Before
```astro
---
import Base from "@/layouts/Base.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import CallToAction from "@/partials/CallToAction.astro";
import PageHeader from "@/partials/PageHeader.astro";
import { render } from "astro:content";

// get static paths for all pages
export async function getStaticPaths() {
  const COLLECTION_FOLDER = "pages";
// ... (unchanged getStaticPaths body)
}

const { page } = Astro.props;
const { title, description } = page.data;
const { Content } = await render(page);
---

<Base {...page.data}>
```
#### After
```astro
---
import config from "@/config/config.json";
import Base from "@/layouts/Base.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import { plainify } from "@/lib/utils/textConverter";
import CallToAction from "@/partials/CallToAction.astro";
import PageHeader from "@/partials/PageHeader.astro";
import type { Article } from "schema-dts";
import { render } from "astro:content";

// get static paths for all pages
export async function getStaticPaths() {
  const COLLECTION_FOLDER = "pages";
// ... (unchanged getStaticPaths body)
}

const { page } = Astro.props;
const { title, description } = page.data;
const { Content } = await render(page);

const pageSchema: Article = {
  "@type": "Article",
  "headline": plainify(title),
  "description": plainify(description),
  "publisher": {
    "@id": `${config.site.base_url}/#organization`,
  }
};
---

<Base {...page.data} schema={[pageSchema]}>
```


### `src/pages/about.astro`
**Action:** Modify  
**Why:** Converts manual maps to typed TS.

#### Before
```astro
---
import config from "@/config/config.json";
// ... (unchanged imports)
import TrustedBrands from "@/partials/TrustedBrands.astro";

const pageIndex = await getListPage("about", "-index");
const { title, description, gallery, facts_section, teams_section } =
  pageIndex.data;

const aboutSchema = {
  "@type": "AboutPage",
  "mainEntity": {
    "@type": "Organization",
    "@id": `${config.site.base_url}/#organization`,
  },
};

const teamSchema = (teams_section?.members || []).map((member: any) => ({
  "@type": "Person",
  "name": member.name,
  "jobTitle": member.position,
  "image": member.image ? `${config.site.base_url}${member.image}` : undefined,
  "affiliation": {
    "@id": `${config.site.base_url}/#organization`,
  },
}));

if (pageIndex.data.draft) return Astro.redirect("/404");
---
```
#### After
```astro
---
import config from "@/config/config.json";
// ... (unchanged imports)
import TrustedBrands from "@/partials/TrustedBrands.astro";
import type { AboutPage, Person } from "schema-dts";
import { plainify } from "@/lib/utils/textConverter";

const pageIndex = await getListPage("about", "-index");
const { title, description, gallery, facts_section, teams_section } =
  pageIndex.data;

const aboutSchema: AboutPage = {
  "@type": "AboutPage",
  "mainEntity": {
    "@id": `${config.site.base_url}/#organization`,
  },
};

const teamSchema: Person[] = (teams_section?.members || []).map((member: any) => ({
  "@type": "Person",
  "name": plainify(member.name),
  "jobTitle": plainify(member.position),
  "image": member.image ? `${config.site.base_url}${member.image}` : undefined,
  "affiliation": {
    "@id": `${config.site.base_url}/#organization`,
  },
}));

if (pageIndex.data.draft) return Astro.redirect("/404");
---
```
> *Note: `<Base {...pageIndex.data} schema={[aboutSchema, ...teamSchema]}>` is applied in the Astro template below.*


### `src/pages/contact.astro`
**Action:** Modify  
**Why:** Formalizes `ContactPage`.

#### Before
```astro
---
import config from "@/config/config.json";
// ... (unchanged imports)

const pageIndex = await getListPage("contact", "-index");
const {
  title,
  description,
  section_title,
  contact_form,
  contact_info,
  gallery_section,
} = pageIndex.data;

const toContactHref = (rawValue: string) => {
  // ... (unchanged function)
};

const contactSchema = {
  "@type": "ContactPage",
  "mainEntity": {
    "@id": `${config.site.base_url}/#organization`,
  },
};

if (pageIndex.data.draft) {
  return Astro.redirect("/404");
}
---
```
#### After
```astro
---
import config from "@/config/config.json";
// ... (unchanged imports)
import type { ContactPage } from "schema-dts";

const pageIndex = await getListPage("contact", "-index");
const {
  title,
  description,
  section_title,
  contact_form,
  contact_info,
  gallery_section,
} = pageIndex.data;

const toContactHref = (rawValue: string) => {
  // ... (unchanged function)
};

const contactSchema: ContactPage = {
  "@type": "ContactPage",
  "mainEntity": {
    "@id": `${config.site.base_url}/#organization`,
  },
};

if (pageIndex.data.draft) {
  return Astro.redirect("/404");
}
---
```


### `src/pages/faqs.astro`
**Action:** Modify  
**Why:** Purifies FAQ answer HTML payloads via `plainify`.

#### Before
```astro
---
import ImageMod from "@/components/ImageMod.astro";
// ... (unchanged imports)
import Testimonial from "@/partials/Testimonial.astro";

const pageIndex = await getListPage("faqs", "-index");
if (pageIndex.data.draft) return Astro.redirect("/404");

const { title, description, section_title, faqs_list, cta } = pageIndex.data;

const faqSchema = {
  "@type": "FAQPage",
  "mainEntity": faqs_list.map((faq: any) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer,
    },
  })),
};
---
```
#### After
```astro
---
import ImageMod from "@/components/ImageMod.astro";
// ... (unchanged imports)
import Testimonial from "@/partials/Testimonial.astro";
import { plainify } from "@/lib/utils/textConverter";
import type { FAQPage } from "schema-dts";

const pageIndex = await getListPage("faqs", "-index");
if (pageIndex.data.draft) return Astro.redirect("/404");

const { title, description, section_title, faqs_list, cta } = pageIndex.data;

const faqSchema: FAQPage = {
  "@type": "FAQPage",
  "mainEntity": faqs_list.map((faq: any) => ({
    "@type": "Question",
    "name": plainify(faq.question),
    "acceptedAnswer": {
      "@type": "Answer",
      "text": plainify(faq.answer),
    },
  })),
};
---
```


### `src/pages/index.astro`
**Action:** Modify  
**Why:** Adds typed global search actions to Homepage.

#### Before
```astro
---
import Base from "@/layouts/Base.astro";
// ... (unchanged imports)

const pageIndex = await getListPage("homepage", "-index");
---

<Base>
```
#### After
```astro
---
import config from "@/config/config.json";
import Base from "@/layouts/Base.astro";
// ... (unchanged imports)
import type { WebSite } from "schema-dts";

const pageIndex = await getListPage("homepage", "-index");

const homeSchema: WebSite = {
  "@type": "WebSite",
  "name": config.site.title,
  "url": config.site.base_url,
  "description": config.metadata.meta_description,
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${config.site.base_url}/search?q={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
};
---

<Base schema={[homeSchema]}>
```


### `src/pages/integrations.astro`
**Action:** Modify  
**Why:** Needs semantic CollectionPage tags for directory layouts.

#### Before
```astro
---
import ImageMod from "@/components/ImageMod.astro";
// ... (unchanged imports)
import PageHeader from "@/partials/PageHeader.astro";

const pageIndex = await getListPage("integrations", "-index");
if (pageIndex.data.draft) return Astro.redirect("/404");

const { section_title, integrations_list } = pageIndex.data;
---

<Base {...pageIndex.data}>
```

#### After
```astro
---
import config from "@/config/config.json";
import ImageMod from "@/components/ImageMod.astro";
// ... (unchanged imports)
import PageHeader from "@/partials/PageHeader.astro";
import type { CollectionPage } from "schema-dts";

const pageIndex = await getListPage("integrations", "-index");
if (pageIndex.data.draft) return Astro.redirect("/404");

const { section_title, integrations_list } = pageIndex.data;

const integrationSchema: CollectionPage = {
  "@type": "CollectionPage",
  "name": "Maryland Insights Integrations",
  "url": `${config.site.base_url}/integrations`,
  "publisher": {
    "@id": `${config.site.base_url}/#organization`
  }
};
---

<Base {...pageIndex.data} schema={[integrationSchema]}>
```


### `src/pages/pricing.astro`
**Action:** Modify  
**Why:** Embeds price points into Google's shopping logic safely.

#### Before
```astro
---
import PricingTable from "@/components/PricingTable.astro";
// ... (unchanged imports)

const pageIndex = await getListPage("pricing", "-index");
if (pageIndex.data.draft) return Astro.redirect("/404");

const { title, description, comparison_section } = pageIndex.data;
---

<Base {...pageIndex.data}>
```
#### After
```astro
---
import PricingTable from "@/components/PricingTable.astro";
// ... (unchanged imports)
import { plainify } from "@/lib/utils/textConverter";
import type { Product } from "schema-dts";

const pageIndex = await getListPage("pricing", "-index");
if (pageIndex.data.draft) return Astro.redirect("/404");

const { title, description, comparison_section } = pageIndex.data;

const pricingSchema: Product = {
  "@type": "Product",
  "name": "Maryland Insights Website Builder Plans",
  "description": plainify(description),
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "99.99",
    "offerCount": 3,
    "offers": [
      { "@type": "Offer", "name": "Starter", "price": 0, "priceCurrency": "USD" },
      { "@type": "Offer", "name": "Business", "price": 39.99, "priceCurrency": "USD" },
      { "@type": "Offer", "name": "Business Pro", "price": 99.99, "priceCurrency": "USD" }
    ]
  }
};
---

<Base {...pageIndex.data} schema={[pricingSchema]}>
```

### `src/pages/search.astro`
**Action:** Modify
**Why:** Identifies route properly explicitly as `SearchResultsPage`.

#### Before
```astro
---
import Base from "@/layouts/Base.astro";
import PageHeader from "@/partials/PageHeader.astro";

const title = "Search Results";
const description = "Search results for your Maryland business needs.";
---

<Base title={title} description={description}>
```
#### After
```astro
---
import config from "@/config/config.json";
import Base from "@/layouts/Base.astro";
import PageHeader from "@/partials/PageHeader.astro";
import type { SearchResultsPage } from "schema-dts";

const title = "Search Results";
const description = "Search results for your Maryland business needs.";

const searchSchema: SearchResultsPage = {
  "@type": "SearchResultsPage",
  "name": title,
  "description": description,
  "publisher": {
    "@id": `${config.site.base_url}/#organization`
  }
};
---

<Base title={title} description={description} schema={[searchSchema]}>
```


### `src/pages/blog/index.astro`
**Action:** Modify  
**Why:** Maps child BlogPosting properties natively to index stream.

#### Before
```astro
---
import config from "@/config/config.json";
// ... (unchanged imports)
const sortedPosts = sortByDate(publishedPosts);

const blogIndexSchema = {
  "@type": "Blog",
  "name": title,
  "description": description,
  "url": `${config.site.base_url}/blog`,
  "blogPost": sortedPosts.slice(0, 10).map((post) => ({
    "@type": "BlogPosting",
    "headline": post.data.title,
    "url": `${config.site.base_url}/blog/${post.id}`,
    "datePublished": post.data.date,
    "author": {
      "@type": "Person",
      "name": post.data.author.name,
    },
  })),
};
---
```
#### After
```astro
---
import config from "@/config/config.json";
// ... (unchanged imports)
import { plainify } from "@/lib/utils/textConverter";
import type { Blog } from "schema-dts";

// ... (unchanged list assignments)

const sortedPosts = sortByDate(publishedPosts);

const blogIndexSchema: Blog = {
  "@type": "Blog",
  "name": plainify(title),
  "description": plainify(description),
  "url": `${config.site.base_url}/blog`,
  "blogPost": sortedPosts.slice(0, 10).map((post) => ({
    "@type": "BlogPosting",
    "headline": plainify(post.data.title),
    "url": `${config.site.base_url}/blog/${post.id}`,
    "datePublished": post.data.date,
    "author": {
      "@type": "Person",
      "name": plainify(post.data.author.name),
    },
  })),
};
---
```

### `src/pages/blog/[single].astro`
**Action:** Modify  
**Why:** Enforces `BlogPosting` types safely.

#### Before
```astro
---
import CardPrimary from "@/components/CardPrimary.astro";
// ... (unchanged imports)
import { render } from "astro:content";

export async function getStaticPaths() {
// ... (unchanged routes logic)
}

// ... (unchanged slice assignment)
const similarPosts = similarItems(post, posts).slice(0, 3);

const blogSchema = {
  "@type": "BlogPosting",
  "@id": `${config.site.base_url}/blog/${post.id}#blogposting`,
  mainEntityOfPage: {
    "@type": "WebPage",
    "@id": `${config.site.base_url}/blog/${post.id}`,
  },
  headline: title,
  description: post.data.description,
  image: post.data.image
    ? `${config.site.base_url}${post.data.image}`
    : `${config.site.base_url}${config.metadata.meta_image}`,
  datePublished: post.data.date,
  dateModified: post.data.date,
  author: {
    "@type": "Person",
    name: post.data.author?.name || "Admin",
    url: `${config.site.base_url}/about`,
  },
  publisher: {
    "@id": `${config.site.base_url}/#organization`,
  },
};
---
```
#### After
```astro
---
import CardPrimary from "@/components/CardPrimary.astro";
// ... (unchanged imports)
import { plainify } from "@/lib/utils/textConverter";
import type { BlogPosting } from "schema-dts";
import { render } from "astro:content";

export async function getStaticPaths() {
// ... (unchanged routes logic)
}

// ... (unchanged slice assignment)
const similarPosts = similarItems(post, posts).slice(0, 3);

const blogSchema: BlogPosting = {
  "@type": "BlogPosting",
  "@id": `${config.site.base_url}/blog/${post.id}#blogposting`,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `${config.site.base_url}/blog/${post.id}`,
  },
  "headline": plainify(title),
  "description": plainify(post.data.description),
  "image": post.data.image
    ? `${config.site.base_url}${post.data.image}`
    : `${config.site.base_url}${config.metadata.meta_image}`,
  "datePublished": post.data.date,
  "dateModified": post.data.date,
  "author": {
    "@type": "Person",
    "name": plainify(post.data.author?.name || "Admin"),
    "url": `${config.site.base_url}/about`,
  },
  "publisher": {
    "@id": `${config.site.base_url}/#organization`,
  },
};
---
```

### `src/pages/features/[single].astro`
**Action:** Modify  
**Why:** Identifies the item natively as `SoftwareApplication`.

#### Before
```astro
---
import config from "@/config/config.json";
// ... (unchanged imports)
import { render } from "astro:content";

export async function getStaticPaths() {
// ... (unchanged routes logic)
}

const { Content } = await render(feature);

const featureSchema = {
  "@type": "SoftwareApplication",
  "name": title,
  "description": description,
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
  },
  "image": image ? `${config.site.base_url}${image}` : undefined,
  "publisher": {
    "@id": `${config.site.base_url}/#organization`,
  },
};
---
```
#### After
```astro
---
import config from "@/config/config.json";
// ... (unchanged imports)
import { plainify } from "@/lib/utils/textConverter";
import type { SoftwareApplication } from "schema-dts";
import { render } from "astro:content";

export async function getStaticPaths() {
// ... (unchanged routes logic)
}

const { Content } = await render(feature);

const featureSchema: SoftwareApplication = {
  "@type": "SoftwareApplication",
  "name": plainify(title),
  "description": plainify(description),
  "applicationCategory": "BusinessApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": 0,
    "priceCurrency": "USD",
  },
  "image": image ? `${config.site.base_url}${image}` : undefined,
  "publisher": {
    "@id": `${config.site.base_url}/#organization`,
  },
};
---
```

### `src/pages/features/index.astro`
**Action:** Modify  
**Why:** Identifies the feature summary directory as a formal `CollectionPage`.

#### Before
```astro
---
import CardPrimary from "@/components/CardPrimary.astro";
// ... (unchanged imports)
import PageHeader from "@/partials/PageHeader.astro";

const pageIndex = await getListPage("features", "-index");
if (pageIndex.data.draft) return Astro.redirect("/404");
const { title, description, section_title, use_cases } = pageIndex.data;

const features = await getSinglePage("features");
---

<Base {...pageIndex.data}>
```
#### After
```astro
---
import CardPrimary from "@/components/CardPrimary.astro";
// ... (unchanged imports)
import PageHeader from "@/partials/PageHeader.astro";
import type { CollectionPage } from "schema-dts";
import config from "@/config/config.json";

const pageIndex = await getListPage("features", "-index");
if (pageIndex.data.draft) return Astro.redirect("/404");
const { title, description, section_title, use_cases } = pageIndex.data;

const features = await getSinglePage("features");

const collectionSchema: CollectionPage = {
  "@type": "CollectionPage",
  "name": title,
  "description": description,
  "url": `${config.site.base_url}/features`,
  "publisher": {
    "@id": `${config.site.base_url}/#organization`
  }
};
---

<Base {...pageIndex.data} schema={[collectionSchema]}>
```

### `src/pages/404.astro`
**Action:** Modify  
**Why:** Prevents search indexes from scanning and attempting to map invalid structured data by flagging explicit noindex values into the SEO wrapper.

#### Before
```astro
---
import Base from "@/layouts/Base.astro";
---

<Base title="Page Not Found">
```
#### After
```astro
---
import Base from "@/layouts/Base.astro";
---

<Base title="Page Not Found" noindex={true}>
```

## Validation Plan
1. `yarn install` newly typed packages.
2. `yarn check` correctly guarantees interfaces block missing JSON fields globally.

## Approval
`Status: Awaiting explicit user approval. Do not implement yet.`
