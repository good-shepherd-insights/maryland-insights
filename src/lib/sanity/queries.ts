import { sanityClient } from "./client";
import { PAGE_LIST_QUERY } from "@/lib/seo/contract.mjs";
import { pickPages } from "@/lib/seo/pages.mjs";

/** Documents that become pages: valid, unclashing addresses only. */
async function publishedPages() {
  const rows: any[] = await sanityClient.fetch(PAGE_LIST_QUERY);
  const { routes } = pickPages(rows);
  return rows.filter((r) => routes.has(r._id));
}
async function slugsOf(type: string): Promise<string[]> {
  return (await publishedPages()).filter((r) => r._type === type).map((r) => r.slug.current);
}
/** The document published at an address, however many claim it. */
async function idOf(type: string, slug: string): Promise<string | undefined> {
  return (await publishedPages()).find((r) => r._type === type && r.slug.current === slug)?._id;
}
const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";
const isDay = (v: unknown) => isText(v) && !Number.isNaN(Date.parse(v));
/** Lists of posts appear on other pages, so a half-filled post must be safe there. */
const safePost = (p: any) => ({
  ...p,
  description: isText(p.description) ? p.description : undefined,
  datePublished: isDay(p.datePublished) ? p.datePublished : undefined,
  author: isText(p.author?.name) ? p.author : undefined,
  categories: (Array.isArray(p.categories) ? p.categories : []).filter((c: any) => isText(c?.title)),
});
async function listable(posts: any[]) {
  const ids = new Set((await publishedPages()).map((r) => r._id));
  return (posts ?? []).filter((p) => p && ids.has(p._id) && isText(p.title)).map(safePost);
}

export async function getSiteSettings() {
  const settings = await sanityClient.fetch(`*[_type == "siteSettings"][0]`);
  if (!settings) {
    throw new Error('Sanity has no "siteSettings" document; site chrome would render empty.');
  }
  return settings;
}

export async function getHomePage() {
  return sanityClient.fetch(`*[_type == "home"][0]{
    ...,
    hero->,
    trustStrip->,
    serviceStack->,
    features->,
    comparison->,
    integrations->,
    facts->,
    faq->,
    cta->
  }`);
}

export async function getAboutPage() {
  return sanityClient.fetch(`*[_type == "aboutPage"][0]{
    ...,
    header->,
    narrative->,
    story->,
    facts->,
    cta->
  }`);
}

export async function getContactPage() {
  return sanityClient.fetch(`*[_type == "contactPage"][0]{
    ...,
    header->,
    info->,
    offices->,
    form->,
    guidance->,
    cta->
  }`);
}

export async function getFaqsPage() {
  return sanityClient.fetch(`*[_type == "faqsPage"][0]{
    ...,
    header->,
    list->,
    support->,
    cta->
  }`);
}

export async function getIntegrationsPage() {
  return sanityClient.fetch(`*[_type == "integrationsPage"][0]{
    ...,
    header->,
    grid->{..., "integrations": integrations[]->},
    cta->
  }`);
}

export async function getToolsPage() {
  return sanityClient.fetch(`*[_type == "toolsPage"][0]{
    ...,
    header->,
    grid->{..., "tools": tools[]->{
      ...,
      "logoUrl": logo.asset->url,
      "logoAlt": logo.alt
    }},
    cta->
  }`);
}

export async function getServicesPage() {
  const page = await sanityClient.fetch(`*[_type == "servicesPage"][0]{
    ...,
    header->,
    grid->{..., "services": services[]->{
      title, description, image,
      "slug": slug.current,
      button{label, link}
    }},
    useCases->,
    cta->
  }`);
  if (!page?.grid) return page;
  const slugs = new Set(await slugsOf("servicePage"));
  const services = (page.grid.services ?? []).filter((x: any) => slugs.has(x?.slug) && isText(x.title)).map((x: any) => ({ ...x, description: isText(x.description) ? x.description : undefined }));
  return { ...page, grid: { ...page.grid, services } };
}

export async function getServicePageSlugs(): Promise<string[]> {
  return slugsOf("servicePage");
}

export async function getServicePage(slug: string) {
  return sanityClient.fetch(
    `*[_type == "servicePage" && _id == $id][0]{
      ...,
      blocks[]{
        ...,
        _type == "relatedArticles" => {
          "articles": articles[]->{
            title,
            description,
            "slug": slug.current,
            "datePublished": coalesce(date, datePublished)
          }
        }
      },
      "relatedFeatures": relatedFeatures[]->{
        title,
        "slug": slug.current,
        "subtitle": *[_id == "homeFeatures"][0].features[title == ^.title][0].subtitle
      }
    }`,
    { id: (await idOf("servicePage", slug)) ?? "" },
  );
}

export async function getBlogPage() {
  const page = await sanityClient.fetch(`*[_type == "blogPage"][0]{
    ...,
    header->,
    guide->,
    "featuredPosts": featuredPosts[]->{
      _id, title, description, image,
      "slug": slug.current,
      "datePublished": coalesce(date, datePublished),
      author{name}
    },
    cta->
  }`);
  return page && { ...page, featuredPosts: await listable(page.featuredPosts) };
}

export async function getBlogPosts() {
  const posts = await sanityClient.fetch(`*[_type == "blogPost" && draft != true] | order(coalesce(date, datePublished) desc) {
    _id, title, description, image,
    "slug": slug.current,
    "datePublished": coalesce(date, datePublished),
    author{name},
    categories[]->{title, "slug": slug.current}
  }`);
  return listable(posts);
}

export async function getBlogPost(slug: string) {
  return sanityClient.fetch(
    `*[_type == "blogPost" && _id == $id][0]{
      ...,
      "datePublished": coalesce(date, datePublished),
      author,
      categories[]->{_id, title, "slug": slug.current}
    }`,
    { id: (await idOf("blogPost", slug)) ?? "" },
  );
}

export async function getLegalPageSlugs(): Promise<string[]> {
  return slugsOf("legalPage");
}

export async function getLegalPage(slug: string) {
  return sanityClient.fetch(
    `*[_type == "legalPage" && _id == $id][0]`,
    { id: (await idOf("legalPage", slug)) ?? "" },
  );
}

export async function getClosingCta() {
  return sanityClient.fetch(`*[_type == "closingCta"][0]`);
}

export async function getIntegrations() {
  return sanityClient.fetch(`*[_type == "integration"] | order(title asc) {
    _id, title, description, logoName, image, link
  }`);
}

export async function getIntegrationsGuidance() {
  return sanityClient.fetch(`*[_type == "integrationsGuidance"][0]`);
}

export async function getFeaturePageSlugs(): Promise<string[]> {
  return slugsOf("featurePage");
}

export async function getFeaturePage(slug: string) {
  return sanityClient.fetch(
    `*[_type == "featurePage" && _id == $id][0]`,
    { id: (await idOf("featurePage", slug)) ?? "" },
  );
}
