// Checks and writes the SEO data held in Sanity. See docs/SEO.md.
//   node scripts/seo.mjs check              validate everything live in Sanity
//   node scripts/seo.mjs write file.json    show what would change (writes nothing)
//   node scripts/seo.mjs write file.json --yes   validate, then write
//   node scripts/seo.mjs docs               rebuild docs/SEO.md from the contract
// Every write also prints open drafts of the same documents: publishing a draft
// made before the write would replace the document and drop its seo.
// file.json maps a document _id to its complete seo object: {"home": {...}}
import { createClient } from "@sanity/client";
import { readFile, writeFile } from "node:fs/promises";
import { ALL_PAGES_QUERY, SITE_QUERY } from "../src/lib/seo/contract.mjs";
import { editorGuide } from "../src/lib/seo/guide.mjs";
import { formatProblems, validateAll } from "../src/lib/seo/validate.mjs";

const [command, file, ...flags] = process.argv.slice(2);
const token = process.env.SANITY_AUTH_TOKEN;
const client = createClient({ projectId: "089yj83f", dataset: "production", apiVersion: "2026-01-01", useCdn: false, ...(command === "write" && token ? { token } : {}) });

const load = () => Promise.all([client.fetch(SITE_QUERY), client.fetch(ALL_PAGES_QUERY)]);
const report = (problems) => {
  if (!problems.length) return true;
  console.error(`${problems.length} SEO data problem(s):\n${formatProblems(problems)}`);
  process.exitCode = 1;
  return false;
};

if (command === "check") {
  const [site, pages] = await load();
  if (report(validateAll(site, pages))) console.log(`SEO data is valid: ${pages.length} pages and site settings.`);
} else if (command === "docs") {
  await writeFile(new URL("../docs/SEO.md", import.meta.url), editorGuide());
} else if (command === "write" && file) {
  const changes = JSON.parse(await readFile(file, "utf8"));
  const [site, pages] = await load();
  const known = new Map([site, ...pages].map((d) => [d._id, d]));
  const unknown = Object.keys(changes).filter((id) => !known.has(id));
  if (unknown.length) throw new Error(`Not a page or site settings: ${unknown.join(", ")}`);
  const merged = (d) => (changes[d._id] ? { ...d, seo: changes[d._id] } : d);
  if (token) {
    const drafts = await client.fetch('*[_id in path("drafts.**") || _id in path("versions.**")]._id', {}, { perspective: "raw" });
    const open = drafts.filter((d) => Object.keys(changes).includes(d.replace(/^(drafts|versions\.[^.]+)\./, "")));
    if (open.length) console.warn(`Publishing these later would drop their seo:\n  ${open.join("\n  ")}`);
  }
  // The whole site must be valid after the change, not just the edited page.
  if (report(validateAll(merged(site), pages.map(merged)))) {
    const transaction = client.transaction();
    let count = 0;
    for (const [id, seo] of Object.entries(changes)) {
      if (JSON.stringify(known.get(id).seo) === JSON.stringify(seo)) continue;
      count++;
      console.log(`${known.get(id).seo ? "update" : "add"} ${id}.seo`);
      // Refuses to overwrite an edit made since we read the document.
      transaction.patch(id, (p) => p.ifRevisionId(known.get(id)._rev).set({ seo }));
    }
    if (!count) console.log("Nothing to change.");
    else if (!flags.includes("--yes")) console.log(`Valid. ${count} document(s) would change. Nothing written; add --yes to write.`);
    else if (!token) throw new Error("SANITY_AUTH_TOKEN is not set.");
    else console.log(`Written: transaction ${(await transaction.commit()).transactionId}`);
  }
} else {
  console.error("Usage: node scripts/seo.mjs check | docs | write <file.json> [--yes]");
  process.exitCode = 1;
}
