import { createClient } from "@sanity/client";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const client = createClient({
  projectId: "089yj83f",
  dataset: "production",
  apiVersion: "2026-01-01",
  useCdn: false,
});

const settings = await client.fetch(`*[_type == "siteSettings"][0]{llmsTxt,openSearchXml,humansTxt,redirects}`);
const files = [
  ["llmsTxt", "public/llms.txt"],
  ["openSearchXml", "public/opensearch.xml"],
  ["humansTxt", "public/humans.txt"],
];

for (const [field] of files) {
  if (typeof settings?.[field] !== "string" || !settings[field].trim()) {
    throw new Error(`siteSettings.${field} must be populated in the CMS before building.`);
  }
}

const redirectFields = [
  ["getStarted", "__GET_STARTED_URL__"],
  ["startForFree", "__START_FOR_FREE_URL__"],
  ["enterpriseSupport", "__ENTERPRISE_SUPPORT_URL__"],
];
let nginxConfig = await readFile(resolve("config/nginx/nginx.conf"), "utf8");
for (const [field, placeholder] of redirectFields) {
  const destination = settings?.redirects?.[field];
  if (typeof destination !== "string" || !/^https:\/\/[^\s;{}$]+$/.test(destination)) {
    throw new Error(`siteSettings.redirects.${field} must be a safe HTTPS URL.`);
  }
  if (!nginxConfig.includes(placeholder)) throw new Error(`Missing Nginx placeholder ${placeholder}.`);
  nginxConfig = nginxConfig.replaceAll(placeholder, new URL(destination).href);
}
if (/__[A-Z_]+__/.test(nginxConfig)) throw new Error("Unresolved Nginx placeholder.");

for (const [field, file] of files) {
  const path = resolve(file);
  const current = await readFile(path, "utf8");
  if (current !== settings[field]) await writeFile(path, settings[field]);
}
await writeFile(resolve("config/nginx/nginx.generated.conf"), nginxConfig);
