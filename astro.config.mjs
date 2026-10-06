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
    // NOTE: no HTTPS dev server here on purpose. Frontman QA needs a secure context
    // (browser crypto.randomUUID, used by the frontman.es.js client), so LAN QA goes
    // through a TEMPORARY local nginx TLS proxy on 192.168.1.174:9443 (mkcert cert)
    // forwarding to this plain-HTTP dev server. Workaround for local dev ONLY -
    // never a production path; real TLS stays with the deploy adapter (Vercel/nginx).
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
      // Serve the client bundle same-origin (public/frontman.es.js). The hosted
      // app.frontman.sh bundle cross-origin-errors when the page is on another
      // origin; same-origin keeps the QA page self-contained.
      clientUrl: "https://192.168.1.174:9443/frontman.es.js?clientName=astro&host=192.168.1.174:4000",
      clientCssUrl: "https://192.168.1.174:9443/frontman.css",
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
