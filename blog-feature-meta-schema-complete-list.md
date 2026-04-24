# Complete Meta Tags and JSON-LD Schema List for Blog and Feature Pages

This document lists the full practical set of HTML metadata, social tags, and JSON-LD schema types commonly relevant to blog pages and feature pages, including core items and conditional items used when the page contains qualifying content.[cite:12][cite:22][cite:54]

## Core HTML Head Tags

### Required or Near-Required
- `<title>` — unique page title shown in browser tabs and search results.[cite:12][cite:60]
- `<meta charset="UTF-8">` — character encoding.[cite:14][cite:60]
- `<meta name="viewport" content="width=device-width, initial-scale=1">` — responsive rendering on mobile devices.[cite:14][cite:60]
- `<meta name="description" content="...">` — search snippet summary; should be unique per page.[cite:12][cite:5]
- `<meta name="robots" content="index,follow">` or another crawl directive as needed.[cite:3][cite:5]
- `<link rel="canonical" href="https://example.com/page/">` — canonical URL signal.[cite:12][cite:14]

### Sometimes Used
- `<meta name="googlebot" content="...">` — Google-specific crawl/index directives when needed.[cite:3]
- `<meta name="referrer" content="strict-origin-when-cross-origin">` — referrer policy control.[cite:8]
- `<meta name="theme-color" content="#xxxxxx">` — browser UI color on supported devices.[cite:8]
- `<meta name="author" content="Author Name">` — author metadata; not a major SEO signal but still used by some systems.[cite:60]
- `<link rel="alternate" hreflang="..." href="...">` — multilingual alternates when applicable.[cite:3]

### Usually Avoid / Legacy
- `<meta name="keywords" content="...">` — obsolete for Google ranking purposes.[cite:5][cite:12]

## Open Graph Tags

These tags control social previews on platforms that use Open Graph metadata.[cite:9][cite:32]

### Core Open Graph
- `og:title`[cite:9][cite:32]
- `og:description`[cite:9][cite:32]
- `og:image`[cite:9][cite:32]
- `og:url`[cite:9][cite:32]
- `og:type` — typically `article` for blog posts and editorial content.[cite:30][cite:32]
- `og:site_name`[cite:30][cite:32]

### Strongly Recommended Supporting OG Tags
- `og:locale`[cite:9][cite:30]
- `og:image:alt`[cite:30][cite:34]
- `og:image:width`[cite:9][cite:30]
- `og:image:height`[cite:9][cite:30]

### Article Namespace Tags
Use these when the page is article-like content and the platform supports them.[cite:30][cite:32]
- `article:published_time`[cite:30]
- `article:modified_time`[cite:30]
- `article:author`[cite:30]
- `article:section`[cite:30]
- `article:tag`[cite:30]

## Twitter Card Tags

These tags control how the page appears on X/Twitter and can complement Open Graph tags.[cite:9][cite:32]

### Core Twitter Tags
- `twitter:card` — commonly `summary_large_image`.[cite:32]
- `twitter:title`[cite:32]
- `twitter:description`[cite:32]
- `twitter:image`[cite:32]

### Supporting Twitter Tags
- `twitter:image:alt`[cite:32]
- `twitter:site`[cite:32]
- `twitter:creator`[cite:32]

## JSON-LD Schema Types

JSON-LD is the recommended structured data format for Google Search.[cite:24][cite:54]

### 1. BlogPosting
Use for blog posts and post-like editorial pages.[cite:55][cite:54]

#### Typical Properties
- `@context`
- `@type`
- `headline`
- `description`
- `image`
- `author`
- `datePublished`
- `dateModified`
- `mainEntityOfPage`
- `publisher`
- `keywords` (optional)
- `articleSection` (optional)
- `wordCount` (optional)
[cite:55][cite:54]

#### Example
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "How to Structure SEO Metadata for a Blog Post",
  "description": "A complete guide to blog metadata and structured data.",
  "image": ["https://example.com/cover.jpg"],
  "author": {
    "@type": "Person",
    "name": "Author Name",
    "url": "https://example.com/authors/author-name"
  },
  "datePublished": "2026-04-22",
  "dateModified": "2026-04-22",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/blog/seo-metadata"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Example Media",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```
[cite:55][cite:54][cite:25]

### 2. Article
Use for editorial pages where a broader article type is preferred; `BlogPosting` is a subtype of `Article`.[cite:54][cite:55]

#### Typical Properties
- `@context`
- `@type`
- `headline`
- `description`
- `image`
- `author`
- `datePublished`
- `dateModified`
- `mainEntityOfPage`
- `publisher`
[cite:54][cite:55]

#### Example
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Feature Launch Overview",
  "description": "An overview of a new product feature.",
  "image": ["https://example.com/feature-cover.jpg"],
  "author": {
    "@type": "Person",
    "name": "Product Team"
  },
  "datePublished": "2026-04-22",
  "dateModified": "2026-04-22",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://example.com/features/new-feature"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Example Inc",
    "logo": {
      "@type": "ImageObject",
      "url": "https://example.com/logo.png"
    }
  }
}
```
[cite:54][cite:55]

