import { getOpenGraphPages } from "@/lib/seo/openGraphImages";
import type { APIRoute } from "astro";
import { OGImageRoute } from "astro-og-canvas";

export const prerender = true;

const pages = await getOpenGraphPages();

const ogImageRoute = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => {
    const titleSize =
      page.title.length > 65 ? 48 : page.title.length > 45 ? 54 : 60;

    return {
      title: page.title,
      description: page.description,
      logo: {
        path: "./public/images/logo.png",
        size: [88, 88],
      },
      bgGradient: [
        [18, 18, 18],
        [217, 101, 26],
      ],
      border: {
        color: [200, 16, 46],
        width: 12,
        side: "inline-start",
      },
      padding: 72,
      fonts: [
        "./src/assets/fonts/geist-latin-400-normal.ttf",
        "./src/assets/fonts/geist-latin-700-normal.ttf",
      ],
      font: {
        title: {
          families: ["Geist"],
          size: titleSize,
          lineHeight: 1.05,
          weight: "Bold",
        },
        description: {
          families: ["Geist"],
          size: 28,
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
