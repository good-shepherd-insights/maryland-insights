/** Services the audit request is allowed to send. */
export enum AuditService {
  LocalSeo = "local-seo",
}

const serviceBySlug: Record<string, AuditService> = {
  "local-seo": AuditService.LocalSeo,
};

/** Map a page service slug onto the audit service enum. Unknown slugs are rejected. */
export function auditServiceFromSlug(slug: string): AuditService | undefined {
  return serviceBySlug[slug];
}
