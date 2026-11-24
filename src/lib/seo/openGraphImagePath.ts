import { createHash } from "node:crypto";

// Raise when the card design changes.
const DESIGN = 1;

export type CardText = { ogTitle?: string; ogDescription?: string; graph?: any[] };

/** The picture a blog post's card shows. */
export const cardPicture = (seo: CardText): string | undefined => {
  const image = seo.graph?.find((n) => n?.["@type"] === "BlogPosting")?.image;
  return Array.isArray(image) ? image[0] : image;
};

/** A card's address changes whenever what it shows changes, so no one keeps an old copy. */
export const getOpenGraphImagePath = (pathname: string, seo: CardText) => {
  const route = pathname.split(/[?#]/, 1)[0].replace(/^\/+|\/+$/g, "");
  const key = createHash("sha256").update(JSON.stringify([DESIGN, seo.ogTitle, seo.ogDescription, cardPicture(seo)])).digest("hex").slice(0, 10);
  return `/open-graph/${route || "home"}.png?v=${key}`;
};
