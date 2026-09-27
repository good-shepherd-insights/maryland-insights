# FEATURE: Hyper-Local Entity Injection

## Objective
Transform Maryland Insights into a hyper-local authority for Search (SEO), Answer Engines (AEO), and Generative Engines (GEO). This is achieved by injecting specific Maryland geographic entities (Baltimore, Annapolis, Columbia, etc.) into content and automating structured data (FAQSchema) to facilitate AI citation and local discovery.

---

## Phase 1: Local Entity Data Definition
**Justification:** Establishing a central "Source of Truth" for Maryland entities ensures consistency across the site. AI models (GEO) look for co-occurrence of brand name + specific geographic entities to build a knowledge graph.

**Action:** Create `src/config/entities.json` to store Maryland-specific geographic data.

**Target File:** `src/config/entities.json` (New File)

```json
{
  "state": "Maryland",
  "abbreviation": "MD",
  "primary_hubs": [
    {
      "city": "Baltimore",
      "county": "Baltimore City",
      "landmarks": ["Inner Harbor", "Fort McHenry", "Fells Point"]
    },
    {
      "city": "Annapolis",
      "county": "Anne Arundel County",
      "landmarks": ["Maryland State House", "United States Naval Academy"]
    },
    {
      "city": "Columbia",
      "county": "Howard County",
      "landmarks": ["Merriweather Post Pavilion"]
    }
  ],
  "counties": [
    "Montgomery", "Prince George's", "Baltimore", "Anne Arundel", "Howard", "Frederick", "Harford", "Carroll"
  ]
}
```

---

## Phase 2: FAQ Content Enrichment (GEO/AEO)
**Justification:** Generative engines (GEO) prioritize "direct answers" that contain factual, verifiable entities. By adding specific city names to FAQ answers, we signal that our "Maryland" expertise is not generic but localized.

**Target File:** `src/content/faqs/-index.md`

**Action:** Update the `faqs_list` with hyper-local injections.

```markdown
faqs_list:
  - question: "Is Maryland Insights built specifically for local businesses?"
    answer: "Yes. Whether you're a startup in **Baltimore**, a boutique in **Annapolis**, or a service provider in **Columbia**, our tools are optimized exclusively for the Maryland market. We focus on connecting you with local customers in your specific MD county."

  - question: "Will my website rank for local searches in my specific city?"
    answer: "Absolutely. Our AI builder automatically structures your site for local discovery. For example, if you're a contractor in **Silver Spring** or a lawyer in **Towson**, our system generates location-specific metadata to ensure you appear in Google Maps and local AI summaries."

  - question: "How does Maryland-based support help my business grow?"
    answer: "Our team understands the Maryland economic landscape. We provide personalized insights for businesses across the state, from **Ocean City** to **Frederick**, ensuring your growth strategy aligns with local market trends and Maryland-specific SEO requirements."
```

---

## Phase 3: Automated FAQSchema JSON-LD (AEO/SEO)
**Justification:** FAQSchema is the "machine-readable" bridge. It allows Google to show rich snippets and allows Answer Engines (AEO) like Siri/Alexa to parse your content as a verified Q&A pair.

**Target File:** `src/layouts/Base.astro`
**Action:** Add a `schema` prop to the `Props` interface and inject it into the `<head>`.

```astro
// src/layouts/Base.astro (Line 33)
export interface Props {
  title?: string;
  meta_title?: string;
  description?: string;
  image?: string;
  noindex?: boolean;
  canonical?: string;
  schema?: string; // Add this
}

// src/layouts/Base.astro (Line 180, inside <head>)
{schema && <script type="application/ld+json" set:html={schema} />}
```

**Target File:** `src/pages/faqs.astro`
**Action:** Generate the JSON-LD string dynamically from the `faqs_list` and pass it to the `Base` layout.

```astro
// src/pages/faqs.astro (After line 13)
const faqSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs_list.map((faq) => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

// Update the Base tag (Line 16)
<Base {...pageIndex.data} schema={faqSchema}>
```

---

## Phase 4: LocalBusiness Global Schema (GEO)
**Justification:** To win at GEO, your brand must be associated with a "Place" entity. We will inject a global `LocalBusiness` schema that defines Maryland Insights as a Maryland-based entity.

**Target File:** `src/layouts/Base.astro`
**Action:** Add a default `LocalBusiness` schema for the brand if no page-specific schema is provided.

```astro
// src/layouts/Base.astro
const defaultSchema = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Maryland Insights",
  "image": config.site.base_url + config.metadata.meta_image,
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Baltimore",
    "addressRegion": "MD",
    "addressCountry": "US"
  },
  "url": config.site.base_url,
  "description": config.metadata.meta_description
});

// Inside <head>
{schema ? <script type="application/ld+json" set:html={schema} /> : <script type="application/ld+json" set:html={defaultSchema} />}
```

---

## Anti-Laziness Audit (turbo-all)
1. **Grep Search:** Checked `faqs_list` usage. It is consumed in `src/pages/faqs.astro`.
2. **Schema Conflicts:** Checked if other pages provide schema. Currently, no pages pass a `schema` prop, so the `LocalBusiness` fallback in `Base.astro` is safe.
3. **Markdown Parsing:** Ensure `faq.answer` in schema is cleaned of markdown syntax (bolding `**` etc.) before injection into JSON-LD.
    *   *Fix:* Use `plainify` or a regex to strip markdown from schema strings to avoid invalid JSON.

**Final Polish for Phase 3 (Updated Script):**
```javascript
"text": faq.answer.replace(/\*\*/g, "").replace(/\*/g, "") // Simple strip for schema
```

---

## Verification Plan
1. **SEO:** Run `npm run build` and inspect `dist/faqs/index.html`. Verify `<script type="application/ld+json">` contains the `FAQPage` structure.
2. **AEO:** Test the build output using the [Google Rich Results Test](https://search.google.com/test/rich-results) (simulated).
3. **GEO:** Confirm that city names (Baltimore, Annapolis) appear in both the visible UI and the background JSON-LD.
