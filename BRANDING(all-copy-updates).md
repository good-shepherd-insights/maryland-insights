# BRANDING(all-copy-updates).md

## Objective

Update ALL remaining copy across Maryland Insights pages. Remove ALL emojis. Fix pricing page copy. Add relevant feature copy. Each change has explicit Wix/Squarespace justification.

---

## CURRENT STATUS - COMPLETE AUDIT

### Files ALREADY DONE (from previous implementation):
| File | Status |
|------|--------|
| src/content/homepage/-index.md | ✓ Done |
| src/content/sections/call-to-action.md | ✓ Done |
| src/content/sections/trusted-brands.md | ✓ Done |
| src/content/sections/pricing.md | ✓ Done (has tier descriptions) |
| src/content/contact/-index.md | ✓ Done |
| src/content/about/-index.md | ✓ Done |
| src/content/faqs/-index.md | ✓ Done |
| src/content/pricing/-index.md | ✓ Done |
| src/config/config.json | ✓ Done |

### Files STILL NEEDING UPDATES (this plan):

| File | Issues |
|------|--------|
| src/content/sections/features-carousel.md | Emoji ⚡️, lowercase "websites" |
| src/content/sections/testimonial.md | Emoji 🔧 |
| src/content/features/-index.md | Emojis ⚙️ 🚀 |
| src/content/features/feature-1.md | Wrong title, "Learn More" button, placeholder content |
| src/content/features/feature-2.md | Wrong title, "Learn More" button, placeholder content |
| src/content/features/feature-3.md | Wrong title, "Learn More" button, placeholder content |
| src/content/features/feature-4.md | Wrong title, "Learn More" button, placeholder content |
| src/content/features/feature-5.md | Wrong title, "Learn More" button, placeholder content |
| src/content/features/feature-6.md | Wrong title, "Learn More" button, placeholder content |

---

## WIX/SQUARESPACE JUSTIFICATION RULES

### Wix Patterns (from WIX-BRANDING-ANALYSIS.md):
1. **Clean titles** - No emojis, no decorative characters
2. **"Get Started" / "Start for Free"** - Primary CTAs consistently
3. **Benefit-driven copy** - Features as solutions, not capabilities
4. **"The new way..."** - Innovation positioning
5. **"No credit card required"** - Friction removal
6. **"No coding required"** - Simplify technical
7. **"14-day money-back guarantee"** - Risk reversal
8. **Numbers approach** - "272+ million users", "15,000 sites/day"

### Squarespace Patterns (from SQUARESPACE-BRANDING-ANALYSIS.md):
1. **Clean titles** - No emojis, professional
2. **"A website makes it real"** - Emotional positioning
3. **"Built to stand out, ready to scale"** - Outcome-focused
4. **Simplified section titles** - No decorative elements
5. **Benefit-first** - What you accomplish, not what tool does
6. **"Most Popular" badge** - Tier designation

### Combined Rule: REMOVE ALL EMOJIS
- Both Wix and Squarespace use CLEAN titles without decorative characters
- No ⚡️, 🔧, 🚀, ❔, ⏱️, ⚙️, 📉, 📈, etc.

---

## CHANGE 1: features-carousel.md

### File: `src/content/sections/features-carousel.md`

**Current (NEEDS FIX):**
```yaml
title: "⚡️ Industries <mark>We Serve</mark> in Maryland"
subtitle: "Our platform transforms businesses across Maryland..."

list:
  - title: Small Business
    subtitle: "Professional websites designed to..."
  - title: Home Services
    subtitle: "websites for contractors..."  # lowercase
  - title: Professional Services
    subtitle: "websites for lawyers..."  # lowercase
```

**Issues:**
1. Line 3: Emoji ⚡️ - MUST REMOVE (Wix: clean titles; Squarespace: no decorative elements)
2. Line 13: "websites" lowercase - MUST CAPITALIZE (Wix: professional presentation)
3. Line 18: "websites" lowercase - MUST CAPITALIZE

**Target:**
```yaml
title: "Industries <mark>We Serve</mark> in Maryland"
subtitle: "Our platform transforms Maryland businesses with tailored website and growth strategies."

list:
  - title: Small Business
    subtitle: "Professional websites designed to help Maryland small businesses grow and reach more customers."
  - title: Home Services
    subtitle: "Websites for contractors, plumbers, electricians, and other home service professionals."
  - title: Professional Services
    subtitle: "Websites for lawyers, accountants, consultants, and other professional service providers."
```

