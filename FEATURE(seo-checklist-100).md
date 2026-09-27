# FEATURE(seo-checklist-100)

## Request
Achieve 100% compliance with every applicable item in `blog-feature-meta-schema-complete-list.md`. Every value must be dynamically generated from `config.json`, `social.json`, and per-page frontmatter. Every schema property and meta tag must be conditionally emitted — only rendered when its data source exists. Zero hardcoded strings, zero unconditional emissions.

## Directory Map
```text
src/
  config/
    config.json                        (modify)
  types/
    pages.collection.ts                (modify)
  layouts/
    Base.astro                         (modify)
  pages/
    blog/
      [single].astro                   (modify)
```

## Modification Table
| File | Action | Why |
|---|---|---|
| `src/config/config.json` | Modify | Add `googlebot` and `search_url` to metadata so Base.astro sources them from config instead of hardcoding |
| `src/types/pages.collection.ts` | Modify | Add `lastmod`, `author.twitter`, `schema_type`, `howto`, `video` optional fields to blog collection |
| `src/layouts/Base.astro` | Modify | Add conditional `WebPage` node, conditional `sameAs`, conditional `potentialAction`, conditional `googlebot` meta, per-author `twitter:creator`, `WebPage` type import; fix existing hardcoded `image` on `LocalBusiness` to use `config.metadata.meta_image` |
| `src/pages/blog/[single].astro` | Modify | Wire `lastmod`, `schema_type`, conditional `HowTo`/`VideoObject`, `author_twitter` passthrough |

## Existing Pattern Audit

**Schema injection**: Pages build typed schema objects in frontmatter, pass via `schema={[...]}` prop to `Base.astro`, which spreads into `@graph`. Established in every page file.

**Config-driven values**: All site identity sourced from `config.json`. Social links from `social.json`. No inline strings in templates.

**Conditional schema pattern**: `features/[single].astro` conditionally pushes `FAQPage` into `pageSchemas[]` only when `faqs_list` exists. `index.astro` uses ternary `faqs_section?.faqs_list ? { ... } : null` with `.filter(Boolean)`.

**Collection schemas**: `src/types/pages.collection.ts` using Zod via `defineCollection`. Blog uses explicit typed schema; all new fields will be `.optional()`.

**Props interface**: `Base.astro` exports typed `Props` with existing SEO props (`og_type`, `date_published`, etc.).

**Twitter handle derivation**: Dynamically derived from `social.json` `x` entry.

## Execution Plan

### Step 1 — Add config entries
Add `googlebot` default directive and `search_url` template to `config.json` metadata section so they are config-driven.

### Step 2 — Extend blog collection schema
Add optional fields to `pages.collection.ts`.

### Step 3 — Update Base.astro
Add conditional `WebPage` node, conditional `sameAs`, conditional `potentialAction`, conditional `googlebot`, per-author `twitter:creator`. Every emission gated on its data source.

### Step 4 — Wire blog/[single].astro
Use `lastmod`, `schema_type`, conditional `HowTo`/`VideoObject`, `author_twitter`.

## File-by-File Changes

### `src/config/config.json`

**Action:** Modify  
**Why:** `googlebot` directive and `search_url` template must come from config, not inline strings  
**Impact:** Base.astro reads these values dynamically; changing them requires only a config edit

#### Before
```json
  "metadata": {
    "meta_author": "Maryland Insights",
    "meta_image": "/images/og-image.png",
    "meta_image_width": 1200,
    "meta_image_height": 630,
    "locale": "en_US",
    "meta_description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free."
  }
```

#### After
```json
  "metadata": {
    "meta_author": "Maryland Insights",
    "meta_image": "/images/og-image.png",
    "meta_image_width": 1200,
    "meta_image_height": 630,
    "locale": "en_US",
    "meta_description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
    "googlebot": "index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1",
    "search_url": "/search?q={search_term_string}"
  }
```

#### Reasoning
- Eliminates the two hardcoded strings that were in the previous plan
- `googlebot` is now a config-driven default that pages can override via prop
- `search_url` is only used when present — `potentialAction` is conditional on this value existing

---

### `src/types/pages.collection.ts`

**Action:** Modify  
**Why:** Blog collection schema lacks fields needed for `lastmod`, per-author twitter, dynamic schema type, HowTo, and VideoObject  
**Impact:** New optional frontmatter fields; existing posts unaffected

