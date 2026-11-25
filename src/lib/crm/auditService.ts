/** Services the audit request is allowed to send. */
export enum AuditService {
  LocalSeo = "local-seo",
  AeoOptimization = "aeo-optimization",
  MarketingAutomation = "marketing-automation",
  GeoOptimization = "geo-optimization",
}

const serviceBySlug: Record<string, AuditService> = {
  "local-seo": AuditService.LocalSeo,
  "aeo-optimization": AuditService.AeoOptimization,
  "marketing-automation": AuditService.MarketingAutomation,
  "geo-optimization": AuditService.GeoOptimization,
};

/** Map a page service slug onto the audit service enum. Unknown slugs are rejected. */
export function auditServiceFromSlug(slug: string): AuditService | undefined {
  return Object.hasOwn(serviceBySlug, slug) ? serviceBySlug[slug] : undefined;
}
