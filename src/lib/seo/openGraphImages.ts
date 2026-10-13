import config from "@/config/config.json";
import { plainify } from "@/lib/utils/textConverter";
import {
  getHomePage,
  getAboutPage,
  getBlogPage,
  getBlogPosts,
  getContactPage,
  getFaqsPage,
  getIntegrationsPage,
  getLegalPage,
  getLegalPageSlugs,
  getServicePage,
  getServicePageSlugs,
  getServicesPage,
  getToolsPage,
} from "@/lib/sanity/queries";

export interface OpenGraphPage {
  title: string;
  description: string;
}

const MAX_DESCRIPTION_LENGTH = 135;

const shorten = (value: string, maxLength = MAX_DESCRIPTION_LENGTH) => {
  if (value.length <= maxLength) return value;

  const shortened = value.slice(0, maxLength - 1);
  const lastSpace = shortened.lastIndexOf(" ");
  return `${shortened.slice(0, lastSpace > 0 ? lastSpace : undefined).trimEnd()}…`;
};

const toOpenGraphPage = (data: {
  title?: string;
  meta_title?: string;
  description?: string;
}): OpenGraphPage => ({
  title: plainify(data.title || data.meta_title || config.site.title),
  description: shorten(
    plainify(data.description || config.metadata.meta_description),
  ),
});

export const getOpenGraphPages = async (options?: {
  notFound?: OpenGraphPage;
  search?: OpenGraphPage;
}): Promise<Record<string, OpenGraphPage>> => {
  const [
    homepage,
    about,
    blogIndex,
    contact,
    faqs,
    integrations,
    servicesIndex,
    tools,
    blogPosts,
    legalSlugs,
    serviceSlugs,
  ] = await Promise.all([
    getHomePage(),
    getAboutPage(),
    getBlogPage(),
    getContactPage(),
    getFaqsPage(),
    getIntegrationsPage(),
    getServicesPage(),
    getToolsPage(),
    getBlogPosts(),
    getLegalPageSlugs(),
    getServicePageSlugs(),
  ]);

  const headerOf = (doc: any) => doc?.header ?? {};
  const requiredIndexes: Record<string, any> = {
    about: headerOf(about),
    blog: headerOf(blogIndex),
    contact: headerOf(contact),
    faqs: headerOf(faqs),
    integrations: headerOf(integrations),
    services: headerOf(servicesIndex),
    tools: headerOf(tools),
  };

  for (const [route, entry] of Object.entries(requiredIndexes)) {
    if (!entry?.title) {
      throw new Error(`Missing content entry for the /${route} OG image.`);
    }
  }

  const pages: Record<string, OpenGraphPage> = {
    home: toOpenGraphPage({ title: homepage?.hero?.title }),
    "404": options?.notFound ?? { title: "", description: "" },
    search: options?.search ?? { title: "", description: "" },
  };

  for (const [route, entry] of Object.entries(requiredIndexes)) {
    pages[route] = toOpenGraphPage(entry);
  }

  for (const slug of legalSlugs) {
    const entry = await getLegalPage(slug);
    if (entry) pages[slug] = toOpenGraphPage(entry);
  }

  for (const entry of blogPosts ?? []) {
    pages[`blog/${entry.slug}`] = toOpenGraphPage(entry);
  }

  for (const slug of serviceSlugs) {
    const entry = await getServicePage(slug);
    if (entry) pages[`services/${slug}`] = toOpenGraphPage(entry);
  }

  return pages;
};