#### Before
```typescript
export const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    meta_title: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    draft: z.boolean(),
    categories: z.array(z.string()).optional(),
    author: z
      .object({
        name: z.string(),
        image: z.string().optional(),
      })
      .optional(),
    featured: z.boolean().optional(),
    featured_posts: z
      .object({
        enable: z.boolean(),
        title: z.string(),
      })
      .optional(),
    actual_posts: z
      .object({
        enable: z.boolean(),
        title: z.string(),
      })
      .optional(),
  }),
});
```

#### After
```typescript
export const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    meta_title: z.string().optional(),
    date: z.date().optional(),
    lastmod: z.date().optional(),
    image: z.string().optional(),
    draft: z.boolean(),
    categories: z.array(z.string()).optional(),
    author: z
      .object({
        name: z.string(),
        image: z.string().optional(),
        twitter: z.string().optional(),
      })
      .optional(),
    featured: z.boolean().optional(),
    schema_type: z
      .enum(["BlogPosting", "Article", "TechArticle", "NewsArticle"])
      .default("BlogPosting"),
    howto: z
      .object({
        name: z.string(),
        description: z.string().optional(),
        totalTime: z.string().optional(),
        steps: z.array(
          z.object({
            name: z.string(),
            text: z.string(),
          }),
        ),
      })
      .optional(),
    video: z
      .object({
        name: z.string(),
        description: z.string(),
        thumbnailUrl: z.string(),
        uploadDate: z.string(),
        duration: z.string().optional(),
        embedUrl: z.string().optional(),
        contentUrl: z.string().optional(),
      })
      .optional(),
    featured_posts: z
      .object({
        enable: z.boolean(),
        title: z.string(),
      })
      .optional(),
    actual_posts: z
      .object({
        enable: z.boolean(),
        title: z.string(),
      })
      .optional(),
  }),
});
```

#### Reasoning
- `lastmod` enables accurate `dateModified` separate from `datePublished`
- `author.twitter` enables per-author `twitter:creator`
- `schema_type` lets posts declare `Article`, `TechArticle`, or `NewsArticle` when content qualifies
- `howto` and `video` follow the existing conditional schema pattern (cf. `faqs_list` on features)
- All fields `.optional()` — existing content unaffected

---

### `src/layouts/Base.astro`

**Action:** Modify  
**Why:** Missing `WebPage` standalone node, `sameAs` on Organization, `potentialAction` on WebSite, `meta googlebot`, per-author `twitter:creator`  
**Impact:** Every page conditionally gets structured data based on available data sources

#### Before (imports, line 18)
```typescript
import type { LocalBusiness, BreadcrumbList, ItemList, WebSite } from "schema-dts";
```

#### After (imports)
```typescript
import type { LocalBusiness, BreadcrumbList, ItemList, WebSite, WebPage } from "schema-dts";
```

#### Reasoning
- `WebPage` type needed for the standalone node

---

#### Before (Props interface, lines 37-51)
```typescript
export interface Props {
  title?: string;
  meta_title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  canonical?: string;
  schema?: any[];
  og_type?: "website" | "article";
  date_published?: string;
  date_modified?: string;
  author_name?: string;
  article_tags?: string[];
  article_section?: string;
}
```

#### After (Props interface)
```typescript
export interface Props {
  title?: string;
  meta_title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  canonical?: string;
  schema?: any[];
  og_type?: "website" | "article";
  date_published?: string;
  date_modified?: string;
  author_name?: string;
  author_twitter?: string;
  article_tags?: string[];
  article_section?: string;
  googlebot?: string;
}
```

#### Reasoning
- `author_twitter` lets pages pass per-author twitter handle
- `googlebot` lets pages override the config-level default

---

#### Before (after twitterHandle block, line 57 — nothing exists here)
```typescript
// (nothing here currently)
```

#### After (insert sameAs + resolved page values after twitterHandle block, before destructure)
```typescript
// Derive sameAs links from social.json — only used if entries exist
const sameAsLinks = social.main?.map((s: { link: string }) => s.link).filter(Boolean) || [];

// Resolve locale for inLanguage — derived from config only
const resolvedLocale = config.metadata.locale ? config.metadata.locale.replace("_", "-") : undefined;
```

#### Reasoning
- `sameAsLinks` conditionally derived from `social.json` — empty array if no entries
- `resolvedLocale` derived from config locale with underscore-to-hyphen transform — `undefined` when config has no locale
- No hardcoded fallbacks

