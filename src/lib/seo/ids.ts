// Single canonical URL constructor — every SEO surface (meta canonical, og:url,
// JSON-LD @id/url fields) must route through this so they can never diverge.
// BASE_URL comes from Sanity siteSettings.seoUrl (passed by callers), never config.

export function canonicalUrl(baseUrl: string, pathname: string): string {
  return new URL(pathname, baseUrl).toString();
}

export const websiteId = (baseUrl: string) => `${baseUrl}/#website`;
export const organizationId = (baseUrl: string) => `${baseUrl}/#organization`;
export const navigationId = (baseUrl: string) => `${baseUrl}/#navigation`;
export const webpageId = (baseUrl: string, pathname: string) => `${canonicalUrl(baseUrl, pathname)}#webpage`;
export const breadcrumbId = (baseUrl: string, pathname: string) => `${canonicalUrl(baseUrl, pathname)}#breadcrumb`;
