# FEATURE(scalable-faqs)

## Request
Integrate scoped FAQs directly into the individual feature pages to bolster local Answer Engine Optimization (AEO). The FAQs, currently written as plain markdown, must be migrated to structured frontmatter so they can be injected into the page via the interactive `<Faqs>` component and correctly structured as JSON-LD (`FAQPage` schema) alongside the existing `SoftwareApplication` schema.

## Directory Map
```text
src/
  pages/
    features/
      [single].astro                  (modify)
  content/
    features/
      website-builder.md              (modify)
      analytics-reporting.md          (modify)
      aeo-optimization.md             (modify)
      ...                             (and any other feature md files)
```

## Modification Table
| File | Action | Why |
|---|---|---|
| `src/pages/features/[single].astro` | Modify | Conditionally generate JSON-LD `FAQPage` schema and render the `<Faqs>` component if the feature frontmatter contains FAQs. |
| `src/content/features/*.md` | Modify | Migrate unstructured markdown FAQs into the structured `faqs_list` frontmatter array so they can be parsed for both UI and SEO. |

## Existing Pattern Audit
- **Schema Passing**: The `Base` layout component accepts an array of schemas `schema={[...]}`. `[single].astro` currently passes `schema={[featureSchema]}`. We can append `faqSchema` to this array when FAQs exist.
- **FAQ Rendering**: There is an existing `src/layouts/partials/Faqs.astro` component designed to receive an object with a `faqs_list` array. It is heavily utilized on the global FAQ page and should be reused unconditionally here to preserve the existing styles and accordion interactions.
- **Frontmatter Data Shapes**: The global FAQs use `{ question: string, answer: string }` objects in the frontmatter. We must adopt this identical data shape for the localized feature pages.

## Execution Plan
### Step 1 — Support FAQs in Feature Layout
Update the Astro component mapping individual features to extract the FAQ list, generate the required `FAQPage` Answer Engine syntax, and append it dynamically beneath the main feature content.

### Step 2 — Restructure Content Files
Convert the plain-text markdown FAQs currently embedded at the bottom of `website-builder.md`, `analytics-reporting.md`, etc., into structured frontmatter arrays, enabling proper component routing and structured data processing.

## File-by-File Changes

### `src/pages/features/[single].astro`

**Action:** Modify  
**Why:** Incorporates the pre-existing `<Faqs>` component directly into the feature pages while surfacing Answer Engine Optimization structure (JSON-LD) dynamically.  
**Impact:** Generates rich `FAQPage` answers directly into the DOM schema array, escalating SEO indexing confidence.

#### Before
```astro
---
import config from "@/config/config.json";
import ImageMod from "@/components/ImageMod.astro";
import Base from "@/layouts/Base.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import CallToAction from "@/partials/CallToAction.astro";
import PageHeader from "@/partials/PageHeader.astro";
import { plainify } from "@/lib/utils/textConverter";
import type { SoftwareApplication } from "schema-dts";
import { render } from "astro:content";

export async function getStaticPaths() {
  const features = await getSinglePage("features");

  const paths = features.map((feature) => ({
    params: {
      single: feature.id,
    },
    props: { feature },
  }));
  return paths;
}

const { feature } = Astro.props;
const { title, description, image } = feature.data;

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

<Base {...feature.data} schema={[featureSchema]}>
  <PageHeader title={title} description={description} />

  <section class="section-sm bg-light">
    <div
      class="container flex flex-col lg:flex-row justify-center gap-5 items-start"
    >
      <article
       
       
        class="w-full lg:w-7/12 bg-body rounded-2xl px-6 sm:px-8 xl:px-10 py-4"
      >
        {
          image && (
            <div>
              <ImageMod
                src={image}
                alt={title}
                width={800}
                height={450}
                class="w-full h-auto rounded-lg mb-6"
              />
            </div>
          )
        }
        <div class="content">
          <Content />
        </div>
      </article>
    </div>
  </section>

  <CallToAction />
</Base>
```

#### After
```astro
---
import config from "@/config/config.json";
import ImageMod from "@/components/ImageMod.astro";
import Base from "@/layouts/Base.astro";
import { getSinglePage } from "@/lib/contentParser.astro";
import CallToAction from "@/partials/CallToAction.astro";
import PageHeader from "@/partials/PageHeader.astro";
import Faqs from "@/partials/Faqs.astro";
import { plainify } from "@/lib/utils/textConverter";
import type { SoftwareApplication, FAQPage, Question } from "schema-dts";
import { render } from "astro:content";

export async function getStaticPaths() {
  const features = await getSinglePage("features");

  const paths = features.map((feature) => ({
    params: {
      single: feature.id,
    },
    props: { feature },
  }));
  return paths;
}

const { feature } = Astro.props;
const { title, description, image, faqs_list } = feature.data;

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

const pageSchemas: any[] = [featureSchema];

if (faqs_list && faqs_list.length > 0) {
  const faqSchema: FAQPage = {
    "@type": "FAQPage",
    mainEntity: faqs_list.map(
      (faq: any) =>
        ({
          "@type": "Question",
          name: plainify(faq.question),
          acceptedAnswer: {
            "@type": "Answer",
            text: plainify(faq.answer),
          },
        }) as Question,
    ),
  };
  pageSchemas.push(faqSchema);
}
---

<Base {...feature.data} schema={pageSchemas}>
  <PageHeader title={title} description={description} />

  <section class="section-sm bg-light">
    <div
      class="container flex flex-col lg:flex-row justify-center gap-5 items-start"
    >
      <article
        class="w-full lg:w-7/12 bg-body rounded-2xl px-6 sm:px-8 xl:px-10 py-4"
      >
        {
          image && (
            <div>
              <ImageMod
                src={image}
                alt={title}
                width={800}
                height={450}
                class="w-full h-auto rounded-lg mb-6"
              />
            </div>
          )
        }
        <div class="content">
          <Content />
        </div>
      </article>
    </div>
  </section>

  {faqs_list && faqs_list.length > 0 && <Faqs data={{ faqs_list, section_title: `Frequently Asked Questions About ${title}` }} prefix="feature-faq" />}

  <CallToAction />
</Base>
```

