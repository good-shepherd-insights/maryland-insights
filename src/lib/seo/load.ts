import { sanityClient } from "@/lib/sanity/client";
import { plainify } from "@/lib/utils/textConverter";
import { PAGE_QUERY, SITE_QUERY } from "./contract.mjs";
import { buildHead } from "./graph.mjs";
import { formatProblems, validatePage, validateSite } from "./validate.mjs";

/**
 * Head values for one Sanity document. Prerendered pages fail the build on any
 * problem. Pages rendered per request cannot, so they log it, keep their meta
 * tags and print no structured data rather than wrong data.
 */
export async function loadSeo(id: string, strict: boolean) {
  const [doc, site] = await Promise.all([sanityClient.fetch(PAGE_QUERY, { id }), sanityClient.fetch(SITE_QUERY)]);
  let message: string;
  try {
    const problems = [
      ...validateSite(site, { everything: strict }),
      ...validatePage(doc, { baseUrl: site?.seoUrl, orgName: site?.seo?.organization?.name }),
    ];
    if (problems.length === 0) return buildHead(doc, site, { toText: plainify });
    message = formatProblems(problems);
  } catch (error) {
    message = `  ${(error as Error).message}`;
  }
  message = `SEO data problems for ${id}:\n${message}`;
  if (strict) throw new Error(message);
  console.error(message);

  const seo = doc?.seo ?? {};
  const text = (value: unknown) => (typeof value === "string" && value.trim() ? value : undefined);
  const canonical = text(seo.canonical);
  return {
    title: text(seo.title) ?? text(doc?.title),
    description: text(seo.description),
    dateModified: undefined,
    canonical: canonical && site?.seoUrl && canonical.startsWith(`${site.seoUrl}/`) ? canonical : undefined,
    // Anything but a clear "off" keeps a page out of search.
    noindex: seo.noindex != null && seo.noindex !== false,
    ogTitle: text(seo.ogTitle),
    ogDescription: text(seo.ogDescription),
    ogImage: undefined,
    graph: [],
  };
}

export async function loadNotFoundSeo() {
  const site = await sanityClient.fetch(SITE_QUERY);
  const problems = validateSite(site);
  if (problems.length) throw new Error(`SEO data problems:\n${formatProblems(problems)}`);
  const { notFoundTitle: title, notFoundDescription: description } = site.seo;
  return { title, description, dateModified: undefined, canonical: undefined, noindex: true, ogTitle: title, ogDescription: description, ogImage: undefined, graph: [] };
}