### 3. WebPage
Useful as page-level structured data describing the page itself.[cite:3][cite:41]

#### Typical Properties
- `@context`
- `@type`
- `name`
- `url`
- `description`
- `breadcrumb`
- `isPartOf`
- `primaryImageOfPage`
[cite:3][cite:41]

#### Example
```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "How to Structure SEO Metadata for a Blog Post",
  "url": "https://example.com/blog/seo-metadata",
  "description": "A complete guide to blog metadata and structured data.",
  "isPartOf": {
    "@type": "WebSite",
    "name": "Example Media",
    "url": "https://example.com"
  }
}
```
[cite:3][cite:41]

### 4. WebSite
Useful for site-level identity, internal search markup, and site association.[cite:3][cite:24]

#### Typical Properties
- `@context`
- `@type`
- `name`
- `url`
- `potentialAction` (for site search, when implemented)
[cite:3][cite:24]

#### Example
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Example Media",
  "url": "https://example.com"
}
```
[cite:3]

### 5. Organization
Commonly used for the publisher or site entity.[cite:3][cite:54]

#### Typical Properties
- `@context`
- `@type`
- `name`
- `url`
- `logo`
- `sameAs` (optional)
[cite:3][cite:54]

#### Example
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Example Media",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png"
}
```
[cite:3]

### 6. Person
Commonly used for the author entity.[cite:54]

#### Typical Properties
- `@context`
- `@type`
- `name`
- `url`
- `image` (optional)
- `sameAs` (optional)
[cite:54]

#### Example
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Author Name",
  "url": "https://example.com/authors/author-name"
}
```
[cite:54]

### 7. BreadcrumbList
Useful when the page has a clear breadcrumb trail.[cite:3]

#### Typical Properties
- `@context`
- `@type`
- `itemListElement`
[cite:3]

#### Example
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Blog",
      "item": "https://example.com/blog"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "SEO",
      "item": "https://example.com/blog/seo"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "How to Structure SEO Metadata for a Blog Post",
      "item": "https://example.com/blog/seo-metadata"
    }
  ]
}
```
[cite:3]

### 8. FAQPage
Use only when the page visibly contains a real FAQ section with question-and-answer pairs.[cite:38][cite:42]

#### Typical Properties
- `@context`
- `@type`
- `mainEntity`
[cite:38]

#### Example
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What meta tags matter most for a blog post?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Title, description, robots, canonical, Open Graph, Twitter, and relevant JSON-LD are the most important categories."
      }
    },
    {
      "@type": "Question",
      "name": "Should a blog post use BlogPosting schema?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, when the page is a blog post or editorial post and the fields accurately describe the content."
      }
    }
  ]
}
```
[cite:38][cite:43]

### 9. HowTo
Use when the page is a step-by-step instructional page and the content genuinely qualifies as a how-to.[cite:77]

#### Typical Properties
- `@context`
- `@type`
- `name`
- `description`
- `step`
- `tool` (optional)
- `supply` (optional)
- `totalTime` (optional)
- `image` (optional)
[cite:77]

#### Example
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Add Structured Data to a Blog Post",
  "description": "A step-by-step guide to implementing JSON-LD.",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Define the page type",
      "text": "Choose BlogPosting, Article, or another schema type based on the page content."
    },
    {
      "@type": "HowToStep",
      "name": "Add required fields",
      "text": "Add headline, description, author, dates, image, and publisher data."
    },
    {
      "@type": "HowToStep",
      "name": "Validate the markup",
      "text": "Run the page through Google's validation and rich results tools."
    }
  ],
  "totalTime": "PT20M"
}
```
[cite:77]

### 10. VideoObject
Use when the page contains a significant video that the markup is describing.[cite:71][cite:68]

#### Typical Properties
- `@context`
- `@type`
- `name`
- `description`
- `thumbnailUrl`
- `uploadDate`
- `duration`
- `embedUrl`
- `contentUrl` (when available)
- `interactionStatistic` (optional)
[cite:71][cite:68][cite:80]

#### Example
```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Structured Data Walkthrough",
  "description": "A walkthrough of blog page schema implementation.",
  "thumbnailUrl": "https://example.com/video-thumb.jpg",
  "uploadDate": "2026-04-22",
  "duration": "PT3M15S",
  "embedUrl": "https://example.com/embed/structured-data-video",
  "contentUrl": "https://cdn.example.com/videos/structured-data.mp4"
}
```
[cite:71][cite:80]

### 11. ImageObject
Use when describing a primary image, logo, or other image entity in structured data.[cite:69]

