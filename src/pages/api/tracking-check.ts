import { identity } from "../../lib/followUpCheck";
import { checkSchema } from "../../lib/schemaCheck";
import { readPage, siteCheck } from "../../lib/siteReader";
import { checkTracking, containers } from "../../lib/trackingCheck";

export const prerender = false;

const MAX_TAGS = 3_000_000;

/** A container is a public file on Google's own server, named by an ID we have already matched. */
async function container(id: string): Promise<string | null> {
  try {
    const res = await fetch(`https://www.googletagmanager.com/gtm.js?id=${id}`, { signal: AbortSignal.timeout(6_000), redirect: "error" });
    return res.ok ? (await res.text()).slice(0, MAX_TAGS) : null;
  } catch {
    return null;
  }
}

/** Reads a homepage and the tags its Tag Manager loads. */
export const POST = siteCheck(async (url, key) => {
  const home = await readPage(url, key, "rendered", 25_000);
  const ids = containers(home);
  const tags = await Promise.all(ids.map(container));
  const domain = url.hostname.replace(/^www\./, "");
  const schema = checkSchema(home, domain), own = identity(home);
  const read = tags.filter((t) => t !== null);
  return {
    name: schema.name !== domain ? schema.name : own.name || domain,
    logo: schema.logo ?? own.logo,
    notes: [ids.length === 0 ? "Read from the homepage." : read.length === ids.length ? "Read from the homepage and its Tag Manager." : "Part of the Tag Manager could not be read, so some trackers may be missing."],
    rows: checkTracking(home, read),
  };
});