#### Reasoning
- Conditionally checks for `faqs_list` inside of `feature.data` allowing seamless fallback for features without complete FAQ copy yet.
- Explicit schema array appending allows for Google to correctly intercept localized JSON-LD without breaking native `SoftwareApplication` mapping.
- Directly imports `Faqs.astro` with prefix configuration to prevent collision if multiple accordion components land natively on a single scroll environment.

### `src/content/features/website-builder.md`

**Action:** Modify  
**Why:** Migrate raw conversational markdown formats into strictly parsable data blocks mapping accurately to frontmatter fields.  
**Impact:** Moves markdown content into strict objects.

#### Before
```md
---
title: "Website Builder"
meta_title: "Website Builder for Maryland Small Businesses | Maryland Insights"
description: "Create a professional website built specifically for Maryland small businesses in minutes. No coding needed — just a fast, conversion-ready online presence designed to attract local customers, rank in Maryland search results, and grow your business from day one."
image: "/images/features/1.png"
button:
  enable: true
  label: "Click to Learn More"
  link: "/get-started"
draft: false
---
...
## Why Maryland Businesses Choose Us
Generic website builders are built for everyone — which means they are optimized for no one...

> A professional website makes your Maryland business real to every customer searching for you. Build yours today.

## Frequently Asked Questions About Our Website Builder for Maryland Businesses

**Do I need any technical experience to build a website for my Maryland business?**
None at all. Our builder is designed specifically for Maryland small business owners who want a professional online presence without learning to code or hiring a developer. If you can describe your business and click a button, you can build a great website with our platform.

**How long does it take to launch a Maryland business website?**
Most Maryland business owners have a fully functional, professionally designed website live within the same day — often within the first hour. The AI-powered generation handles the heavy lifting, and our editor makes customization fast and intuitive so you can launch without delay.

...
```

#### After
```md
---
title: "Website Builder"
meta_title: "Website Builder for Maryland Small Businesses | Maryland Insights"
description: "Create a professional website built specifically for Maryland small businesses in minutes. No coding needed — just a fast, conversion-ready online presence designed to attract local customers, rank in Maryland search results, and grow your business from day one."
image: "/images/features/1.png"
button:
  enable: true
  label: "Click to Learn More"
  link: "/get-started"
draft: false
faqs_list:
  - question: "Do I need any technical experience to build a website for my Maryland business?"
    answer: "None at all. Our builder is designed specifically for Maryland small business owners who want a professional online presence without learning to code or hiring a developer. If you can describe your business and click a button, you can build a great website with our platform."
  - question: "How long does it take to launch a Maryland business website?"
    answer: "Most Maryland business owners have a fully functional, professionally designed website live within the same day — often within the first hour. The AI-powered generation handles the heavy lifting, and our editor makes customization fast and intuitive so you can launch without delay."
  - question: "Will my website rank on Google for Maryland search terms?"
    answer: "Yes. Every site built on our platform includes foundational Local SEO elements from the start — including optimized page titles, meta descriptions, header structure, schema markup, and location-specific content signals. Combined with our dedicated Local SEO tools, your Maryland business will be positioned to rank for the search terms your local customers are using."
  - question: "Can I add more pages and content as my Maryland business grows?"
    answer: "Absolutely. Our platform is built to scale with you. You can add service pages, location pages targeting specific Maryland neighborhoods and zip codes, blog posts, team pages, testimonial sections, and more — all without touching code or rebuilding your site from scratch."
  - question: "What if I already have a website but it is not performing well in Maryland search results?"
    answer: "Our platform is built to replace underperforming websites quickly and cost-effectively. Many Maryland small businesses migrate from outdated or generic sites and immediately see improvements in local search visibility, mobile performance, and lead conversion — simply by switching to a site built with local intent in mind."
  - question: "Can the website integrate with my other Maryland Insights tools?"
    answer: "Yes. Your website connects seamlessly with every other tool in the Maryland Insights platform — including Local SEO, AEO Optimization, Analytics and Reporting, Marketing Automation, and AI-Powered Content — creating a unified growth system built specifically for your Maryland small business."
---
...
## Why Maryland Businesses Choose Us
Generic website builders are built for everyone — which means they are optimized for no one...

> A professional website makes your Maryland business real to every customer searching for you. Build yours today.

## Ready to Get Started?
...
```

#### Reasoning
- Removes the hardcoded Markdown syntax allowing standard layout overrides and schema generation explicitly through frontmatter configuration keys. *(Other `.md` features will follow this exact same operation mapped to their specific content).*

## Validation Plan
1. Start local dev env via `yarn dev`.
2. Evaluate `/features/website-builder`:
    - Ensure `<Faqs>` template loads with complete interaction logic.
    - Test accordion interactions (expand/collapse) inside UI.
3. DOM Check: View Source -> ensure `<script type="application/ld+json">` includes `"@type": "FAQPage"`.
4. Ensure global `/faqs` page continues to work as intended and does not surface data-leaks from specific feature scoped attributes.

## Risk Notes
- **Empty Array Handling:** Evaluated safely using conditional checks in `[single].astro` rendering so features without explicit FAQs will fail gracefully.
- **Multiple JSON-LD Strings:** Handled accurately by native astro layout merging if an array is passed.

## Approval
`Status: Awaiting explicit user approval. Do not implement yet.`
