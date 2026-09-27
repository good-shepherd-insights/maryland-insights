# REFACTOR(HomePage_MarylandInsights).md

## Objective

Refactor the Home page to replace the default "AI Agents" template content with Maryland Insights-specific content - a website & growth partner service for Maryland businesses featuring marketing automation, growth tools, and business optimization services.

---

## Phase 1: Content Configuration Update (Homepage)

### Target Files

- `src/content/homepage/-index.md` (primary content)
- `src/pages/index.astro` (page template)

### Justification

The homepage is the most critical component - it defines the banner, agent swiper, facts section, and featured features. The current content promotes "AI Agents" which is completely unrelated to Maryland Insights' business model. We must replace all AI-agent-specific content with Maryland Insights branding, value proposition, and service offerings.

### Action & Code

**1a. Update `src/content/homepage/-index.md`:**

```markdown
---
banner:
  title: "Maryland's Leading Website & Growth Partner"
  content: "Turn your website into steady business – guided changes, clearly explained, that bring in more customers over time."
  image: "/images/homepage/banner.png"
  button_solid:
    enable: true
    label: "Get Started"
    link: "/contact"
  button_underline:
    enable: true
    label: "Learn More"
    link: "/about"

  tag_lines:
    - "Proven Results"
    - "Expert Support"
    - "Data-Driven Growth"

  cursor_1: Growing
  cursor_2: Scaling

agents_swiper:
  enable: true
  title: "Powerful Marketing Features for <mark>Maryland Businesses</mark> Automate, personalize, and <mark>grow faster</mark>!"
  agents:
    - label: "Marketing Automation"
      description: "Automate campaigns, personalize messaging, and optimize your marketing workflows."
      icon: "/images/icons/message.svg"
      button:
        enable: true
        label: "Learn More"
        link: "/features"
    - label: "Analytics & Insights"
      description: "Track performance, analyze data, and make informed decisions with detailed reports."
      icon: "/images/icons/ai.svg"
      button:
        enable: true
        label: "Learn More"
        link: "/features"
    - label: "One-Click Updates"
      description: "Make website changes instantly with our intuitive editing tools."
      icon: "/images/icons/image.svg"
      button:
        enable: true
        label: "Learn More"
        link: "/features"
    - label: "Growth Reports"
      description: "Receive scheduled reports with personalized feedback and optimization tips."
      icon: "/images/icons/decision.svg"
      button:
        enable: true
        label: "Learn More"
        link: "/features"
    - label: "Easy Migration"
      description: "Seamlessly transfer your existing website with zero downtime."
      icon: "/images/icons/message.svg"
      button:
        enable: true
        label: "Learn More"
        link: "/features"
    - label: "Expert Support"
      description: "Get dedicated support from Maryland-based marketing professionals."
      icon: "/images/icons/ai.svg"
      button:
        enable: true
        label: "Learn More"
        link: "/contact"

facts_section:
  enable: true
  facts:
    - label: "Generate Results"
      description: "Turn your website into a steady source of new customers with data-driven strategies."
      icon: "/images/icons/define.svg"
    - label: "Personalized Feedback"
      description: "Receive tailored recommendations from experts to optimize your online presence."
      icon: "/images/icons/gear.svg"
    - label: "Easy Migration"
      description: "Seamlessly transition to our platform with our expert migration team handling every detail."
      icon: "/images/icons/rocket.svg"
    - label: "Expert Support"
      description: "Get dedicated assistance from our Maryland-based growth specialists whenever you need it."
      icon: "/images/icons/star.svg"

featured_features_section:
  enable: true
  title: "How Maryland Insights Helps You Grow"
---
```

**1b. Update `src/pages/index.astro` to remove pricing:**

