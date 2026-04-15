# Graph Report - src  (2026-04-14)

## Corpus Check
- Corpus is ~14,228 words - fits in a single context window. You may not need a graph.

## Summary
- 102 nodes · 76 edges · 42 communities detected
- Extraction: 67% EXTRACTED · 33% INFERRED · 0% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_SEO & AI Visibility Strategy|SEO & AI Visibility Strategy]]
- [[_COMMUNITY_Text Conversion Utilities|Text Conversion Utilities]]
- [[_COMMUNITY_Content Schema Layer|Content Schema Layer]]
- [[_COMMUNITY_Cursor Animation System|Cursor Animation System]]
- [[_COMMUNITY_Content Processing Utils|Content Processing Utils]]
- [[_COMMUNITY_Maryland Feature Pages|Maryland Feature Pages]]
- [[_COMMUNITY_Homepage Section Assembly|Homepage Section Assembly]]
- [[_COMMUNITY_Dynamic Icon System|Dynamic Icon System]]
- [[_COMMUNITY_Sort Functions|Sort Functions]]
- [[_COMMUNITY_Tab Rendering Pipeline|Tab Rendering Pipeline]]
- [[_COMMUNITY_Pricing Architecture|Pricing Architecture]]
- [[_COMMUNITY_Tabs Component Module|Tabs Component Module]]
- [[_COMMUNITY_Tab Component Module|Tab Component Module]]
- [[_COMMUNITY_Button Component Module|Button Component Module]]
- [[_COMMUNITY_YouTube Component Module|YouTube Component Module]]
- [[_COMMUNITY_Reading Time Module|Reading Time Module]]
- [[_COMMUNITY_Date Format Module|Date Format Module]]
- [[_COMMUNITY_Similar Items Module|Similar Items Module]]
- [[_COMMUNITY_Taxonomy Filter Module|Taxonomy Filter Module]]
- [[_COMMUNITY_BG Image Module|BG Image Module]]
- [[_COMMUNITY_Infinite Slider Module|Infinite Slider Module]]
- [[_COMMUNITY_Media Shortcodes|Media Shortcodes]]
- [[_COMMUNITY_Animation Utilities|Animation Utilities]]
- [[_COMMUNITY_Icon & Shortcode Bridge|Icon & Shortcode Bridge]]
- [[_COMMUNITY_Legal Pages|Legal Pages]]
- [[_COMMUNITY_Content Config Entry|Content Config Entry]]
- [[_COMMUNITY_Sections Collection Entry|Sections Collection Entry]]
- [[_COMMUNITY_Pages Collection Entry|Pages Collection Entry]]
- [[_COMMUNITY_Accordion Module|Accordion Module]]
- [[_COMMUNITY_Video Module|Video Module]]
- [[_COMMUNITY_Notice Module|Notice Module]]
- [[_COMMUNITY_Accordion Component|Accordion Component]]
- [[_COMMUNITY_Button Component|Button Component]]
- [[_COMMUNITY_Notice Component|Notice Component]]
- [[_COMMUNITY_Date Format Utility|Date Format Utility]]
- [[_COMMUNITY_BG Image Utility|BG Image Utility]]
- [[_COMMUNITY_About Page|About Page]]
- [[_COMMUNITY_Contact Page|Contact Page]]
- [[_COMMUNITY_Blog Index|Blog Index]]
- [[_COMMUNITY_FAQs Page|FAQs Page]]
- [[_COMMUNITY_Integrations Page|Integrations Page]]
- [[_COMMUNITY_Testimonial Section|Testimonial Section]]

## God Nodes (most connected - your core abstractions)
1. `Why AI Platforms Aren't Sending Traffic` - 7 edges
2. `Features Index Page` - 6 edges
3. `Pages Collection Schemas` - 4 edges
4. `Local SEO Feature` - 4 edges
5. `AEO Optimization Feature` - 4 edges
6. `How to Check Maryland Business Name Availability` - 4 edges
7. `emojifyShortcodes()` - 3 edges
8. `plainify()` - 3 edges
9. `Content Collection Registry` - 3 edges
10. `Sections Collection Schemas` - 3 edges

## Surprising Connections (you probably didn't know these)
- `Video Shortcode Component` --semantically_similar_to--> `YouTube Shortcode Component`  [INFERRED] [semantically similar]
  src/layouts/shortcodes/Video.tsx → src/layouts/shortcodes/Youtube.tsx
- `Cursor Animation Component` --semantically_similar_to--> `Infinite Slider Initializer`  [INFERRED] [semantically similar]
  src/layouts/helpers/Cursor.tsx → src/lib/utils/infSlider.ts
- `Reading Time Calculator` --semantically_similar_to--> `Text Converter Utilities`  [INFERRED] [semantically similar]
  src/lib/utils/readingTime.ts → src/lib/utils/textConverter.ts
- `Similar Items Filter` --semantically_similar_to--> `Taxonomy Filter`  [INFERRED] [semantically similar]
  src/lib/utils/similarItems.ts → src/lib/utils/taxonomyFilter.ts
