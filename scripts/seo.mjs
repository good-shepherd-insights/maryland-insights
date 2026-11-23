// Checks and writes the SEO data held in Sanity. See docs/SEO.md.
//   node scripts/seo.mjs check              site-wide problems fail; page problems are listed
//   node scripts/seo.mjs check --strict     any problem fails
//   node scripts/seo.mjs write file.json    check and show what would change (writes nothing)
//   node scripts/seo.mjs write file.json --yes   check, then write
//   node scripts/seo.mjs docs               rebuild docs/SEO.md from the contract
// file.json maps document _id to its complete fields:
//   {"seo-site": {...}, "seo-<page id>": {...}, "seo-<other id>": null}   null deletes an override
import { createClient } from "@sanity/client";
import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { ALL_QUERY, SITE_ID, overrideId } from "../src/lib/seo/contract.mjs";
import { editorGuide } from "../src/lib/seo/guide.mjs";
import { resolveAll } from "../src/lib/seo/resolve.mjs";
import { formatProblems } from "../src/lib/seo/validate.mjs";

const [command, ...rest] = process.argv.slice(2);
const flags = rest.filter((a) => a.startsWith("--"));
const file = rest.find((a) => !a.startsWith("--"));
const token = process.env.SANITY_AUTH_TOKEN;
const client = createClient({ projectId: "089yj83f", dataset: "production", apiVersion: "2026-01-01", useCdn: false, ...(command === "write" && token ? { token } : {}) });

const report = ({ stop, report, pages }, strict) => {
  if (stop.length) console.error(`${stop.length} site-wide problem(s):\n${formatProblems(stop)}`);
  if (report.length) console.warn(`${report.length} page problem(s):\n${formatProblems(report)}`);
  const failed = stop.length > 0 || (strict && report.length > 0);
  if (failed) process.exitCode = 1;
  else console.log(`${pages.length} pages checked, ${pages.filter((p) => p.seo.noindex).length} kept out of search.`);
  return !failed;
};
const fileExists = (p) => existsSync(new URL(`../public${p}`, import.meta.url));
const clean = (doc) => Object.fromEntries(Object.entries(doc).filter(([k]) => !["_rev", "_createdAt", "_updatedAt", "_system"].includes(k)).sort(([a], [b]) => a.localeCompare(b)));

if (command === "check") {
  report(resolveAll(await client.fetch(ALL_QUERY), { fileExists }), flags.includes("--strict"));
} else if (command === "docs") {
  await writeFile(new URL("../docs/SEO.md", import.meta.url), editorGuide());
} else if (command === "write" && file) {
  const changes = JSON.parse(await readFile(file, "utf8"));
  const data = await client.fetch(ALL_QUERY);
  const pageOf = new Map(data.pages.map((p) => [overrideId(p._id), p._id]));
  const current = new Map([data.site.seo, ...data.overrides].filter(Boolean).map((d) => [d._id, d]));
  const next = new Map();
  for (const [id, fields] of Object.entries(changes)) {
    if (id !== SITE_ID && !pageOf.has(id) && !(fields === null && current.has(id))) throw new Error(`${id} is not ${SITE_ID} or seo-<published page id>.`);
    if (id === SITE_ID && fields === null) throw new Error(`${SITE_ID} cannot be deleted.`);
    next.set(id, fields === null ? null : {
      ...Object.fromEntries(Object.entries(fields).filter(([k]) => !k.startsWith("_"))), _id: id,
      ...(id === SITE_ID ? { _type: "seoSite" } : { _type: "pageSeo", page: { _type: "reference", _ref: pageOf.get(id), _weak: true } }),
    });
  }
  const after = new Map([...current, ...next]);
  const result = resolveAll({
    ...data, site: { ...data.site, seo: after.get(SITE_ID) ?? null },
    overrides: [...after.values()].filter((d) => d && d._id !== SITE_ID),
  }, { fileExists });
  // The whole site must be clean after a write, not just the edited page.
  if (report(result, true)) {
    const transaction = client.transaction();
    let count = 0;
    for (const [id, doc] of next) {
      const old = current.get(id);
      if (!doc) {
        if (!old) continue;
        // Refuses to touch a document changed since we read it.
        transaction.patch(id, (p) => p.ifRevisionId(old._rev).set({ _deleting: true })).delete(id);
      } else if (!old) transaction.create(doc);
      else if (JSON.stringify(clean(old)) === JSON.stringify(clean(doc))) continue;
      else {
        const removed = Object.keys(old).filter((k) => !k.startsWith("_") && !(k in doc));
        const { _id, _type, ...fields } = doc;
        transaction.patch(id, (p) => p.ifRevisionId(old._rev).set(fields).unset(removed));
      }
      count++;
      console.log(`${!doc ? "delete" : old ? "update" : "create"} ${id}`);
    }
    if (!count) console.log("Nothing to change.");
    else if (!flags.includes("--yes")) console.log(`Valid. ${count} document(s) would change. Nothing written; add --yes to write.`);
    else if (!token) throw new Error("SANITY_AUTH_TOKEN is not set.");
    else console.log(`Written: transaction ${(await transaction.commit()).transactionId}`);
  }
} else {
  console.error("Usage: node scripts/seo.mjs check [--strict] | docs | write <file.json> [--yes]");
  process.exitCode = 1;
}
