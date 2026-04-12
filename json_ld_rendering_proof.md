# JSON-LD Rendering Proof

## `404.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/404#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "404",
          "item": "https://marylandinsights.com/404"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    }
  ]
}
```

## `about/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/about#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "About",
          "item": "https://marylandinsights.com/about"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "AboutPage",
      "mainEntity": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `blog/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/blog#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://marylandinsights.com/blog"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "Blog",
      "name": "Blog\n",
      "description": "Discover tips, updates, and insights on better task management and teamwork.\n",
      "url": "https://marylandinsights.com/blog",
      "blogPost": [
        {
          "@type": "BlogPosting",
          "headline": "Why AI Platforms Aren&apos;t Sending Traffic to Your Maryland Business Yet\n",
          "url": "https://marylandinsights.com/blog/why-ai-platforms-arent-sending-traffic-to-your-maryland-business-yet",
          "datePublished": "2026-04-08T00:00:00.000Z",
          "author": {
            "@type": "Person",
            "name": "Maryland Insights\n"
          }
        }
      ]
    }
  ]
}
```

## `blog/why-ai-platforms-arent-sending-traffic-to-your-maryland-business-yet/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/blog/why-ai-platforms-arent-sending-traffic-to-your-maryland-business-yet#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Blog",
          "item": "https://marylandinsights.com/blog"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Why ai platforms arent sending traffic to your maryland business yet",
          "item": "https://marylandinsights.com/blog/why-ai-platforms-arent-sending-traffic-to-your-maryland-business-yet"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "BlogPosting",
      "@id": "https://marylandinsights.com/blog/why-ai-platforms-arent-sending-traffic-to-your-maryland-business-yet#blogposting",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://marylandinsights.com/blog/why-ai-platforms-arent-sending-traffic-to-your-maryland-business-yet"
      },
      "headline": "Why AI Platforms Aren&apos;t Sending Traffic to Your Maryland Business Yet\n",
      "description": "I checked my analytics last week and saw something that should worry every Maryland small business owner: zero traffic from ChatGPT or Perplexity. Not a single visitor.\n",
      "image": "https://marylandinsights.com/images/blog/small-businesses-not-getting-ai-traffic.webp",
      "datePublished": "2026-04-08T00:00:00.000Z",
      "dateModified": "2026-04-08T00:00:00.000Z",
      "author": {
        "@type": "Person",
        "name": "Maryland Insights\n",
        "url": "https://marylandinsights.com/about"
      },
      "publisher": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `contact/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/contact#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Contact",
          "item": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "ContactPage",
      "mainEntity": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `faqs/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/faqs#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Faqs",
          "item": "https://marylandinsights.com/faqs"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is Maryland Insights built specifically for local businesses?\n",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Unlike global platforms, we focus exclusively on the Maryland market. Our tools, SEO strategies, and AI models are optimized to help you connect with Maryland customers and dominate local search results in your community.\n"
          }
        },
        {
          "@type": "Question",
          "name": "Do I need design or coding skills to build my website?\n",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Not at all. Our AI-powered builder is designed for entrepreneurs, not developers. Simply describe your business, and our system will generate a professional, high-converting site tailored to your Maryland audience in minutes.\n"
          }
        },
        {
          "@type": "Question",
          "name": "Will my website look professional to Maryland customers?\n",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Absolutely. Your Maryland customers are searching — and our platform ensures your business is the answer they find. Every site built on our platform uses world-class design standards and high-quality templates that ensure your Maryland Business looks established, credible, and premium from day one.\n"
          }
        },
        {
          "@type": "Question",
          "name": "How does the AI builder help me rank in Maryland search results?\n",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Our AI doesn&apos;t just write copy; it performs Local SEO optimization. It automatically structures your site for Google Maps, generates location-based keywords, and ensures your Maryland Business is visible to the people searching for your services nearby.\n"
          }
        },
        {
          "@type": "Question",
          "name": "Can I use my own custom domain?\n",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. You can easily connect an existing domain or register a new one directly through our platform. A professional domain is the first step in making your Maryland business stand out and building long-term brand equity.\n"
          }
        },
        {
          "@type": "Question",
          "name": "Is there really a &apos;Free Forever&apos; plan?\n",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. We believe every Maryland entrepreneur deserves a professional online presence. Our Starter plan is $0 and free forever, allowing you to build your site and launch your brand without any upfront costs or credit card requirements.\n"
          }
        },
        {
          "@type": "Question",
          "name": "What kind of support can I expect from your team?\n",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "You get access to our dedicated Maryland-based support team. Whether you need help with technical setup, SEO strategy, or scaling your site, we provide 24/7 care and personalized insights to ensure your business continues to grow.\n"
          }
        }
      ]
    }
  ]
}
```

## `features/aeo-optimization/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/features/aeo-optimization#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Features",
          "item": "https://marylandinsights.com/features"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Aeo optimization",
          "item": "https://marylandinsights.com/features/aeo-optimization"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "SoftwareApplication",
      "name": "AEO Optimization\n",
      "description": "Answer Engine Optimization to get found by Maryland customers searching for local services.\n",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": 0,
        "priceCurrency": "USD"
      },
      "image": "https://marylandinsights.com/images/features/2.png",
      "publisher": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `features/ai-powered-content/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/features/ai-powered-content#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Features",
          "item": "https://marylandinsights.com/features"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Ai powered content",
          "item": "https://marylandinsights.com/features/ai-powered-content"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "SoftwareApplication",
      "name": "AI-Powered Content\n",
      "description": "Generate compelling content that resonates with your Maryland audience in seconds.\n",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": 0,
        "priceCurrency": "USD"
      },
      "image": "https://marylandinsights.com/images/features/6.png",
      "publisher": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `features/analytics-reporting/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/features/analytics-reporting#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Features",
          "item": "https://marylandinsights.com/features"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Analytics reporting",
          "item": "https://marylandinsights.com/features/analytics-reporting"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "SoftwareApplication",
      "name": "Analytics and Reporting\n",
      "description": "Track Maryland visitors and understand what drives growth in your local market.\n",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": 0,
        "priceCurrency": "USD"
      },
      "image": "https://marylandinsights.com/images/features/4.png",
      "publisher": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `features/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/features#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Features",
          "item": "https://marylandinsights.com/features"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "CollectionPage",
      "name": "Features",
      "description": "Discover the AI-powered website and SEO features that help Maryland small businesses grow steadily online.",
      "url": "https://marylandinsights.com/features",
      "publisher": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `features/local-seo/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/features/local-seo#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Features",
          "item": "https://marylandinsights.com/features"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Local seo",
          "item": "https://marylandinsights.com/features/local-seo"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "SoftwareApplication",
      "name": "Local SEO\n",
      "description": "Dominate local search and appear on Google Maps for your Maryland community.\n",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": 0,
        "priceCurrency": "USD"
      },
      "image": "https://marylandinsights.com/images/features/3.png",
      "publisher": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `features/marketing-automation/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/features/marketing-automation#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Features",
          "item": "https://marylandinsights.com/features"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Marketing automation",
          "item": "https://marylandinsights.com/features/marketing-automation"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "SoftwareApplication",
      "name": "Marketing Automation\n",
      "description": "Automate marketing campaigns that convert Maryland customers into loyal buyers.\n",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": 0,
        "priceCurrency": "USD"
      },
      "image": "https://marylandinsights.com/images/features/5.png",
      "publisher": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `features/website-builder/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/features/website-builder#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Features",
          "item": "https://marylandinsights.com/features"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": "Website builder",
          "item": "https://marylandinsights.com/features/website-builder"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "SoftwareApplication",
      "name": "Website Builder\n",
      "description": "Create a website built specifically for Maryland businesses in minutes. No coding needed.\n",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": 0,
        "priceCurrency": "USD"
      },
      "image": "https://marylandinsights.com/images/features/1.png",
      "publisher": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    }
  ]
}
```

## `integrations/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/integrations#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Integrations",
          "item": "https://marylandinsights.com/integrations"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "CollectionPage",
      "name": "Integrations",
      "description": "Integrate our AI assistant with the tools you already use — from Slack to Salesforce",
      "url": "https://marylandinsights.com/integrations",
      "publisher": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `pricing/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/pricing#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Pricing",
          "item": "https://marylandinsights.com/pricing"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "Product",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free Plans",
      "description": "Choose the plan that fits your goals — getting started or scaling fast. All plans come with full feature access.",
      "offers": {
        "@type": "AggregateOffer",
        "priceCurrency": "USD",
        "lowPrice": 0,
        "highPrice": 99
      },
      "category": "SoftwareApplication"
    }
  ]
}
```