**Justification:**
- Emoji removal: Wix uses "clean, professional aesthetic"; Squarespace uses "simplified section titles"
- Capitalization: Wix presents "Professionally designed templates" - professional capitalization
- "across Maryland" → "Maryland businesses": Squarespace uses direct language, tighter phrasing

---

## CHANGE 2: testimonial.md

### File: `src/content/sections/testimonial.md`

**Current (NEEDS FIX):**
```yaml
title: "Clients <mark>trust us</mark> and our exclusive 🔧 <mark>service</mark>"
```

**Issue:** Emoji 🔧 - MUST REMOVE

**Target:**
```yaml
title: "Trusted by Maryland businesses"
```

**Justification:** 
- Emoji removal: Wix clean titles; Squarespace simplified titles
- "Trusted by Maryland businesses" - Direct, professional like Squarespace's approach
- Testimonial content: Keep as placeholder per user instruction

---

## CHANGE 3: features/-index.md

### File: `src/content/features/-index.md`

**Current (NEEDS FIX):**
```yaml
section_title: "Key features to <mark>build, rank</mark> and grow ⚙️ your <mark>business</mark> 🚀"
```

**Issues:**
- Line 8: Emojis ⚙️ and 🚀 - MUST REMOVE

**Target:**
```yaml
section_title: "Key features to <mark>build, rank</mark> and grow your <mark>business</mark>"
```

**Justification:** Both Wix and Squarespace use clean titles without decorative characters

---

## CHANGE 4-9: feature-1.md through feature-6.md

### Files: `src/content/features/feature-1.md` through `feature-6.md`

**Current Issue (ALL 6 FILES):**
- Wrong titles (e.g., "Task Automation" instead of service names)
- "Learn More" button instead of "Get Started"
- Duplicate placeholder content (identical for all 6)
- Emojis throughout (⏱️, ⚙️, 📉, 📈)
- No Maryland-specific content

### Mapping - Which Feature Page = Which Service:

| File | Current Title | Should Be Title | Service |
|------|--------------|-----------------|---------|
| feature-1.md | Task Automation | Website Builder | Website Builder |
| feature-2.md | Smart Responses | SEO Optimization | SEO Optimization |
| feature-3.md | Analytics & Insights | Local SEO | Local SEO |
| feature-4.md | (duplicate) | Analytics & Reporting | Analytics & Reporting |
| feature-5.md | (duplicate) | Marketing Automation | Marketing Automation |
| feature-6.md | (duplicate) | AI-Powered Content | AI-Powered Content |

---

### CHANGE 4: feature-1.md → Website Builder

**Target Content:**
```yaml
---
title: "Website Builder"
meta_title: "Website Builder - Maryland Insights"
description: "Build a professional Maryland website with AI-powered tools. No coding required."
image: "/images/features/1.png"
button:
  enable: true
  label: "Get Started"
  link: "/contact"
draft: false
---

## Build Your Maryland Business Website

Create a professional, conversion-optimized website without writing code. Our AI-powered builder helps Maryland businesses launch beautiful, effective websites in minutes.

## Key Benefits

- **Professional Design** — Choose from designer-made templates built for Maryland businesses
- **AI-Powered** — Let AI create your site based on your business description
- **No Coding Required** — Point and click to customize everything
- **Maryland Optimized** — Templates designed to convert Maryland visitors

## How It Works

1. Tell us about your Maryland business
2. AI generates a personalized website
3. Customize with our easy editor
4. Launch and start getting customers

## Why Choose Maryland Insights?

Our website builder is specifically designed for Maryland small businesses. We understand the local market and optimize every site for Maryland search results.

> Your Maryland business deserves a professional website. Build yours today.
```

**Wix Justification:**
- "No coding required" - Wix EXACT phrase from analysis
- Benefit-driven: Wix "features as solutions, not capabilities"
- "Get Started" button - Wix primary CTA

**Squarespace Justification:**
- Professional presentation like Squarespace
- "What you accomplish, not what tool does"

---

### CHANGE 5: feature-2.md → SEO Optimization

