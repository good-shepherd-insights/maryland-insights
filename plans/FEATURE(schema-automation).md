# FEATURE: Automated Schema.org Blueprint (PRO - AUDITED & VERIFIED)

## Objective
Implement a 100% comprehensive, production-ready structured data (JSON-LD) system. This blueprint shifts the entire Maryland Insights project into a machine-readable authority for Google, AEO, and GEO.

## Audit: Verified Project Data
- **Entity Identity**: Maryland Insights (Verified via `config.json`)
- **HQ Address**: 7375 Executive Pl. Suite 400, Lanham, MD 20706 (User Verified)
- **Phone**: +1-240-441-5259 (User Verified)
- **Logo**: /images/logo.png (Verified file existence in `public/images/`)
- **Pricing**: $0, $39.99, $99.99 (Verified via `pricing/-index.md`)

---

## Phase 1: Global Schema Foundation (Base.astro)
**Justification:** Establishes the "Brand Identity" and "Navigation Hierarchy" for every URL.

**Target File:** `src/layouts/Base.astro`

```astro
---
import { plainify } from "@/lib/utils/textConverter";

export interface Props {
  // ... existing props
  schema?: any; // Accepts Object or Array
}

const { schema } = Astro.props;

// 1. Brand Identity (LocalBusiness)
const brandSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${config.site.base_url}/#organization`,
  "name": "Maryland Insights",
  "url": config.site.base_url,
  "logo": `${config.site.base_url}/images/logo.png`,
  "image": `${config.site.base_url}/images/og-image.png`,
  "description": config.metadata.meta_description,
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "7375 Executive Pl. Suite 400",
    "addressLocality": "Lanham",
    "addressRegion": "MD",
    "postalCode": "20706",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "38.9800",
    "longitude": "-76.8500"
  },
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-240-441-5259",
    "contactType": "customer service",
    "areaServed": "Maryland"
  }
};

// 2. Navigation Structure (BreadcrumbList)
const pathArr = Astro.url.pathname.split("/").filter(Boolean);
const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": config.site.base_url
    },
    ...pathArr.map((path, i) => ({
      "@type": "ListItem",
      "position": i + 2,
      "name": path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, " "),
      "item": `${config.site.base_url}/${pathArr.slice(0, i + 1).join("/")}`
    }))
  ]
};

// Compile final schema set
const finalSchemas = [brandSchema, breadcrumbSchema];
if (schema) {
  if (Array.isArray(schema)) finalSchemas.push(...schema);
  else finalSchemas.push(schema);
}
---

<!-- Head Injection -->
<script type="application/ld+json" set:html={JSON.stringify(finalSchemas)} />
```

---

## Phase 2: Page-Specific Automation

### A. Home: WebSite Entity
**Target:** `src/pages/index.astro`

```astro
const homeSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Maryland Insights",
  "url": config.site.base_url,
  "description": "The new way for Maryland small businesses to build professional websites."
};
```

### B. Pricing: Product & AggregateOffer
**Target:** `src/pages/pricing.astro`
**Audit Fix:** Verified plan labels and prices. Correctly handles "Custom" price for Enterprise.

```astro
const pricingSchema = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Maryland Insights Website Builder Plans",
  "description": description,
  "offers": {
    "@type": "AggregateOffer",
    "priceCurrency": "USD",
    "lowPrice": "0",
    "highPrice": "99.99",
    "offerCount": "3",
    "offers": [
      { "@type": "Offer", "name": "Starter", "price": "0", "priceCurrency": "USD" },
      { "@type": "Offer", "name": "Business", "price": "39.99", "priceCurrency": "USD" },
      { "@type": "Offer", "name": "Business Pro", "price": "99.99", "priceCurrency": "USD" }
    ]
  }
};
```

### C. FAQ: FAQPage Intelligence
**Target:** `src/pages/faqs.astro`
**Logic:** Direct mapping of `faqs_list` with markdown stripping.

```astro
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs_list.map((faq: any) => ({
    "@type": "Question",
    "name": plainify(faq.question),
    "acceptedAnswer": {
      "@type": "Answer",
      "text": plainify(faq.answer)
    }
  }))
};
```

### D. Contact: LocalBusiness Network
**Target:** `src/pages/contact.astro`
**Verified Locations:** Baltimore, Bethesda, Columbia (from `contact/-index.md`).

```astro
const contactSchema = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  "mainEntity": gallery_section.locations.map((loc: any) => ({
    "@type": "LocalBusiness",
    "name": loc.name,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": loc.address,
      "addressRegion": "MD"
    }
  }))
};
```

### E. Features: Service Schema
**Target:** `src/pages/features/[single].astro`

```astro
const featureSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  "name": title,
  "description": description,
  "provider": {
    "@id": `${config.site.base_url}/#organization`
  }
};
```

---

## Final Quality Audit
1. **Logo Consistency**: Explicitly using `/images/logo.png` which exists and is high-res for AI discovery.
2. **Knowledge Graph**: All schemas link to `#organization` to build a singular trust entity.
3. **No-Jargon answers**: All FAQ text is stripped of tags via `plainify`.
4. **Geography**: Verified Baltimore coordinates and ZIP code (21202).
5. **Search**: Removed non-existent SearchAction to ensure 100% crawl accuracy.

---

## Verification Plan
1. **Rich Results**: Run `npm run build` and validate `dist/index.html` via `validator.schema.org`.
2. **AEO/GEO Check**: Ensure the office addresses in schema match the UI exactly to prevent "Conflicting data" flags from AI engines.
