import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import partytown from "@astrojs/partytown";
import vercel from "@astrojs/vercel";
import tailwindcss from "@tailwindcss/vite";
import AutoImport from "astro-auto-import";
import { defineConfig } from "astro/config";
import remarkCollapse from "remark-collapse";
import remarkToc from "remark-toc";
import sharp from "sharp";
import config from "./src/config/config.json";
import frontman from "@frontman-ai/astro";

// https://astro.build/config
export default defineConfig({
  site: config.site.base_url ? config.site.base_url : "http://examplesite.com",
  base: config.site.base_path ? config.site.base_path : "/",
  trailingSlash: config.site.trailing_slash ? "always" : "never",
  output: "server",
  adapter: vercel(),
  image: { service: sharp() },
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: [
        "mouthwatering-hettie-openairish.ngrok-free.dev",
        "dev.marylandinsights.com",
        ".dev.marylandinsights.com",
      ],
    },
  },
  integrations: [
    frontman({
      projectRoot: import.meta.dirname,
      host: "192.168.1.174:4000",
      clientUrl: "https://app.frontman.sh/frontman.es.js?clientName=astro&host=192.168.1.174:4000",
    }),
    react(),
    partytown({
      config: {
        forward: ["trackingFunctions.onLoad", "dataLayer.push"],
      },
    }),
    sitemap({
      filter: (page) =>
        !page.includes("/elements") &&
        !page.includes("/get-started") &&
        !page.includes("/start-for-free") &&
        !page.includes("/enterprise-support") &&
        !page.includes("/search"),
    }),
    AutoImport({
      imports: [
        "@/shortcodes/Button",
        "@/shortcodes/Accordion",
        "@/shortcodes/Notice",
        "@/shortcodes/Video",
        "@/shortcodes/Youtube",
        "@/shortcodes/Tabs",
        "@/shortcodes/Tab",
      ],
    }),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkToc, [remarkCollapse, { test: "Table of contents" }]],
    shikiConfig: { theme: "one-dark-pro", wrap: true },
    extendDefaultPlugins: true,
  },
});