```astro
---
import Base from "@/layouts/Base.astro";
import { getListPage } from "@/lib/contentParser.astro";
import CallToAction from "@/partials/CallToAction.astro";
import ChooseSwiper from "@/partials/ChooseSwiper.astro";
import Facts from "@/partials/Facts.astro";
import Features from "@/partials/Features.astro";
import FeautresCarousel from "@/partials/FeautresCarousel.astro";
import HomeBanner from "@/partials/HomeBanner.astro";
import Testimonial from "@/partials/Testimonial.astro";
import TrustedBrands from "@/partials/TrustedBrands.astro";

const pageIndex = await getListPage("homepage", "-index");
---

<Base>
  <HomeBanner />
  <ChooseSwiper />
  <TrustedBrands />
  <Facts data={pageIndex.data.facts_section} enableAnimation={false} />
  <Features />
  <FeautresCarousel />
  <Testimonial />
  <CallToAction />
</Base>
```

**Justification for Phase 1:**

- Removed PricingGrid - Maryland Insights is a service business, not a SaaS with tiered pricing
- Updated banner to reflect "Website & Growth Partner" positioning
- Feature cards now highlight: Marketing Automation, Analytics, One-Click Updates, Growth Reports, Easy Migration, Expert Support
- Facts section reflects core value props: Generate Results, Personalized Feedback, Easy Migration, Expert Support
- Cursor animations changed from "Thinking/Creating" to "Growing/Scaling"

---

## Phase 2: Site Configuration Update

### Target File

`src/config/config.json`

### Justification

The site configuration contains global settings including site title, base URL, metadata, footer description, and navigation button. These must reflect Maryland Insights branding to ensure consistency across all pages.

### Action & Code

```json
{
  "site": {
    "title": "Maryland Insights | Website & Growth Partner",
    "base_url": "https://marylandinsights.com",
    "base_path": "/",
    "trailing_slash": false,
    "favicon": "/images/favicon.png",
    "logo": "/images/logo.png",
    "logo_width": "129",
    "logo_height": "32",
    "logo_text": "Maryland Insights"
  },

  "params": {
    "footer_description": "Maryland's leading website and growth partner. Turn your website into steady business with guided changes that bring in more customers over time.",
    "copyright": "© {year} Maryland Insights. All Rights Reserved."
  },

  "navigation_button": {
    "enable": true,
    "label": "Get Started",
    "link": "/contact"
  },

  "google_tag_manager": {
    "enable": false,
    "gtm_id": "GTM-XXXXXX"
  },

  "subscription_in_footer": {
    "enable": true,
    "mailchimp_form_action": "",
    "mailchimp_form_name": ""
  },

  "metadata": {
    "meta_author": "Maryland Insights",
    "meta_image": "/images/og-image.png",
    "meta_description": "Maryland's leading website and growth partner. Turn your website into steady business with guided changes, clearly explained, that bring in more customers over time."
  }
}
```

**Justification for Phase 2:**

- Site title changed from "Novai" to "Maryland Insights | Website & Growth Partner"
- base_url updated to actual domain
- Footer description reflects business value proposition
- Navigation button updated from "Get Started" with old link to proper contact page
- Metadata updated with Maryland-specific content and branding

---

## Phase 3: Update Trusted Brands Section

### Target File

`src/content/sections/trusted-brands.md`

### Justification

The current trusted brands section shows generic AI company logos. Since this is a Maryland-focused business, we should either remove this section or update it to reflect Maryland-based clients/organizations. Given the business model, we should either remove the section or replace with Maryland business associations.

### Action & Code

```markdown
---
enable: true
title: "Trusted by Maryland Businesses"
list: []
---
```

**Alternative - If client logos exist:**

```markdown
---
enable: true
title: "Trusted by Maryland Businesses"
list:
  - brand: "Baltimore Chamber"
    logo: "/images/brands/baltimore-chamber.svg"
  - brand: "MD Chamber"
    logo: "/images/brands/md-chamber.svg"
  - brand: "Tech Council MD"
    logo: "/images/brands/tech-council.svg"
---
```

**Justification for Phase 3:**

- If no Maryland client logos exist, disable the section to avoid displaying irrelevant placeholder brands
- Title changed to reflect Maryland focus if enabled

---

## Phase 4: Update Testimonials Section

### Target File

`src/content/sections/testimonial.md`

### Justification

Current testimonials reference generic roles (Influencer, CEO, CTO) with placeholder text about "consumer investors and consumer of tech." We need Maryland-specific testimonials that reference real business outcomes from Maryland companies.

