import { checkContent } from "../../lib/contentCheck";
import { identity } from "../../lib/followUpCheck";
import { checkSchema } from "../../lib/schemaCheck";
import { readPage, siteCheck } from "../../lib/siteReader";

export const prerender = false;

/** Reads the homepage for what could only have been written about this business. */
export const POST = siteCheck(async (url, key) => {
  const home = await readPage(url, key, "rendered", 25_000);
  const notes = ["This covers the homepage."], rows = checkContent(home, url);
  const domain = url.hostname.replace(/^www\./, "");
  const schema = checkSchema(home, domain), own = identity(home);
  return {
    name: schema.name !== domain ? schema.name : own.name || domain,
    logo: schema.logo ?? own.logo,
    notes,
    rows,
  };
});
