import { sanityClient } from "@/lib/sanity/client";
import { imageExists } from "./files.mjs";
import { plainify } from "@/lib/utils/plainify.mjs";
import { ALL_QUERY, ONE_QUERY, ROUTES, overrideId } from "./contract.mjs";
import type { buildHead } from "./graph.mjs";
import { pickPages } from "./pages.mjs";
import { resolveAll, resolveSafely } from "./resolve.mjs";
import { formatProblems, validateSite } from "./validate.mjs";

type Head = ReturnType<typeof buildHead>;

// One read for the whole build, however many pages there are.
let build: Promise<{ site: any; byId: Map<string, any> }> | undefined;
const loadBuild = () =>
  (build ??= (async () => {
    const data = await sanityClient.fetch(ALL_QUERY);
    const { stop, pages } = resolveAll(data, { toText: plainify, fileExists: imageExists });
    if (stop.length) throw new Error(`Site-wide SEO problems:\n${formatProblems(stop)}`);
    return { site: data.site, byId: new Map(pages.map((p: any) => [p.doc._id, p])) };
  })());

/** Last resort for a per-request page when site-wide data is broken: keep the page up, unindexed markup off. */
const plain = (doc: any, override: any, site: any): Head => ({
  title: [override?.title, doc?.title, doc?.header_?.title, doc?.hero_?.title, site?.seo?.website?.name].find((v) => typeof v === "string" && v.trim()) ?? "Page",
  description: [override?.description, doc?.description, doc?.header_?.description].find((v) => typeof v === "string" && v.trim()),
  canonical: undefined, noindex: override?.noindex != null && override.noindex !== false, dateModified: undefined, ogTitle: undefined, ogDescription: undefined, ogImage: undefined, graph: [],
}) as unknown as Head;

export async function loadSeo(id: string, prerendered: boolean): Promise<Head> {
  if (prerendered) {
    const { site, byId } = await loadBuild();
    const page = byId.get(id);
    if (!page) throw new Error(`${id} is not a known page. Add its type to ROUTES in src/lib/seo/contract.mjs.`);
    return page.head;
  }
  const { site, pages, overrides, faqDocs, all } = await sanityClient.fetch(ONE_QUERY, { id, seoId: overrideId(id) });
  const doc = pages[0];
  try {
    if (!Object.hasOwn(ROUTES, doc?._type ?? "")) throw new Error(`type "${doc?._type}" is not in ROUTES`);
    const stop = validateSite(site);
    if (stop.length) throw new Error(`\n${formatProblems(stop)}`);
    const paths = new Set(pickPages(all).routes.values());
    const page = resolveSafely(doc, overrides[0], site, { faqDocs, paths, toText: plainify });
    if (page.problems.length) console.warn(`SEO data for ${id}:\n${formatProblems(page.problems)}`);
    return page.head;
  } catch (error) {
    console.error(`SEO data for ${id}: ${(error as Error).message}`);
    return plain(doc, overrides?.[0], site);
  }
}

export async function loadNotFoundSeo(): Promise<Head> {
  const { site } = await loadBuild();
  const { notFoundTitle: title, notFoundDescription: description } = site.seo;
  return { title, description, canonical: undefined, noindex: true, dateModified: undefined, ogTitle: title, ogDescription: description, ogImage: undefined, graph: [] } as unknown as Head;
}