#### Typical Properties
- `@context`
- `@type`
- `contentUrl`
- `name`
- `description`
- `width`
- `height`
- `creator` (optional)
- `uploadDate` (optional)
[cite:69]

#### Example
```json
{
  "@context": "https://schema.org",
  "@type": "ImageObject",
  "contentUrl": "https://example.com/images/cover.jpg",
  "name": "Blog cover image",
  "description": "Cover image for the SEO metadata guide.",
  "width": 1200,
  "height": 630
}
```
[cite:69]

## Conditional Schema Types Worth Considering

These are not universal, but they are related enough to blog pages or feature pages that they may belong in a complete implementation library when the underlying content qualifies.[cite:53][cite:56][cite:57]

- `NewsArticle` — for actual news content.[cite:53][cite:56]
- `TechArticle` — for technical documentation or technical editorial content.[cite:53][cite:56]
- `Review` — if the page is a real review.[cite:53][cite:56]
- `Product` — if the feature page is actually a product or software product page with product details.[cite:53][cite:65]
- `SoftwareApplication` — for app or platform pages that qualify as software product pages.[cite:53][cite:65]
- `QAPage` — when the content is community Q&A rather than editorial FAQ.[cite:53][cite:56]
- `Speakable` — in limited use cases for news or spoken-answer contexts.[cite:53]
[cite:53][cite:56][cite:65]

## Practical Coverage by Page Type

| Page type | Core tags | Likely schema | Conditional schema |
|---|---|---|---|
| Standard blog post | title, charset, viewport, description, robots, canonical, OG, Twitter [cite:12][cite:14][cite:32] | BlogPosting, WebPage, Organization, Person, BreadcrumbList [cite:54][cite:55][cite:3] | FAQPage, HowTo, VideoObject, ImageObject [cite:38][cite:77][cite:71][cite:69] |
| Editorial feature page | title, charset, viewport, description, robots, canonical, OG, Twitter [cite:12][cite:14][cite:32] | Article or WebPage, Organization, Person, BreadcrumbList [cite:54][cite:3] | FAQPage, VideoObject, ImageObject [cite:38][cite:71][cite:69] |
| Tutorial post | title, charset, viewport, description, robots, canonical, OG, Twitter [cite:12][cite:14][cite:32] | BlogPosting or Article, WebPage, Organization, Person, BreadcrumbList [cite:54][cite:55][cite:3] | HowTo, FAQPage, VideoObject, ImageObject [cite:77][cite:38][cite:71][cite:69] |
| Product feature page | title, charset, viewport, description, robots, canonical, OG, Twitter [cite:12][cite:14][cite:32] | WebPage, Organization, BreadcrumbList [cite:3] | Product, SoftwareApplication, FAQPage, VideoObject, ImageObject [cite:65][cite:53][cite:38][cite:71][cite:69] |

## Flat Exhaustive Checklist

### HTML / Link / Meta
- `title`[cite:12]
- `meta charset`[cite:14]
- `meta viewport`[cite:14]
- `meta description`[cite:12]
- `meta robots`[cite:3]
- `meta googlebot`[cite:3]
- `meta referrer`[cite:8]
- `meta theme-color`[cite:8]
- `meta author`[cite:60]
- `link rel=canonical`[cite:14]
- `link rel=alternate hreflang`[cite:3]
- `meta keywords` (legacy / generally avoid)[cite:5]

### Open Graph
- `og:title`[cite:32]
- `og:description`[cite:32]
- `og:image`[cite:32]
- `og:url`[cite:32]
- `og:type`[cite:30]
- `og:site_name`[cite:30]
- `og:locale`[cite:30]
- `og:image:alt`[cite:30]
- `og:image:width`[cite:30]
- `og:image:height`[cite:30]
- `article:published_time`[cite:30]
- `article:modified_time`[cite:30]
- `article:author`[cite:30]
- `article:section`[cite:30]
- `article:tag`[cite:30]

### Twitter
- `twitter:card`[cite:32]
- `twitter:title`[cite:32]
- `twitter:description`[cite:32]
- `twitter:image`[cite:32]
- `twitter:image:alt`[cite:32]
- `twitter:site`[cite:32]
- `twitter:creator`[cite:32]

### JSON-LD Types
- `WebSite`[cite:3]
- `WebPage`[cite:3]
- `Organization`[cite:3]
- `Person`[cite:54]
- `BreadcrumbList`[cite:3]
- `Article`[cite:54]
- `BlogPosting`[cite:55]
- `FAQPage`[cite:38]
- `HowTo`[cite:77]
- `VideoObject`[cite:71]
- `ImageObject`[cite:69]
- `NewsArticle`[cite:53]
- `TechArticle`[cite:53]
- `Review`[cite:53]
- `Product`[cite:53][cite:65]
- `SoftwareApplication`[cite:53][cite:65]
- `QAPage`[cite:53]
- `Speakable`[cite:53]
