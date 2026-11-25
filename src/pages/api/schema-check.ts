import { checkSchema } from "../../lib/schemaCheck";
import { readPage, siteCheck } from "../../lib/siteReader";

export const prerender = false;

/** Reads the schema on a website's homepage from the raw HTML, before any JavaScript runs. */
export const POST = siteCheck(async (url, key) => {
  const c = checkSchema(await readPage(url, key, "raw"), url.hostname.replace(/^www\./, ""));
  const notes: string[] = [];
  if (!c.hasSchema && !c.invalidBlocks) notes.push("No JSON-LD schema on this homepage. It may be on another page of the site.");
  if (c.invalidBlocks) notes.push(`${c.invalidBlocks} schema ${c.invalidBlocks === 1 ? "block has" : "blocks have"} an error and could not be read.`);
  if (c.hasMicrodata) notes.push("This homepage also has microdata, which this check does not read.");
  return {
    name: c.name,
    logo: c.logo,
    notes,
    rows: c.rows.map(({ label, value, status }) => ({
      label,
      found: status === "found",
      value: status === "found" ? value : status === "generic" ? `${value}, not a local business` : status === "blank" ? "Left blank" : "Missing",
    })),
  };
});
