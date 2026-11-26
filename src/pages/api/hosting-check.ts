import { checkHosting } from "../../lib/hostingCheck";
import { identity } from "../../lib/followUpCheck";
import { checkSchema } from "../../lib/schemaCheck";
import { readPage, siteCheck } from "../../lib/siteReader";
import { serverFacts } from "../../lib/serverFacts";

export const prerender = false;

/** Reads a homepage as it was sent and as a browser shows it. */
export const POST = siteCheck(async (url, key) => {
  const [raw, home, server] = await Promise.all([readPage(url, key, "raw", 20_000), readPage(url, key, "rendered", 25_000), serverFacts(url)]);
  const notes = ["This covers the homepage. Server response is timed from our server."], rows = checkHosting(raw, home, url, server);
  const domain = url.hostname.replace(/^www\./, "");
  const schema = checkSchema(home, domain), own = identity(home);
  return {
    name: schema.name !== domain ? schema.name : own.name || domain,
    logo: schema.logo ?? own.logo,
    notes,
    rows,
  };
});