## `privacy-policy/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/privacy-policy#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Privacy policy",
          "item": "https://marylandinsights.com/privacy-policy"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "Article",
      "headline": "Privacy\n",
      "description": "We may update or modify these Terms at any time, and continued use of our Service after changes.\n",
      "publisher": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```

## `search/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/search#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Search",
          "item": "https://marylandinsights.com/search"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "SearchResultsPage",
      "name": "Search Results",
      "description": "Search results for your Maryland business needs."
    }
  ]
}
```

## `terms-conditions/index.html`

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://marylandinsights.com/#organization",
      "name": "Maryland Insights — Build Your Maryland Business Website | Free",
      "url": "https://marylandinsights.com",
      "logo": "https://marylandinsights.com/images/logo.png",
      "image": "https://marylandinsights.com/images/og-image.png",
      "description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free.",
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
        "latitude": 38.98,
        "longitude": -76.85
      },
      "telephone": "+1-240-441-5259",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+1-240-441-5259",
        "contactType": "customer service",
        "areaServed": "Maryland"
      }
    },
    {
      "@type": "BreadcrumbList",
      "@id": "https://marylandinsights.com/terms-conditions#breadcrumb",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": "https://marylandinsights.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Terms conditions",
          "item": "https://marylandinsights.com/terms-conditions"
        }
      ]
    },
    {
      "@type": "ItemList",
      "@id": "https://marylandinsights.com/#navigation",
      "name": "Main Menu",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Home",
          "url": "https://marylandinsights.com"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Features",
          "url": "https://marylandinsights.com/features"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Pricing",
          "url": "https://marylandinsights.com/pricing"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "About",
          "url": "https://marylandinsights.com/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "FAQs",
          "url": "https://marylandinsights.com/faqs"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 6,
          "name": "Blog",
          "url": "https://marylandinsights.com/blog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 7,
          "name": "Contact",
          "url": "https://marylandinsights.com/contact"
        }
      ]
    },
    {
      "@type": "Article",
      "headline": "Terms and Conditions\n",
      "description": "We may update or modify these Terms at any time, and continued use of our Service after changes.\n",
      "publisher": {
        "@id": "https://marylandinsights.com/#organization"
      }
    }
  ]
}
```


