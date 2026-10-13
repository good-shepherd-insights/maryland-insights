import { getOpenGraphPages } from "@/lib/seo/openGraphImages";
import { getSiteSettings } from "@/lib/sanity/queries";
import type { APIRoute } from "astro";
import { OGImageRoute } from "astro-og-canvas";

export const prerender = true;

const [pages, settings] = await Promise.all([getOpenGraphPages(), getSiteSettings()]);
const style = settings?.openGraphImage;
if (!style) throw new Error("siteSettings.openGraphImage is required.");

const color = (value: string): [number, number, number] => {
  if (!/^#[0-9a-fA-F]{6}$/.test(value)) throw new Error(`Invalid CMS Open Graph color: ${value}`);
  return [1, 3, 5].map((index) => parseInt(value.slice(index, index + 2), 16)) as [number, number, number];
};
const localAsset = (value: string, prefix: string): string => {
  if (typeof value !== "string" || !value.startsWith(prefix) || value.includes("..")) {
    throw new Error(`Invalid CMS Open Graph asset path: ${value}`);
  }
  return value;
};
const positive = (value: number, field: string): number => {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    throw new Error(`siteSettings.openGraphImage.${field} must be positive.`);
  }
  return value;
};
const logoPath = localAsset(style.logoPath, "./public/images/");
const regularFont = localAsset(style.fontRegularPath, "./src/assets/fonts/");
const boldFont = localAsset(style.fontBoldPath, "./src/assets/fonts/");
const gradientStart = color(style.gradientStart);
const gradientEnd = color(style.gradientEnd);
const borderColor = color(style.borderColor);
const fontFamily = style.fontFamily;
if (typeof fontFamily !== "string" || !fontFamily.trim()) throw new Error("siteSettings.openGraphImage.fontFamily is required.");

const ogImageRoute = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => {
    const titleSize =
      page.title.length > 65 ? positive(style.titleSizeLong, "titleSizeLong")
      : page.title.length > 45 ? positive(style.titleSizeMedium, "titleSizeMedium")
      : positive(style.titleSizeShort, "titleSizeShort");

    return {
      title: page.title,
      description: page.description,
      logo: {
        path: logoPath,
        size: [positive(style.logoSize, "logoSize"), positive(style.logoSize, "logoSize")],
      },
      bgGradient: [gradientStart, gradientEnd],
      border: {
        color: borderColor,
        width: positive(style.borderWidth, "borderWidth"),
        side: "inline-start",
      },
      padding: positive(style.padding, "padding"),
      fonts: [regularFont, boldFont],
      font: {
        title: {
          families: [fontFamily],
          size: titleSize,
          lineHeight: 1.05,
          weight: "Bold",
        },
        description: {
          families: [fontFamily],
          size: positive(style.descriptionSize, "descriptionSize"),
          lineHeight: 1.3,
        },
      },
    };
  },
});

export const getStaticPaths = ogImageRoute.getStaticPaths;

export const GET: APIRoute = async (context) => {
  const response = await ogImageRoute.GET(context);
  response.headers.set("Content-Type", "image/png");
  response.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return response;
};
