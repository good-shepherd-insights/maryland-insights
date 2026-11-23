import { sanityClient } from "@/lib/sanity/client";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { plainify } from "@/lib/utils/textConverter";
import { ALL_QUERY, ONE_QUERY, ROUTES, overrideId } from "./contract.mjs";
import { buildHead } from "./graph.mjs";
import { resolveAll, resolvePage } from "./resolve.mjs";
import { formatProblems, validateSite } from "./validate.mjs";

type Head = ReturnType<typeof buildHead>;

// One read for the whole build, however many pages there are.
let build: Promise<{ site: any; byId: Map<string, any> }> | undefined;
const loadBuild = () =>
  (build ??= (async () => {
    const data = await sanityClient.fetch(ALL_QUERY);
    const { stop, pages } = resolveAll(data, { toText: plainify, fileExists: (p: string) => existsSync(join(process.cwd(), "public", p)) });
    if (stop.length) throw new Error(`Site-wide SEO problems:\n${formatProblems(stop)}`);
    return { site: data.site, byId: new Map(pages.map((p: any) => [p.doc._id, p])) };
  })());

/** Last resort for a per-request page when site-wide data is broken: keep the page up, unindexed markup off. */
const plain = (doc: any): Head => ({
  title: doc?.title ?? doc?.header_?.title ?? doc?.hero_?.title, description: doc?.description ?? doc?.header_?.description,
  canonical: undefined, noindex: false, dateModified: undefined, ogTitle: undefined, ogDescription: undefined, ogImage: undefined, graph: [],
}) as unknown as Head;

export async function loadSeo(id: string, prerendered: boolean): Promise<Head> {
  if (prerendered) {
    const { site, byId } = await loadBuild();
    const page = byId.get(id);
    if (!page) throw new Error(`${id} is not a known page. Add its type to ROUTES in src/lib/seo/contract.mjs.`);
    return buildHead(page, site);
  }
  const { site, pages, overrides, faqDocs } = await sanityClient.fetch(ONE_QUERY, { id, seoId: overrideId(id) });
  const doc = pages[0];
  try {
    if (!Object.hasOwn(ROUTES, doc?._type ?? "")) throw new Error(`type "${doc?._type}" is not in ROUTES`);
    const stop = validateSite(site);
    if (stop.length) throw new Error(`\n${formatProblems(stop)}`);
    const page = resolvePage(doc, overrides[0], site, { faqDocs, toText: plainify });
    if (page.problems.length) console.warn(`SEO data for ${id}:\n${formatProblems(page.problems)}`);
    return buildHead(page, site);
  } catch (error) {
    console.error(`SEO data for ${id}: ${(error as Error).message}`);
    return plain(doc);
  }
}

export async function loadNotFoundSeo(): Promise<Head> {
  const { site } = await loadBuild();
  const { notFoundTitle: title, notFoundDescription: description } = site.seo;
  return { title, description, canonical: undefined, noindex: true, dateModified: undefined, ogTitle: title, ogDescription: description, ogImage: undefined, graph: [] } as unknown as Head;
}