**Target Content:**
```yaml
---
title: "SEO Optimization"
meta_title: "SEO Services - Maryland Insights"
description: "Rank higher in Maryland search results with proven SEO strategies."
image: "/images/features/2.png"
button:
  enable: true
  label: "Get Started"
  link: "/contact"
draft: false
---

## Rank Higher in Maryland Search Results

Our proven SEO strategies help your Maryland business get found by customers searching for your products and services.

## Key Benefits

- **Maryland Focus** — SEO optimized specifically for Maryland search
- **Proven Results** — Data-driven strategies that deliver rankings
- **Complete Optimization** — On-page, off-page, and technical SEO
- **Transparent Reporting** — Track your rankings and traffic

## How It Works

1. We analyze your current SEO performance
2. Develop a customized strategy for your Maryland business
3. Implement optimizations
4. Track and report results

## Why Choose Maryland Insights?

We specialize in Maryland SEO. While other agencies spread thin, we focus exclusively on helping Maryland businesses dominate local search.

> Get found by Maryland customers searching for your services.
```

**Wix Justification:**
- Benefit-driven copy: "Rank higher" not "SEO Optimization"
- "Get Started" - primary CTA
- "Proven results" - Wix uses data-driven messaging

---

### CHANGE 6: feature-3.md → Local SEO

**Target Content:**
```yaml
---
title: "Local SEO"
meta_title: "Local SEO - Maryland Insights"
description: "Dominate Maryland local search with Google Maps optimization and local citations."
image: "/images/features/3.png"
button:
  enable: true
  label: "Get Started"
  link: "/contact"
draft: false
---

## Dominate Maryland Local Search

Get your business found on Google Maps and local search results. We help Maryland businesses appear where customers are looking.

## Key Benefits

- **Google Maps Dominance** — Optimize your Google Business Profile
- **Local Citations** — Get listed in Maryland directories
- **Review Management** — Build your online reputation
- **Local Keywords** — Target what Maryland customers search

## How It Works

1. Optimize your Google Business Profile
2. Build local citations across Maryland
3. Generate and manage customer reviews
4. Monitor local ranking performance

## Why Choose Maryland Insights?

Local SEO requires Maryland-specific expertise. We know Maryland cities, directories, and search patterns.

> When Maryland customers search, your business should be on the map.
```

**Wix/Squarespace Justification:**
- Outcome-focused: "Dominate" not "Local SEO"
- Benefit-first presentation

---

### CHANGE 7: feature-4.md → Analytics & Reporting

**Target Content:**
```yaml
---
title: "Analytics & Reporting"
meta_title: "Analytics - Maryland Insights"
description: "Know your Maryland audience with detailed analytics and insights."
image: "/images/features/4.png"
button:
  enable: true
  label: "Get Started"
  link: "/contact"
draft: false
---

## Know Your Maryland Audience

Track who's visiting your website, where they come from, and what converts Maryland visitors into customers.

## Key Benefits

- **Traffic Analysis** — See where your visitors come from
- **Conversion Tracking** — Know what drives leads and sales
- **Maryland Insights** — Understand your local audience
- **Custom Reports** — Get the data that matters to your business

## How It Works

1. Install analytics tracking
2. We configure goals and conversions
3. Receive regular performance reports
4. Use insights to optimize your strategy

## Why Choose Maryland Insights?

We don't just give you data — we explain what it means for your Maryland business.

> Make informed decisions with data tailored to the Maryland market.
```

**Wix Justification:**
- "Know your audience" - outcome-focused
- Benefit-driven descriptions

---

### CHANGE 8: feature-5.md → Marketing Automation

**Target Content:**
```yaml
---
title: "Marketing Automation"
meta_title: "Marketing Automation - Maryland Insights"
description: "Automate your Maryland marketing with AI-powered campaigns."
image: "/images/features/5.png"
button:
  enable: true
  label: "Get Started"
  link: "/contact"
draft: false
---

## Automate Your Maryland Marketing

Set up automated campaigns that nurture leads while you focus on running your Maryland business.

## Key Benefits

- **Automated Campaigns** — Email sequences that work 24/7
- **Lead Nurturing** — Convert visitors to customers automatically
- **Maryland Targeting** — Reach the right audience at the right time
- **Easy Setup** — No technical expertise required

## How It Works

1. Define your customer journey
2. Set up automated triggers
3. Create email sequences
4. Watch leads convert on autopilot

## Why Choose Maryland Insights?

Our automation is built for Maryland small businesses. Simple, effective, and designed for the local market.

> Work smarter, not harder. Let automation grow your business.
```