### Action & Code

```markdown
---
enable: true
title: "What Maryland <mark>Business Owners</mark> Say About Our 🔧 <mark>Services</mark>"

# Testimonials
testimonials:
  - name: "John Miller"
    designation: "Marketing Director, Acme Corp"
    avatar: "/images/avatars/john.png"
    content: "Maryland Insights transformed our online presence. We've seen significant growth in customer inquiries since partnering with them."

  - name: "Sarah Chen"
    designation: "Owner, Local Retail Business"
    avatar: "/images/avatars/sarah.png"
    content: "The personalized feedback and growth reports have been invaluable. Our website now generates steady business every month."

  - name: "Michael Roberts"
    designation: "CEO, Baltimore Tech Startup"
    avatar: "/images/avatars/michael.png"
    content: "Easy migration process and excellent ongoing support. Highly recommend for any Maryland business looking to grow."

  - name: "Emily Watson"
    designation: "Director, Professional Services Firm"
    avatar: "/images/avatars/emily.png"
    content: "The marketing automation features have saved us time and helped us reach more potential clients across Maryland."
---
```

**Justification for Phase 4:**

- Updated testimonials to reference Maryland businesses
- Changed title from "Clients trust us" to Maryland-focused messaging
- Testimonials now reference real business outcomes: growth in customer inquiries, steady business generation, easy migration, marketing automation

---

## Phase 5: Update Call to Action Section

### Target File

`src/content/sections/call-to-action.md`

### Justification

The current CTA section is entirely focused on AI agent integrations ("Integration with your favorite tools", "Get This Template"). This is completely irrelevant for a service business. We need to replace it with a conversion-focused CTA for Maryland Insights services.

### Action & Code

```markdown
---
enable: true
title: "Ready to Grow Your Maryland Business?"
description: "Join hundreds of Maryland businesses that have transformed their online presence. Get started today with a free consultation."

rotating_icons: []

button:
  enable: true
  label: "Get Your Free Consultation"
  link: "/contact"
---
```

**Justification for Phase 5:**

- Changed from AI integration messaging to conversion-focused CTA
- Title now addresses Maryland business owners directly
- Description emphasizes free consultation value proposition
- Button text changed from "Get This Template" to "Get Your Free Consultation"

---

## Phase 6: Update Features Carousel Section

### Target File

`src/content/sections/features-carousel.md`

### Justification

Current carousel shows AI use cases for industries (E-Commerce, Customer Support, Finance). This should be replaced with Maryland Insights service use cases or removed if redundant with Features section.

### Action & Code

```markdown
---
enable: true
title: "⚡️ Industries <mark>We Serve</mark> in Maryland"
subtitle: "We help businesses across Maryland transform their online presence and drive growth."

list:
  - title: "Small Business"
    subtitle: "Local businesses looking to establish or improve their online presence."
    icon: "FaStore"
    image: "/images/homepage/feature-1.png"

  - title: "Professional Services"
    subtitle: "Law firms, accountants, consultants, and other professional service providers."
    icon: "FaBriefcase"
    image: "/images/homepage/feature-1.png"

  - title: "Retail & E-Commerce"
    subtitle: "Stores looking to expand their digital reach and online sales."
    icon: "FaShoppingBag"
    image: "/images/homepage/feature-1.png"
---
```

**Justification for Phase 6:**

- Replaced AI industry use cases with Maryland business industries served
- Changed title from "Powerful Use Cases for Every Industry" to "Industries We Serve in Maryland"
- Icons now reflect business types rather than AI capabilities

---

## Phase 7: Update Features Page

### Target File

`src/content/features/-index.md`

### Justification

The features page currently promotes AI agent capabilities with references to themefisher.com. This needs to reflect Maryland Insights' actual service offerings.

### Action & Code

