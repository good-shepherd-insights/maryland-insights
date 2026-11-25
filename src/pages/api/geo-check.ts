import { identity } from "../../lib/followUpCheck";
import { aboutPage, checkProof } from "../../lib/geoCheck";
import { checkSchema } from "../../lib/schemaCheck";
import { readPage, siteCheck } from "../../lib/siteReader";

export const prerender = false;

/** Reads a website's homepage and about page for what an AI answer could repeat. */
export const POST = siteCheck(async (url, key) => {
  const home = await readPage(url, key, "rendered", 25_000);
  const about = aboutPage(home, url);
  // An about page that cannot be read leaves the homepage's answer standing.
  const aboutHtml = about ? await readPage(about, key, "rendered", 15_000).catch(() => null) : null;
  const domain = url.hostname.replace(/^www\./, "");
  const schema = checkSchema(home, domain), own = identity(home);
  return {
    name: schema.name !== domain ? schema.name : own.name || domain,
    logo: schema.logo ?? own.logo,
    notes: [aboutHtml ? "This covers the homepage and the about page." : "This covers the homepage."],
    rows: checkProof(home, aboutHtml, url),
  };
});
