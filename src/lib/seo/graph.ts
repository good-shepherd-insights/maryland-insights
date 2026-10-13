import type { WebSite, LocalBusiness, BreadcrumbList, WebPage, ItemList } from "schema-dts";
import { plainify } from "@/lib/utils/textConverter";
import {
  canonicalUrl,
  websiteId,
  organizationId,
  navigationId,
  webpageId,
  breadcrumbId,
} from "./ids";

// Site settings shape (from Sanity siteSettings via getSiteSettings()).
// Callers (Base.astro) fetch once and pass through — no config imports here.
export interface SiteInfo {
  siteTitle?: string;
  logo?: string;
  logoText?: string;
  seoUrl?: string;
  seoDescription?: string;
  searchUrl?: string;
  metaImage?: string;
  socialLinks?: Array<{ platform?: string; url?: string }>;
  navLinks?: Array<{ label?: string; href?: string }>;
  business?: {
    streetAddress?: string;
    addressLocality?: string;
    addressRegion?: string;
    postalCode?: string;
    addressCountry?: string;
    latitude?: number;
    longitude?: number;
    telephone?: string;
    areaServed?: string;
    breadcrumbHomeLabel?: string;
    navigationListName?: string;
  };
}

export function buildWebSite(site: SiteInfo): WebSite {
  const baseUrl = site.seoUrl ?? "";
  return {
    "@type": "WebSite",
    "@id": websiteId(baseUrl),
    name: site.logoText || site.siteTitle,
    url: baseUrl,
    ...(site.searchUrl
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${baseUrl}${site.searchUrl}`,
            },
            "query-input": "required name=search_term_string",
          } as any,
        }
      : {}),
  };
}

export function buildOrganization(site: SiteInfo): LocalBusiness {
  const baseUrl = site.seoUrl ?? "";
  const b = site.business ?? {};
  const sameAsLinks: string[] = (site.socialLinks ?? []).map((s) => s.url).filter(Boolean) as string[];
  return {
    "@type": "LocalBusiness",
    "@id": organizationId(baseUrl),
    name: site.logoText || site.siteTitle,
    url: baseUrl,
    logo: `${baseUrl}${site.logo ?? ""}`,
    ...(site.metaImage ? { image: `${baseUrl}${site.metaImage}` } : {}),
    description: site.seoDescription,
    address: {
      "@type": "PostalAddress",
      streetAddress: b.streetAddress,
      addressLocality: b.addressLocality,
      addressRegion: b.addressRegion,
      postalCode: b.postalCode,
      addressCountry: b.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: b.latitude,
      longitude: b.longitude,
    },
    telephone: b.telephone,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: b.telephone,
      contactType: "customer service",
      areaServed: b.areaServed,
    },
    ...(sameAsLinks.length > 0 ? { sameAs: sameAsLinks } : {}),
  };
}

export function buildBreadcrumbList(site: SiteInfo, pathname: string): BreadcrumbList {
  const baseUrl = site.seoUrl ?? "";
  const pathArr = pathname.split("/").filter(Boolean);
  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId(baseUrl, pathname),
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: site.business?.breadcrumbHomeLabel ?? "Home",
        item: baseUrl,
      },
      ...pathArr.map((segment, index) => ({
        "@type": "ListItem" as const,
        position: index + 2,
        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        item: canonicalUrl(baseUrl, `/${pathArr.slice(0, index + 1).join("/")}`),
      })),
    ],
  };
}

export interface WebPageInput {
  pathname: string;
  name: string;
  description: string;
  canonical?: string;
  image?: string;
  locale?: string;
}

export function buildWebPage(site: SiteInfo, input: WebPageInput): WebPage {
  const baseUrl = site.seoUrl ?? "";
  const { pathname, name, description, canonical, image, locale } = input;
  return {
    "@type": "WebPage",
    "@id": webpageId(baseUrl, pathname),
    url: canonical || canonicalUrl(baseUrl, pathname),
    name: plainify(name),
    description: plainify(description),
    isPartOf: { "@id": websiteId(baseUrl) },
    breadcrumb: { "@id": breadcrumbId(baseUrl, pathname) },
    ...(image
      ? {
          primaryImageOfPage: {
            "@type": "ImageObject",
            url: image,
          } as any,
        }
      : {}),
    ...(locale ? { inLanguage: locale } : {}),
  };
}

export function buildNavigation(site: SiteInfo): ItemList {
  const baseUrl = site.seoUrl ?? "";
  return {
    "@type": "ItemList",
    "@id": navigationId(baseUrl),
    name: site.business?.navigationListName ?? "Main Menu",
    itemListElement: (site.navLinks ?? []).map((item, index) => ({
      "@type": "SiteNavigationElement" as const,
      position: index + 1,
      name: item.label,
      url: `${baseUrl}${item.href !== "/" ? item.href : ""}`,
    })),
  };
}
