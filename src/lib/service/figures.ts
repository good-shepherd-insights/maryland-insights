// Sourced figures for the service pages live in the serviceFigures document in Sanity.
// A figure, when there is one, stands in for the block's own before and after.
const TEXT = ["title", "metricLabel", "before", "after", "context", "changes", "sourceLabel", "sourceUrl"] as const;

export function withFigure(block: any, figure: any): any {
  if (!figure?.before || !figure?.after) return block;
  const own = Object.fromEntries(TEXT.filter((k) => figure[k]).map((k) => [k, figure[k]]));
  const ui = Object.fromEntries((["beforeLabel", "afterLabel", "changesLabel"] as const).filter((k) => figure[k]).map((k) => [k, figure[k]]));
  // The section keeps its original address, so links to it still work.
  return { ...block, ...own, anchorTitle: block.title, ui: { ...block.ui, ...ui } };
}

/** A result of zero is a placeholder, not a result. */
export const realOutcomes = (outcomes: any[] | undefined) => (outcomes ?? []).filter((o) => String(o?.value ?? "").trim() !== "" && Number(o.value) !== 0);
