import { checkFollowUp, contactPage, identity } from "../../lib/followUpCheck";
import { checkSchema } from "../../lib/schemaCheck";
import { readPage, siteCheck } from "../../lib/siteReader";

export const prerender = false;

/** Reads a website's homepage and contact page for the ways a customer can reach the business. */
export const POST = siteCheck(async (url, key) => {
  const home = await readPage(url, key, "rendered", 25_000);
  const contact = contactPage(home, url);
  // A contact page that cannot be read leaves the homepage's answer standing.
  const contactHtml = contact ? await readPage(contact, key, "rendered", 15_000).catch(() => null) : null;
  const domain = url.hostname.replace(/^www\./, "");
  const schema = checkSchema(home, domain), own = identity(home);
  return {
    name: schema.name !== domain ? schema.name : own.name || domain,
    logo: schema.logo ?? own.logo,
    notes: contact && !contactHtml ? ["The contact page could not be read, so this covers the homepage."] : [],
    rows: checkFollowUp(home, contactHtml),
  };
});