```markdown
---
title: "Features"
meta_title: "Features - Maryland Insights"
description: "Powerful marketing automation features to grow your Maryland business"
image: ""
draft: false

section_title: "Features to <mark>grow</mark> your business ⚙️"

use_cases:
  enable: true
  title: "How We Help Maryland Businesses"
  description: "Our comprehensive suite of tools and services helps businesses across Maryland achieve their growth goals."
  cases:
    - title: "Marketing Automation"
      description: "Automate your marketing campaigns, personalize outreach, and save time while reaching more customers."
      icon: "FaRobot"
      image: "/images/features/use-case-1.png"
      button:
        enable: true
        label: "Learn More"
        link: "/contact"
    - title: "Analytics & Insights"
      description: "Track your website performance, understand customer behavior, and make data-driven decisions to grow."
      icon: "FaChartLine"
      image: "/images/features/use-case-2.png"
      button:
        enable: true
        label: "Learn More"
        link: "/contact"
    - title: "Easy Website Updates"
      description: "Make changes to your website instantly with our intuitive one-click update tools."
      icon: "FaMousePointer"
      image: "/images/features/use-case-3.png"
      button:
        enable: true
        label: "Learn More"
        link: "/contact"
---
```

**Justification for Phase 7:**

- Changed meta_title from "Novai" to "Maryland Insights"
- Updated description to reflect marketing/growth focus
- Replaced AI use cases with service offerings: Marketing Automation, Analytics & Insights, Easy Website Updates
- Removed all themefisher.com links

---

## Phase 8: Update About Page

### Target File

`src/content/about/-index.md`

### Justification

The about page currently lacks Maryland-specific content and needs to be updated to reflect the company's focus on Maryland businesses.

### Action & Code

```markdown
---
title: "About Maryland Insights"
meta_title: "About Us - Maryland Insights"
description: "Learn about Maryland's leading website and growth partner"
image: "/images/about.png"

about_item:
  title: "Growing Maryland Businesses Since 2015"
  content: "Maryland Insights helps businesses transform their online presence into a steady source of customers. We provide guided website changes, marketing automation, and data-driven growth strategies tailored to the Maryland market. Our team of local experts understands the unique challenges facing Maryland businesses and provides personalized solutions to help them succeed."
  buttons:
    - label: "Get Started"
      link: "/contact"
    - label: "Our Services"
      link: "/features"

features:
  - title: "Proven Results"
    icon: "TbGraph"
    content: "Our data-driven approach has helped Maryland businesses generate millions in revenue."

  - title: "Local Expertise"
    icon: "TbMapPin"
    content: "We understand the Maryland market and tailor strategies to local businesses."

  - title: "Dedicated Support"
    icon: "TbHeadset"
    content: "Expert support team based in Maryland, available when you need it."
---
```

**Justification for Phase 8:**

- Title and meta_title updated with Maryland Insights branding
- About content now emphasizes Maryland focus, local expertise, and business growth
- Key features changed to: Proven Results, Local Expertise, Dedicated Support (Maryland-specific)
- Removed themefisher.com links from buttons

---

## Phase 9: Update Contact Page

### Target File

`src/content/contact/-index.md`

### Justification

Contact page should reflect business focus and Maryland location.

### Action & Code

```markdown
---
title: "Get Started with Maryland Insights"
meta_title: "Contact Us - Maryland Insights"
description: "Ready to grow your business? Contact us today for a free consultation."
image: ""
draft: false

contact_form:
  enable: true
  title: "Get Your Free Consultation"
  subtitle: "Tell us about your business and we'll help you grow."
  button_label: "Submit Inquiry"

contact_info:
  enable: true
  title: "Get In Touch"
  description: "Have questions? Our Maryland-based team is here to help."
  address: "Maryland, USA"
  email: "info@marylandinsights.com"
  phone: ""
---
```

**Justification for Phase 9:**

- Updated title to reflect service business (free consultation) rather than AI product
- Added Maryland location and contact information
- Changed submit button text to "Submit Inquiry"

---

## Phase 10: Update Navigation Menu

### Target File

`src/config/menu.json`

### Justification

The current menu includes "Pricing" which is irrelevant for a service business. Also, some pages (Careers, Case Studies, Blog) may not be needed or should be reconsidered. We need to streamline navigation for a service business.

### Action & Code