- `Features Index Page` --references--> `Local SEO Feature`  [INFERRED]
  src/content/features/-index.md → src/content/features/local-seo.md

## Hyperedges (group relationships)
- **Shortcode Component System** — tabs_component, tab_component, accordion_component, video_component, button_component, youtube_component, notice_component [INFERRED 0.90]
- **Content Data Pipeline** — content_config_registry, pages_collection_schemas, sections_collection_schemas, zod_validation, astro_content_layer [EXTRACTED 0.95]
- **Text Processing Utilities** — text_converter_util, reading_time_util, taxonomy_filter_util, similar_items_util [INFERRED 0.80]
- **Maryland Business Feature Suite** — feature_local_seo, feature_analytics, feature_website_builder, feature_ai_content, feature_marketing_automation, feature_aeo [EXTRACTED 0.95]
- **Homepage Section Assembly** — homepage_content, cta_section, trusted_brands_section, features_carousel_section, testimonial_section, pricing_section [INFERRED 0.85]
- **SEO and AI Visibility Strategy** — blog_ai_traffic, feature_aeo, feature_local_seo, json_ld_structured_data, ai_search_platforms, google_business_profile [INFERRED 0.80]

## Communities

### Community 0 - "SEO & AI Visibility Strategy"
Cohesion: 0.31
Nodes (10): AI Search Platforms, Why AI Platforms Aren't Sending Traffic, How to Check Maryland Business Name Availability, AEO Optimization Feature, Local SEO Feature, Google Business Profile, JSON-LD Structured Data, Maryland Business Market (+2 more)

### Community 1 - "Text Conversion Utilities"
Cohesion: 0.39
Nodes (6): emojifyShortcodes(), htmlEntityDecoder(), humanize(), markdownify(), plainify(), titleify()

### Community 2 - "Content Schema Layer"
Cohesion: 0.38
Nodes (7): Astro Content Layer, Button Schema, Common Fields Pattern, Content Collection Registry, Pages Collection Schemas, Sections Collection Schemas, Zod Schema Validation

### Community 3 - "Cursor Animation System"
Cohesion: 0.33
Nodes (0): 

### Community 4 - "Content Processing Utils"
Cohesion: 0.4
Nodes (5): Reading Time Calculator, Similar Items Filter, Sort Functions, Taxonomy Filter, Text Converter Utilities

### Community 5 - "Maryland Feature Pages"
Cohesion: 0.6
Nodes (5): AI-Powered Content Feature, Analytics and Reporting Feature, Marketing Automation Feature, Website Builder Feature, Features Index Page

### Community 6 - "Homepage Section Assembly"
Cohesion: 0.5
Nodes (4): Call to Action Section Content, Features Carousel Section Content, Homepage Content, Trusted Brands Section Content

### Community 7 - "Dynamic Icon System"
Cohesion: 1.0
Nodes (2): DynamicIcon(), getIconLibrary()

### Community 8 - "Sort Functions"
Cohesion: 0.67
Nodes (0): 

### Community 9 - "Tab Rendering Pipeline"
Cohesion: 0.67
Nodes (3): Markdown Rendering Pipeline, Tab Shortcode Component, Tabs Shortcode Component

### Community 10 - "Pricing Architecture"
Cohesion: 0.67
Nodes (3): Pricing Page Content, Pricing Section Content, Pricing Tiers

### Community 11 - "Tabs Component Module"
Cohesion: 1.0
Nodes (0): 

### Community 12 - "Tab Component Module"
Cohesion: 1.0
Nodes (0): 

### Community 13 - "Button Component Module"
Cohesion: 1.0
Nodes (0): 

### Community 14 - "YouTube Component Module"
Cohesion: 1.0
Nodes (0): 

### Community 15 - "Reading Time Module"
Cohesion: 1.0
Nodes (0): 

### Community 16 - "Date Format Module"
Cohesion: 1.0
Nodes (0): 

### Community 17 - "Similar Items Module"
Cohesion: 1.0
Nodes (0): 

### Community 18 - "Taxonomy Filter Module"
Cohesion: 1.0
Nodes (0): 

### Community 19 - "BG Image Module"
Cohesion: 1.0
Nodes (0): 

### Community 20 - "Infinite Slider Module"
Cohesion: 1.0
Nodes (0): 

### Community 21 - "Media Shortcodes"
Cohesion: 1.0
Nodes (2): Video Shortcode Component, YouTube Shortcode Component

### Community 22 - "Animation Utilities"
Cohesion: 1.0
Nodes (2): Cursor Animation Component, Infinite Slider Initializer

### Community 23 - "Icon & Shortcode Bridge"
Cohesion: 1.0
Nodes (2): DynamicIcon Component, Shortcode System

### Community 24 - "Legal Pages"
Cohesion: 1.0
Nodes (2): Privacy Policy Page, Terms and Conditions Page

