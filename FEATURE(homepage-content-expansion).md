# FEATURE(homepage-yaml-optimization)

## Request
Extract the key areas on the homepage that are triggering the thin content flag due to sparse YAML configuration. Provide highly expanded, exact outlines for a competent human copywriter so they know precisely what technical, localized, and entity-rich content to write into each specific field, while strictly maintaining the UI component architecture (no Markdown body injection).

## The Reality of the Thin Content Flag
The homepage is a UI-driven landing page. Search engines flag these as "thin content" when the semantic data inside the UI components is both extremely sparse and highly generic. To cure this flag without breaking the template, the human copywriter must execute a precise semantic overhaul of the existing YAML keys within `src/content/homepage/-index.md`.

## Expanded Copywriting Mandate: Key Areas to Overhaul

### 1. The Hero Banner (`banner.content`)
**Current State:** 2 generic sentences ("Go from words to a business-ready site... Dominate local search, attract Maryland customers...")  
**The Human Mandate:**
The copywriter must rewrite this to 3-4 dense, declarative sentences establishing structural expertise immediately above the fold. 
*   **Concepts to include:** Instead of just "attract customers," explicitly mention the stack and the local outcome. Mention "Zero-JS rendering," "Astro-powered speed," or "Google Local Pack rankings in key Maryland MSAs (like Baltimore, Annapolis, Frederick)."
*   **Goal:** Tell the crawler definitively *what* the software is and *who* it is for, using strict nouns (entities) rather than verbs (marketing).

### 2. The Features Swiper (`agents_swiper.agents[0-5].description`)
**Current State:** 6 items containing exactly 1 generic sentence each (e.g., "Create a website... No coding needed.").  
**The Human Mandate:**
The copywriter must expand EVERY single description to 2-3 substantive sentences containing exact-match industry terminology. Here is exactly what to write for each:
*   **Website Builder:** Stop saying "No coding needed." Start describing *how* it's built. The copywriter must mention "automated Core Web Vitals optimization," "mobile-first responsive grids," and "schema-ready components."
*   **AEO Optimization:** Explain what AEO actually is. The copywriter needs to mention optimizing for "Google SGE (Search Generative Experience)," "AI Overviews," and "natural language search structuring."
*   **Local SEO:** Do not stop at "appear on Google Maps." The copywriter must explicitly mention "Google Business Profile (GBP) syncing," "local citation management," and "hyper-local metadata for Maryland counties."
*   **Analytics and Reporting:** Detail the exact metrics. Mention "privacy-first telemetry," "goal conversion tracking without cookie-bloat," and "real-time traffic attribution."
*   **Marketing Automation:** Outline the actual pipeline. The copywriter must include "automated lead capture," "CRM integrations," and "drip sequence triggers."
*   **AI-Powered Content:** Specify the AI's capability. Mention "localized semantic keyword generation" and "automated schema markup drafting."

### 3. The Facts Grid (`facts_section.facts[0-3].description`)
**Current State:** 4 items with 1 subjective, marketing-heavy sentence each ("Launch a professional, AI-optimized website designed to convert...").  
**The Human Mandate:**
Search algorithms discard subjective claims (e.g., "professional," "designed to convert"). The copywriter must replace these with definitive, objective benchmarks.
*   **Build:** Mention the specific architectural advantage (e.g., "Deploy statically generated sites that achieve 90+ Lighthouse scores out of the box").
*   **Optimize:** Focus on the technical pipeline (e.g., "Automatic image format conversion to WebP/AVIF and automated semantic HTML validation").
*   **Rank:** Focus on the algorithmic strategy (e.g., "Deployed with pre-configured JSON-LD structured data and optimized meta hierarchies").
*   **Grow:** Focus on business utility (e.g., "Integrates directly with localized lead-generation endpoints to capture local search intent").

### 4. Semantic Metadata (Schema Injection)
**Current State:** The homepage lacks explicit structured data telling Google what the platform is.  
**The Developer Mandate:**
While the copywriter updates the YAML, a developer must implement `WebSite` and `SoftwareApplication` JSON-LD schema into the `<head>`, validating that Maryland Insights is an active SaaS platform supporting local businesses. This provides mathematical certainty to the crawler, rendering the "thin content" argument moot.

## Execution Rules for the Copywriter
1. **No Adjectives, Only Entities:** Strip out fluff. Use technical, location-specific, or industry-standard terms.
2. **Respect the Array:** Do not use line breaks or Markdown inside the YAML strings. Keep the sentences contiguous.
3. **Word Count Goal:** Raise the total word count of the YAML frontmatter by at least 250 highly relevant words across these specific nodes.

## Approval
`Status: Awaiting explicit user approval. Do not implement yet.`
