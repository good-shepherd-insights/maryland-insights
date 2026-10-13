import { sanityClient } from "./client";

export async function getSiteSettings() {
  return sanityClient.fetch(`*[_type == "siteSettings"][0]`);
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
    grid->{..., "tools": tools[]->},
    cta->
  }`);
}

export async function getServicesPage() {
  return sanityClient.fetch(`*[_type == "servicesPage"][0]{
    ...,
    header->,
    grid->{..., "services": services[]->{
      title, description,
      "slug": slug.current,
      button{label, link}
    }},
    useCases->,
    cta->
  }`);
}

export async function getServicePageSlugs(): Promise<string[]> {
  const rows = await sanityClient.fetch(
    `*[_type == "servicePage"]{ "slug": slug.current }`,
  );
  return rows.map((r: { slug: string }) => r.slug).filter(Boolean);
}

export async function getServicePage(slug: string) {
  return sanityClient.fetch(
    `*[_type == "servicePage" && slug.current == $slug][0]{
      ...,
      blocks[]{
        ...,
        _type == "relatedArticles" => {
          "articles": articles[]->{
            title,
            description,
            "slug": slug.current,
            datePublished
          }
        }
      }
    }`,
    { slug },
  );
}

export async function getBlogPage() {
  return sanityClient.fetch(`*[_type == "blogPage"][0]{
    ...,
    header->,
    guide->,
    "featuredPosts": featuredPosts[]->{
      _id, title, description,
      "slug": slug.current,
      datePublished,
      author{name}
    },
    cta->
  }`);
}

export async function getBlogPosts() {
  return sanityClient.fetch(`*[_type == "blogPost"] | order(datePublished desc) {
    _id, title, description,
    "slug": slug.current,
    datePublished,
    author{name},
    categories[]->{title, "slug": slug.current}
  }`);
}

export async function getBlogPost(slug: string) {
  return sanityClient.fetch(
    `*[_type == "blogPost" && slug.current == $slug][0]{
      ...,
      author,
      categories[]->{_id, title, "slug": slug.current}
    }`,
    { slug },
  );
}

export async function getLegalPageSlugs(): Promise<string[]> {
  const rows = await sanityClient.fetch(
    `*[_type == "legalPage"]{ "slug": slug.current }`,
  );
  return rows.map((r: { slug: string }) => r.slug).filter(Boolean);
}

export async function getLegalPage(slug: string) {
  return sanityClient.fetch(
    `*[_type == "legalPage" && slug.current == $slug][0]`,
    { slug },
  );
}

export async function getClosingCta() {
  return sanityClient.fetch(`*[_type == "closingCta"][0]`);
}

export async function getIntegrations() {
  return sanityClient.fetch(`*[_type == "integration"] | order(title asc) {
    _id, title, description, logoName, link
  }`);
}

export async function getIntegrationsGuidance() {
  return sanityClient.fetch(`*[_type == "integrationsGuidance"][0]`);
}
