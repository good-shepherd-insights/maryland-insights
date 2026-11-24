// Picks the background for each block so two neighbors never share a color.
export type Tone = "white" | "cream" | "gold" | "red" | "ink";

const START: Record<string, Tone[]> = {
  leadCapture: ["white"], authorByline: ["gold"], tableOfContents: ["ink"], featureGrid: ["white", "cream"], process: ["cream", "white"],
  proof: ["gold", "ink"], localNap: ["white", "cream"], caseStudy: ["cream", "white"], serviceArea: ["ink", "cream", "white"], honestTakeCallout: ["white", "cream"],
  comparisonTable: ["cream", "white"], trust: ["white", "cream"], toolCallout: ["gold", "ink"], aiSearchSection: ["cream", "white"],
  resourcesDirectory: ["cream", "white"], pricingTiers: ["cream", "white"], relatedArticles: ["gold", "cream"], recognitionBadges: ["white", "cream"], trustSignals: ["white", "cream"],
};
// Blocks that finish on a different color than they start on.
const END: Record<string, Tone> = { process: "ink", caseStudy: "ink", aiSearchSection: "red", trust: "gold" };

export function planTones(blocks: { _type: string; [key: string]: any }[]): Tone[] {
  let prev: Tone | "" = "";
  return blocks.map((block) => {
    const options: Tone[] = block._type === "richText" ? (block.tone === "dark" ? ["red", "ink"] : ["white", "cream"]) : (START[block._type] ?? ["white", "cream"]);
    const tone = options.find((option) => option !== prev) ?? options[0];
    prev = (block._type === "aiSearchSection" && !block.honestTake) || (block._type === "caseStudy" && !block.outcomes?.length) ? tone : (END[block._type] ?? tone);
    return tone;
  });
}
