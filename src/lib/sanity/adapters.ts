// Sanity (camelCase) -> legacy component shapes (what the markdown provided).
// Keeps pages and components untouched; all translation lives here.

// --- blocks (servicePage) -----------------------------------------------

function adaptBlock(block: any): any {
  if (!block || typeof block !== "object") return block;
  const out: any = { ...block };

  if (block._type === "tableOfContents") {
    // Component takes sectionsWord; Sanity stores ui.countTemplate ("{n} sections").
    const template: string | undefined = block.ui?.countTemplate;
    out.sectionsWord = template ? template.replace("{n}", "").trim() : "";
  }

  if (block._type === "relatedArticles" && Array.isArray(block.articles)) {
    out.articles = block.articles.map((a: any) => ({
      title: a.title,
      url: a.slug ? `/blog/${a.slug}` : "",
      excerpt: a.description,
      date: a.datePublished,
    }));
  }

  return out;
}

export function adaptBlocks(blocks: any[]): any[] {
  return (blocks ?? []).map(adaptBlock);
}

// --- servicePage ---------------------------------------------------------

export function adaptServicePage(doc: any): any {
  if (!doc) return doc;
  const cta = doc.serviceCta ?? {};
  const faqUi = doc.faqUi ?? {};
  return {
    ...doc,
    faqs_list: doc.faqs ?? [],
    blocks: adaptBlocks(doc.blocks),
    date_modified: doc.dateModified,
    faq_title_prefix: doc.faqSectionTitleTemplate,
    cta_title: cta.title,
    cta_description: cta.description,
    cta_button_label: cta.buttonLabel,
    cta_button_link: cta.buttonLink,
    ui: doc.ui ?? {},
    faqsUi: {
      searchPlaceholder: faqUi.searchPlaceholder,
      noResultsText: faqUi.noResultsHeading,
      clearFilterLabel: faqUi.clearSearchLabel,
    },
  };
}

// --- home (for self-fetching components) ---------------------------------

export function adaptHomeBanner(doc: any): any {
  const hero = doc?.hero ?? {};
  const tab = (key: string) =>
    (hero.personaTabs ?? []).find((t: any) => t.tabKey === key) ?? {};
  const businesses = tab("businesses");
  const agencies = tab("agencies");
  return {
    eyebrow: hero.eyebrow,
    title: hero.title,
    content: hero.content,
    subtitle: hero.subtitle,
    button_solid: hero.buttonSolid
      ? { ...hero.buttonSolid, enable: true }
      : undefined,
    button_underline: hero.buttonUnderline
      ? { ...hero.buttonUnderline, enable: true }
      : undefined,
    tag_lines: hero.tagLines ?? [],
    stats: hero.stats ?? [],
    persona_businesses_label: businesses.tabLabel,
    persona_agencies_label: agencies.tabLabel,
    persona_businesses: businesses,
    persona_agencies: agencies,
  };
}

// --- generic: expose the Sanity doc under `.data` like contentParser did --

export function asPageData(doc: any): { data: any } {
  return { data: doc ?? {} };
}
