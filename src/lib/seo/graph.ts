import type { WebSite, LocalBusiness, BreadcrumbList, WebPage, ItemList } from "schema-dts";
import config from "@/config/config.json";
import menu from "@/config/menu.json";
import social from "@/config/social.json";
import { plainify } from "@/lib/utils/textConverter";
import {
  canonicalUrl,
  websiteId,
  organizationId,
  navigationId,
  webpageId,
  breadcrumbId,
} from "./ids";

const sameAsLinks: string[] = social.main?.map((s: { link: string }) => s.link).filter(Boolean) || [];

export function buildWebSite(): WebSite {
  return {
    "@type": "WebSite",
    "@id": websiteId(),
    name: config.site.logo_text || config.site.title,
    url: config.site.base_url,
    ...(config.metadata.search_url
      ? {
          potentialAction: {
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${config.site.base_url}${config.metadata.search_url}`,
            },
            "query-input": "required name=search_term_string",
          } as any,
        }
      : {}),
  };
}

export function buildOrganization(): LocalBusiness {
  return {
    "@type": "LocalBusiness",
    "@id": organizationId(),
    name: config.site.logo_text || config.site.title,
    url: config.site.base_url,
    logo: `${config.site.base_url}${config.site.logo}`,
    ...(config.metadata.meta_image ? { image: `${config.site.base_url}${config.metadata.meta_image}` } : {}),
    description: config.metadata.meta_description,
    address: {
      "@type": "PostalAddress",
      streetAddress: config.business.street_address,
      addressLocality: config.business.address_locality,
      addressRegion: config.business.address_region,
      postalCode: config.business.postal_code,
      addressCountry: config.business.address_country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: config.business.latitude,
      longitude: config.business.longitude,
    },
    telephone: config.business.telephone,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: config.business.telephone,
      contactType: "customer service",
      areaServed: config.business.area_served,
    },
    ...(sameAsLinks.length > 0 ? { sameAs: sameAsLinks } : {}),
  };
}

export function buildBreadcrumbList(pathname: string): BreadcrumbList {
  const pathArr = pathname.split("/").filter(Boolean);
  return {
    "@type": "BreadcrumbList",
    "@id": breadcrumbId(pathname),
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: config.business.breadcrumb_home_label,
        item: config.site.base_url,
      },
      ...pathArr.map((segment, index) => ({
        "@type": "ListItem" as const,
        position: index + 2,
        name: segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " "),
        item: canonicalUrl(`/${pathArr.slice(0, index + 1).join("/")}`),
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

export function buildWebPage(input: WebPageInput): WebPage {
  const { pathname, name, description, canonical, image, locale } = input;
  return {
    "@type": "WebPage",
    "@id": webpageId(pathname),
    url: canonical || canonicalUrl(pathname),
    name: plainify(name),
    description: plainify(description),
    isPartOf: { "@id": websiteId() },
    breadcrumb: { "@id": breadcrumbId(pathname) },
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

export function buildNavigation(): ItemList {
  return {
    "@type": "ItemList",
    "@id": navigationId(),
    name: config.business.navigation_list_name,
    itemListElement: menu.main.map((item, index) => ({
      "@type": "SiteNavigationElement" as const,
      position: index + 1,
      name: item.name,
      url: `${config.site.base_url}${item.url !== "/" ? item.url : ""}`,
    })),
  };
}
