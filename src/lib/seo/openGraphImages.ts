import config from "@/config/config.json";
import { plainify } from "@/lib/utils/textConverter";
import { getCollection, getEntry } from "astro:content";

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

export const getOpenGraphPages = async (): Promise<
  Record<string, OpenGraphPage>
> => {
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
    regularPages,
    services,
  ] = await Promise.all([
    getEntry("homepage", "-index"),
    getEntry("about", "-index"),
    getEntry("blog", "-index"),
    getEntry("contact", "-index"),
    getEntry("faqs", "-index"),
    getEntry("integrations", "-index"),
    getEntry("services", "-index"),
    getEntry("tools", "-index"),
    getCollection("blog", ({ data, id }) => !data.draft && !id.startsWith("-")),
    getCollection(
      "pages",
      ({ data, id }) => !data.draft && !id.startsWith("-"),
    ),
    getCollection(
      "services",
      ({ data, id }) => !data.draft && !id.startsWith("-"),
    ),
  ]);

  const requiredIndexes = {
    about,
    blog: blogIndex,
    contact,
    faqs,
    integrations,
    services: servicesIndex,
    tools,
  };

  for (const [route, entry] of Object.entries(requiredIndexes)) {
    if (!entry) {
      throw new Error(`Missing content entry for the /${route} OG image.`);
    }
  }

  const pages: Record<string, OpenGraphPage> = {
    home: homepage
      ? {
          title: plainify(homepage.data.banner.title),
          description: shorten(plainify(homepage.data.banner.content)),
        }
      : toOpenGraphPage({}),
    "404": {
      title: "Page Not Found",
      description:
        "Return to Maryland Insights to keep building your business.",
    },
    search: {
      title: "Search Results",
      description: "Search results for your Maryland business needs.",
    },
  };

  for (const [route, entry] of Object.entries(requiredIndexes)) {
    pages[route] = toOpenGraphPage(entry!.data);
  }

  for (const entry of regularPages) {
    pages[entry.id] = toOpenGraphPage(entry.data);
  }

  for (const entry of blogPosts) {
    pages[`blog/${entry.id}`] = toOpenGraphPage(entry.data);
  }

  for (const entry of services) {
    pages[`services/${entry.id}`] = toOpenGraphPage(entry.data);
  }

  return pages;
};