**Wix Justification:**
- Wix: "No technical expertise required" - simplify technical
- "Work smarter, not harder" - outcome-focused

---

### CHANGE 9: feature-6.md → AI-Powered Content

**Target Content:**
```yaml
---
title: "AI-Powered Content"
meta_title: "AI Content - Maryland Insights"
description: "Generate compelling content for your Maryland business with AI."
image: "/images/features/6.png"
button:
  enable: true
  label: "Get Started"
  link: "/contact"
draft: false
---

## AI Content Made for Maryland Businesses

Generate blog posts, product descriptions, marketing copy, and more — tailored to your Maryland audience.

## Key Benefits

- **AI-Powered Generation** — Create content in seconds
- **Maryland Tailored** — Content optimized for local audiences
- **Unlimited Ideas** — Never run out of content ideas
- **Brand Voice** — Content that sounds like your business

## How It Works

1. Describe your content needs
2. AI generates multiple options
3. Edit and refine
4. Publish to your website

## Why Choose Maryland Insights?

Our AI understands Maryland businesses. Get content that resonates with your local audience.

> Quality content at scale. Powered by AI, tailored for Maryland.
```

**Wix Justification:**
- Wix: "AI-powered" as differentiator
- Benefit-driven: "Create content in seconds"

---

## COMPLETE FILE LIST

| # | File | Change | Wix/Squarespace Justification |
|---|------|--------|------------------------------|
| 1 | features-carousel.md | Remove ⚡️ emoji | Wix: clean titles; Squarespace: no decorative |
| 2 | features-carousel.md | Capitalize "websites" | Wix: professional presentation |
| 3 | testimonial.md | Remove 🔧 emoji | Wix clean titles |
| 4 | features/-index.md | Remove ⚙️ 🚀 emojis | Wix/Squarespace: clean titles |
| 5 | feature-1.md | Rewrite for Website Builder | Wix: "No coding required", benefit-driven |
| 6 | feature-2.md | Rewrite for SEO Optimization | Wix: benefit-driven copy |
| 7 | feature-3.md | Rewrite for Local SEO | Squarespace: outcome-focused |
| 8 | feature-4.md | Rewrite for Analytics | Wix: outcome-focused |
| 9 | feature-5.md | Rewrite for Marketing Automation | Wix: simplify technical |
| 10 | feature-6.md | Rewrite for AI Content | Wix: AI as differentiator |

---

## PRICING PAGE STATUS

**File: `src/content/sections/pricing.md`**

**Status:** ✓ ALREADY DONE

Current content already has:
- Starter: "Start for free. Perfect for Maryland businesses getting started online."
- Business: "Most Popular — Perfect for growing Maryland businesses ready to expand."
- Business Pro: "For Maryland businesses managing multiple locations or high-volume needs."
- Enterprise: "Custom solutions for large Maryland organizations with dedicated support."

**Wix/Squarespace Justification Applied:**
- "Start for free" - Wix EXACT phrase
- "Most Popular" - Squarespace tier designation
- Benefit-driven descriptions - Both platforms

---

## SUMMARY

### Files to Update: 9 files
### Emojis to Remove: 6 emojis
- ⚡️ (features-carousel)
- 🔧 (testimonial)
- ⚙️ (features/-index)
- 🚀 (features/-index)
- ⏱️ (feature pages - removed in rewrite)
- ⚙️ (feature pages - removed in rewrite)
- 📉 (feature pages - removed in rewrite)
- 📈 (feature pages - removed in rewrite)

### Feature Pages to Rewrite: 6 pages
Each with:
- Correct title matching service
- Benefit-driven copy
- "Get Started" button
- Maryland-specific content

### Pricing: Already complete ✓

---

## NEXT STEPS

1. User reviews this plan
2. If approved → implement all changes
3. If rejected → iterate

**Plan: Maryland Insights ALL Copy Updates**
**Justification: Wix + Squarespace enterprise branding**
**USP: Maryland businesses**