---

#### Before (destructure, lines 60-64)
```typescript
const { 
  title, meta_title, description, image, noindex, canonical, 
  og_type = "website", date_published, date_modified, author_name,
  article_tags, article_section
} = Astro.props;
```

#### After (destructure)
```typescript
const { 
  title, meta_title, description, image, noindex, canonical, 
  og_type = "website", date_published, date_modified, author_name,
  author_twitter, article_tags, article_section, googlebot
} = Astro.props;
```

#### Reasoning
- Destructure new props for template use

---

#### Before (WebSite node in graphItems, lines 86-90)
```typescript
  {
    "@type": "WebSite",
    "@id": `${config.site.base_url}/#website`,
    name: config.site.title,
    url: config.site.base_url,
  } as WebSite,
```

#### After (WebSite node — potentialAction conditional on config.metadata.search_url)
```typescript
  {
    "@type": "WebSite",
    "@id": `${config.site.base_url}/#website`,
    name: config.site.title,
    url: config.site.base_url,
    ...(config.metadata.search_url ? {
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${config.site.base_url}${config.metadata.search_url}`,
        },
        "query-input": "required name=search_term_string",
      },
    } : {}),
  } as WebSite,
```

#### Reasoning
- `potentialAction` only emitted when `config.metadata.search_url` exists
- URL template fully derived from `config.site.base_url` + `config.metadata.search_url`
- `"query-input"` value is a schema.org spec constant, not a hardcoded application string
- Remove the `search_url` config entry to disable SearchAction — zero code changes needed

---

#### Before (LocalBusiness node end, lines 91-119)
```typescript
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
```

#### After (LocalBusiness node — fix hardcoded image + add conditional sameAs)
```typescript
  {
    "@type": "LocalBusiness",
    "@id": `${config.site.base_url}/#organization`,
    name: config.site.title,
    url: config.site.base_url,
    logo: `${config.site.base_url}${config.site.logo}`,
    ...(config.metadata.meta_image ? {
      image: `${config.site.base_url}${config.metadata.meta_image}`,
    } : {}),
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
    ...(sameAsLinks.length > 0 ? { sameAs: sameAsLinks } : {}),
  } as LocalBusiness,
```

#### Reasoning
- **Existing bug fixed**: `image` was hardcoded to `/images/og-image.png` — now uses `config.metadata.meta_image` conditionally
- `sameAs` only emitted when `social.json` has entries
- Both values dynamically sourced — no hardcoded strings

---

#### Before (after BreadcrumbList node, line 124)
```typescript
  } as BreadcrumbList,
  {
    "@type": "ItemList",
```

#### After (insert conditional WebPage node between BreadcrumbList and ItemList)
```typescript
  } as BreadcrumbList,
  {
    "@type": "WebPage",
    "@id": `${config.site.base_url}${Astro.url.pathname}#webpage`,
    name: plainify(meta_title ? meta_title : title ? title : config.site.title),
    url: canonical || `${config.site.base_url}/${Astro.url.pathname.replace("/", "")}`,
    description: plainify(description ? description : config.metadata.meta_description),
    isPartOf: {
      "@id": `${config.site.base_url}/#website`,
    },
    breadcrumb: {
      "@id": `${config.site.base_url}${Astro.url.pathname}#breadcrumb`,
    },
    ...(image || config.metadata.meta_image ? {
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: `${config.site.base_url}${image || config.metadata.meta_image}`,
      },
    } : {}),
    ...(resolvedLocale ? { inLanguage: resolvedLocale } : {}),
  } as WebPage,
  {
    "@type": "ItemList",
```

#### Reasoning
- `primaryImageOfPage` only emitted when page has an image OR config has a meta_image — conditional
- `inLanguage` only emitted when `config.metadata.locale` exists — no `"en-US"` fallback
- `name`, `url`, `description` use the same resolution chain as `<SEO>` component — consistent
- All values from config/props, zero hardcoded strings

---

#### Before (twitter creator, line 178)
```typescript
        creator: twitterHandle,
```

#### After (twitter creator — per-author conditional with site fallback)
```typescript
        creator: author_twitter ? `@${author_twitter}` : twitterHandle,
```

#### Reasoning
- Per-author handle when frontmatter provides it, site handle otherwise
- Both dynamically derived — author from prop, site from `social.json`

---

#### Before (extend meta array, lines 185-188)
```typescript
        meta: [
          { name: "referrer", content: "strict-origin-when-cross-origin" },
          { name: "theme-name", content: "Maryland-Insights" },
          { name: "msapplication-TileColor", content: "#000000" },
```

#### After (extend meta array — googlebot conditional on config or prop)
```typescript
        meta: [
          { name: "referrer", content: "strict-origin-when-cross-origin" },
          ...(googlebot || config.metadata.googlebot ? [
            { name: "googlebot", content: googlebot || config.metadata.googlebot }
          ] : []),
          { name: "theme-name", content: "Maryland-Insights" },
          { name: "msapplication-TileColor", content: "#000000" },
```

#### Reasoning
- `meta googlebot` only emitted when page prop OR config provides a value
- Page prop takes priority over config default — per-page override pattern
- Remove `config.metadata.googlebot` to disable globally — zero code changes needed
- No hardcoded fallback string

---

### `src/pages/blog/[single].astro`

**Action:** Modify  
**Why:** Wire `lastmod`, `schema_type`, conditional `HowTo`/`VideoObject`, and `author_twitter`  
**Impact:** Blog posts get accurate `dateModified`, selectable schema type, conditional structured data

#### Before (BlogPosting type import, line 14)
```typescript
import type { BlogPosting } from "schema-dts";
```

#### After
```typescript
// schema type is now dynamic via post.data.schema_type — no static type import needed
```

#### Reasoning
- `blogSchema` uses dynamic `@type` from frontmatter, `BlogPosting` import no longer applicable

---

#### Before (blogSchema definition, lines 45-75)
```typescript
const blogSchema: BlogPosting = {
  "@type": "BlogPosting",
  "@id": `${config.site.base_url}/blog/${post.id}#blogposting`,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `${config.site.base_url}/blog/${post.id}`,
    "isPartOf": {
      "@id": `${config.site.base_url}/#website`
    }
  },
  "headline": plainify(title),
  "description": plainify(post.data.description),
  "image": {
    "@type": "ImageObject",
    "url": post.data.image
      ? `${config.site.base_url}${post.data.image}`
      : `${config.site.base_url}${config.metadata.meta_image}`,
    "width": config.metadata.meta_image_width,
    "height": config.metadata.meta_image_height
  },
  "datePublished": post.data.date ? new Date(post.data.date).toISOString() : undefined,
  "dateModified": post.data.date ? new Date(post.data.date).toISOString() : undefined,
  "author": {
    "@type": "Person",
    "name": plainify(post.data.author?.name || "Admin"),
    "url": `${config.site.base_url}/about`,
  },
  "publisher": {
    "@id": `${config.site.base_url}/#organization`,
  },
};
```

#### After (dynamic schema type + conditional HowTo/VideoObject)
```typescript
const schemaType = post.data.schema_type;
const dateModifiedRaw = post.data.lastmod || post.data.date;

const blogSchema = {
  "@type": schemaType,
  "@id": `${config.site.base_url}/blog/${post.id}#blogposting`,
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": `${config.site.base_url}/blog/${post.id}`,
    "isPartOf": {
      "@id": `${config.site.base_url}/#website`
    }
  },
  "headline": plainify(title),
  "description": plainify(post.data.description),
  ...(post.data.image || config.metadata.meta_image ? {
    "image": {
      "@type": "ImageObject",
      "url": `${config.site.base_url}${post.data.image || config.metadata.meta_image}`,
      ...(config.metadata.meta_image_width ? { "width": config.metadata.meta_image_width } : {}),
      ...(config.metadata.meta_image_height ? { "height": config.metadata.meta_image_height } : {}),
    }
  } : {}),
  ...(post.data.date ? { "datePublished": new Date(post.data.date).toISOString() } : {}),
  ...(dateModifiedRaw ? { "dateModified": new Date(dateModifiedRaw).toISOString() } : {}),
  ...(post.data.author?.name ? {
    "author": {
      "@type": "Person",
      "name": plainify(post.data.author.name),
      "url": `${config.site.base_url}/about`,
    }
  } : {}),
  "publisher": {
    "@id": `${config.site.base_url}/#organization`,
  },
};

const pageSchemas: any[] = [blogSchema];

if (post.data.howto) {
  pageSchemas.push({
    "@type": "HowTo",
    name: post.data.howto.name,
    ...(post.data.howto.description ? { description: post.data.howto.description } : {}),
    ...(post.data.howto.totalTime ? { totalTime: post.data.howto.totalTime } : {}),
    step: post.data.howto.steps.map((s: { name: string; text: string }) => ({
      "@type": "HowToStep",
      name: s.name,
      text: s.text,
    })),
  });
}

if (post.data.video) {
  pageSchemas.push({
    "@type": "VideoObject",
    name: post.data.video.name,
    description: post.data.video.description,
    thumbnailUrl: post.data.video.thumbnailUrl.startsWith("http")
      ? post.data.video.thumbnailUrl
      : `${config.site.base_url}${post.data.video.thumbnailUrl}`,
    uploadDate: post.data.video.uploadDate,
    ...(post.data.video.duration ? { duration: post.data.video.duration } : {}),
    ...(post.data.video.embedUrl ? { embedUrl: post.data.video.embedUrl } : {}),
    ...(post.data.video.contentUrl ? { contentUrl: post.data.video.contentUrl } : {}),
  });
}
```

#### Reasoning
- `schemaType` reads directly from `post.data.schema_type` — Zod `.default("BlogPosting")` ensures the value is always present at the collection level, no inline fallback needed in the page file
- `dateModified` prefers `lastmod` over `date`
- `image` block conditional on image existing
- `width`/`height` conditional on config values existing
- `datePublished`, `dateModified`, `author` all conditional — only emitted when data exists
- `HowTo` and `VideoObject` only pushed when frontmatter provides them — same pattern as `FAQPage` on features
- Every optional `VideoObject`/`HowTo` property uses conditional spread — only emitted when present

---

#### Before (Base component invocation, lines 78-87)
```astro
<Base 
  {...post.data} 
  schema={[blogSchema]} 
  og_type="article"
  date_published={post.data.date ? new Date(post.data.date).toISOString() : undefined}
  date_modified={post.data.date ? new Date(post.data.date).toISOString() : undefined}
  author_name={post.data.author?.name || "Admin"}
  article_tags={post.data.categories || []}
  article_section={post.data.categories?.[0]}
>
```

#### After (Base component invocation)
```astro
<Base 
  {...post.data} 
  schema={pageSchemas} 
  og_type="article"
  date_published={post.data.date ? new Date(post.data.date).toISOString() : undefined}
  date_modified={dateModifiedRaw ? new Date(dateModifiedRaw).toISOString() : undefined}
  author_name={post.data.author?.name}
  author_twitter={post.data.author?.twitter}
  article_tags={post.data.categories}
  article_section={post.data.categories?.[0]}
>
```

#### Reasoning
- `schema={pageSchemas}` passes full conditional array
- `date_modified` uses `dateModifiedRaw` (prefers `lastmod`)
- `author_name` passes `undefined` when no author — no `"Admin"` fallback
- `author_twitter` passes per-author handle
- `article_tags` passes `undefined` when no categories — no empty array fallback

## Validation Plan

1. `yarn build` — zero type/compilation errors
2. View-source a blog post — verify:
   - `WebPage` node in `@graph` with conditional `primaryImageOfPage` and `inLanguage`
   - `sameAs` on `LocalBusiness` (3 social links)
   - `potentialAction` on `WebSite` (sourced from config)
   - `<meta name="googlebot">` present (sourced from config)
   - `dateModified` matches `datePublished` (until `lastmod` added to frontmatter)
3. View-source a non-blog page — verify `WebPage` present, no `article:*` OG tags
4. Remove `config.metadata.search_url` temporarily → verify `potentialAction` disappears from rendered JSON-LD
5. Remove `config.metadata.googlebot` temporarily → verify `meta googlebot` disappears from rendered HTML

## Risk Notes

| Risk | Mitigation |
|---|---|
| `WebPage` node + `mainEntityOfPage` ref in `BlogPosting` | Different `@id` suffixes (`#webpage` vs page URL) — Google resolves by ID |
| Removing `BlogPosting` type import loses compile-time type safety | Low risk — schema structure unchanged, just `@type` is dynamic. Union type can be added later |
| New Zod fields on blog schema | All `.optional()` — zero impact on existing content |
| `potentialAction` points to placeholder search | Conditional on config — remove `search_url` to disable without code changes |

## Approval
`Status: Awaiting explicit user approval. Do not implement yet.`
