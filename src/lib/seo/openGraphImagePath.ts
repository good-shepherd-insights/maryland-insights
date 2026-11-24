declare const __CARD_BUILD__: string;

type CardText = { graph?: any[] };

/** The picture a blog post's card shows. */
export const cardPicture = (seo: CardText): string | undefined => {
  const image = seo.graph?.find((n) => n?.["@type"] === "BlogPosting")?.image;
  return Array.isArray(image) ? image[0] : image;
};

/**
 * Every build draws new cards and gives them new addresses, so no one keeps an old one.
 * The address comes from the build, not the page's text: a page rendered after an edit
 * must not point a new address at a card that has not been redrawn yet.
 */
export const getOpenGraphImagePath = (pathname: string) => {
  const route = pathname.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "");
  return `/open-graph/${route || "home"}.png?v=${__CARD_BUILD__}`;
};