### Community 25 - "Content Config Entry"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Sections Collection Entry"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Pages Collection Entry"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Accordion Module"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Video Module"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Notice Module"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Accordion Component"
Cohesion: 1.0
Nodes (1): Accordion Shortcode Component

### Community 32 - "Button Component"
Cohesion: 1.0
Nodes (1): Button Shortcode Component

### Community 33 - "Notice Component"
Cohesion: 1.0
Nodes (1): Notice Shortcode Component

### Community 34 - "Date Format Utility"
Cohesion: 1.0
Nodes (1): Date Formatter

### Community 35 - "BG Image Utility"
Cohesion: 1.0
Nodes (1): Background Image Modifier

### Community 36 - "About Page"
Cohesion: 1.0
Nodes (1): About Page Content

### Community 37 - "Contact Page"
Cohesion: 1.0
Nodes (1): Contact Page Content

### Community 38 - "Blog Index"
Cohesion: 1.0
Nodes (1): Blog Index Page

### Community 39 - "FAQs Page"
Cohesion: 1.0
Nodes (1): FAQs Page Content

### Community 40 - "Integrations Page"
Cohesion: 1.0
Nodes (1): Integrations Page Content

### Community 41 - "Testimonial Section"
Cohesion: 1.0
Nodes (1): Testimonial Section Content

## Knowledge Gaps
- **31 isolated node(s):** `Common Fields Pattern`, `Astro Content Layer`, `Tab Shortcode Component`, `Accordion Shortcode Component`, `Video Shortcode Component` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Tabs Component Module`** (2 nodes): `Tabs.tsx`, `Tabs()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Tab Component Module`** (2 nodes): `Tab.tsx`, `Tab()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Button Component Module`** (2 nodes): `Button()`, `Button.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `YouTube Component Module`** (2 nodes): `Youtube.tsx`, `Youtube()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Reading Time Module`** (2 nodes): `readingTime()`, `readingTime.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Date Format Module`** (2 nodes): `dateFormat()`, `dateFormat.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Similar Items Module`** (2 nodes): `similarItems()`, `similarItems.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Taxonomy Filter Module`** (2 nodes): `taxonomyFilter.ts`, `taxonomyFilter()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `BG Image Module`** (2 nodes): `bgImageMod()`, `bgImageMod.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Infinite Slider Module`** (2 nodes): `initInfiniteSliders()`, `infSlider.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Media Shortcodes`** (2 nodes): `Video Shortcode Component`, `YouTube Shortcode Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Animation Utilities`** (2 nodes): `Cursor Animation Component`, `Infinite Slider Initializer`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Icon & Shortcode Bridge`** (2 nodes): `DynamicIcon Component`, `Shortcode System`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Legal Pages`** (2 nodes): `Privacy Policy Page`, `Terms and Conditions Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Content Config Entry`** (1 nodes): `content.config.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Sections Collection Entry`** (1 nodes): `sections.collection.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Pages Collection Entry`** (1 nodes): `pages.collection.ts`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Accordion Module`** (1 nodes): `Accordion.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Video Module`** (1 nodes): `Video.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Notice Module`** (1 nodes): `Notice.tsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Accordion Component`** (1 nodes): `Accordion Shortcode Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Button Component`** (1 nodes): `Button Shortcode Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Notice Component`** (1 nodes): `Notice Shortcode Component`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Date Format Utility`** (1 nodes): `Date Formatter`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `BG Image Utility`** (1 nodes): `Background Image Modifier`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `About Page`** (1 nodes): `About Page Content`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Contact Page`** (1 nodes): `Contact Page Content`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Blog Index`** (1 nodes): `Blog Index Page`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `FAQs Page`** (1 nodes): `FAQs Page Content`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Integrations Page`** (1 nodes): `Integrations Page Content`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Testimonial Section`** (1 nodes): `Testimonial Section Content`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Features Index Page` connect `Maryland Feature Pages` to `SEO & AI Visibility Strategy`?**
  _High betweenness centrality (0.009) - this node is a cross-community bridge._
- **Are the 3 inferred relationships involving `Why AI Platforms Aren't Sending Traffic` (e.g. with `AEO Optimization Feature` and `Local SEO Feature`) actually correct?**
  _`Why AI Platforms Aren't Sending Traffic` has 3 INFERRED edges - model-reasoned connections that need verification._
- **Are the 6 inferred relationships involving `Features Index Page` (e.g. with `Local SEO Feature` and `Analytics and Reporting Feature`) actually correct?**
  _`Features Index Page` has 6 INFERRED edges - model-reasoned connections that need verification._
- **Are the 2 inferred relationships involving `Local SEO Feature` (e.g. with `Features Index Page` and `Why AI Platforms Aren't Sending Traffic`) actually correct?**
  _`Local SEO Feature` has 2 INFERRED edges - model-reasoned connections that need verification._
- **Are the 4 inferred relationships involving `AEO Optimization Feature` (e.g. with `Features Index Page` and `AI Search Platforms`) actually correct?**
  _`AEO Optimization Feature` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Common Fields Pattern`, `Astro Content Layer`, `Tab Shortcode Component` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._