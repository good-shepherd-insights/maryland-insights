import config from "@/config/config.json";

const BASE_URL = config.site.base_url;

// Single canonical URL constructor — every SEO surface (meta canonical, og:url,
// JSON-LD @id/url fields) must route through this so they can never diverge.
export function canonicalUrl(pathname: string): string {
  return new URL(pathname, BASE_URL).toString();
}

export const websiteId = () => `${BASE_URL}/#website`;
export const organizationId = () => `${BASE_URL}/#organization`;
export const navigationId = () => `${BASE_URL}/#navigation`;
export const webpageId = (pathname: string) => `${canonicalUrl(pathname)}#webpage`;
export const breadcrumbId = (pathname: string) => `${canonicalUrl(pathname)}#breadcrumb`;