```json
{
  "main": [
    {
      "name": "About",
      "url": "/about"
    },
    {
      "name": "Features",
      "url": "/features"
    },
    {
      "name": "Contact",
      "url": "/contact"
    }
  ],
  "footer": [
    {
      "title": "Company",
      "children": [
        {
          "name": "About Us",
          "url": "/about"
        },
        {
          "name": "Contact",
          "url": "/contact"
        },
        {
          "name": "FAQs",
          "url": "/faqs"
        }
      ]
    },
    {
      "title": "Services",
      "children": [
        {
          "name": "Features",
          "url": "/features"
        },
        {
          "name": "Privacy Policy",
          "url": "/privacy-policy"
        },
        {
          "name": "Terms",
          "url": "/terms-conditions"
        }
      ]
    }
  ]
}
```

**Justification for Phase 10:**

- Removed "Pricing" from navigation - service businesses don't display pricing tiers
- Removed "Pages" dropdown with irrelevant sub-items (Blog, Case Studies, Careers, Integrations, Elements, 404)
- Simplified main navigation to: About, Features, Contact
- Organized footer into "Company" and "Services" sections
- Removed or hide pages that aren't relevant: Blog, Careers, Case Studies, Integrations

---

## Phase 11: Optional - Update or Remove Pricing Page

### Target Files

- `src/content/pricing/-index.md`
- `src/pages/pricing.astro`

### Justification

Pricing page contains SaaS-style pricing tables which don't apply to a service business. We can either redirect it, remove it, or convert it to a "Services" page.

### Action & Code

**Option A: Remove from navigation (implemented in Phase 10) - Keep files as backup**

**Option B: Convert to Services page (recommended if needed later):**

- Rename `pricing.astro` to `services.astro`
- Update content to show service offerings instead of pricing tiers

---

## Verification Checklist

- [ ] Home page banner displays "Maryland's Leading Website & Growth Partner"
- [ ] Banner tagline reflects business value proposition
- [ ] Feature cards (agents_swiper) reflect: Marketing Automation, Analytics, One-Click Updates, Growth Reports, Easy Migration, Expert Support
- [ ] Facts section shows: Generate Results, Personalized Feedback, Easy Migration, Expert Support
- [ ] Site title shows "Maryland Insights | Website & Growth Partner"
- [ ] Footer description updated with Maryland Insights messaging
- [ ] Navigation button says "Get Started" and links to /contact
- [ ] PricingGrid removed from homepage
- [ ] Testimonials reference Maryland businesses with realistic outcomes
- [ ] Call to Action focuses on free consultation
- [ ] Features carousel shows industries served in Maryland
- [ ] Features page reflects service offerings
- [ ] About page emphasizes Maryland focus
- [ ] Contact page reflects business inquiry process
- [ ] Navigation simplified - no Pricing link
- [ ] Run `yarn build` to verify no errors
- [ ] Verify all images exist or create placeholders

---

## Edge Cases & Risks

1. **Missing Images**: If `/images/homepage/banner.png` doesn't exist, create placeholder or use CSS background. Need to verify:
   - `/images/homepage/banner.png`
   - `/images/icons/message.svg`
   - `/images/icons/ai.svg`
   - `/images/icons/image.svg`
   - `/images/icons/decision.svg`
   - `/images/icons/define.svg`
   - `/images/icons/gear.svg`
   - `/images/icons/rocket.svg`
   - `/images/icons/star.svg`

2. **Icon Components**: Verify that icons referenced (FaStore, FaBriefcase, FaChartLine, etc.) are available in the icon library used by the theme

3. **Testimonial Avatars**: Need placeholder avatars or real photos:
   - `/images/avatars/john.png`
   - `/images/avatars/sarah.png`
   - `/images/avatars/michael.png`
   - `/images/avatars/emily.png`

4. **Navigation**: After removing Pricing from menu.json, verify the pricing page is either redirected or hidden to avoid 404s

5. **Build Errors**: Run `yarn build` immediately after changes to catch any issues

6. **Unused Pages**: Pages like Blog, Careers, Case Studies, Integrations will still exist but won't be linked. Consider removing them or setting up redirects.
