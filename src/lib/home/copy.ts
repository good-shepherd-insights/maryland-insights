// Wording for the redesigned homepage. All of it is the homeRedesign document in Sanity.
const KEYS = [
  "heroTitle",
  "heroNote",
  "heroMeasured",
  "heroGuessed",
  "heroPause",
  "heroPlay",
  "partnersTitle",
  "servicesTitle",
  "servicesIncluded",
  "clientsTitle",
  "clientsLead",
  "compareTitle",
  "compareButton",
  "compareHint",
  "compareModalTitle",
  "comparePartial",
  "toolsTitle",
  "toolsRecordTitle",
  "toolsRecordBody",
  "stepsTitle",
  "faqTitle",
  "faqSearch",
  "ctaTitle",
  "ctaLabel",
  "footerTitle",
] as const;
export type HomeCopy = Record<(typeof KEYS)[number], string> & {
  heroWords: string[];
  clientOrder: string[];
  toolGroups: { title: string; tools: string[] }[];
  counts: Record<string, number>;
};

const isText = (v: unknown): v is string => typeof v === "string" && v.trim() !== "";

/** Missing wording stops the build, so a gap is never published. */
export function homeCopy(doc: any): HomeCopy {
  const missing = KEYS.filter((k) => !isText(doc?.[k]));
  if (missing.length) throw new Error(`homeRedesign in Sanity is missing: ${missing.join(", ")}`);
  const counts = Object.fromEntries((doc.countyCounts ?? []).filter((c: any) => isText(c?.county) && c.count > 0).map((c: any) => [c.county, c.count]));
  if (Object.keys(counts).length !== 24) throw new Error("homeRedesign.countyCounts in Sanity needs a count for each of the 24 counties.");
  return {
    ...(Object.fromEntries(KEYS.map((k) => [k, doc[k]])) as Record<(typeof KEYS)[number], string>),
    heroWords: (doc.heroWords ?? []).filter(isText).map((w: string) => w.trim()),
    clientOrder: (doc.clientOrder ?? []).filter(isText),
    toolGroups: (doc.toolGroups ?? []).filter((g: any) => isText(g?.title)).map((g: any) => ({ title: g.title, tools: (g.tools ?? []).filter(isText) })),
    counts,
  };
}
