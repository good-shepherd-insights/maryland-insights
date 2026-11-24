// Real, sourced figures for the service pages. Each number was read from the page it links to
// (November 2026). They replace the illustrative values still held in Sanity.
type Figure = { title?: string; metricLabel: string; before: string; after: string; beforeLabel: string; afterLabel: string; context: string; changes?: string; changesLabel?: string; sourceLabel: string; sourceUrl: string };

const FIGURES: Record<string, Figure> = {
  "website-hosting": {
    metricLabel: "Sites passing Core Web Vitals on mobile, October 2026",
    before: "49%", after: "72%", beforeLabel: "WordPress", afterLabel: "Astro",
    context: "HTTP Archive's technology report, built on real Chrome visits: 1,231,557 of 2,513,839 WordPress sites pass on mobile, against 38,350 of 53,101 Astro sites. Astro is the framework this site is built with. These are averages for each platform, not a promise for your site, and a well-kept WordPress site can beat a neglected Astro one.",
    changes: "The gap comes from moving the render out of the request path and answering from cache instead of a server, then cutting payload at build time through image optimization and a smaller JavaScript bundle. For context, roughly half of mobile sites pass Core Web Vitals web-wide, so the realistic goal is not a perfect score but clearing the threshold reliably.",
    changesLabel: "What it means",
    sourceLabel: "HTTP Archive technology report", sourceUrl: "https://httparchive.org/reports/techreport/tech?tech=WordPress,Astro",
  },
  "analytics-reporting": {
    metricLabel: "Home services calls answered by a person, 2026",
    before: "38%", after: "45%", beforeLabel: "Answered calls that are leads", afterLabel: "Leads that convert on the call",
    context: "Invoca's 2026 home services benchmarks, measured on its own call platform. Standard website analytics ends at a session and a click on a phone link, so it sees neither figure. A joined pipeline carries the visit through the call, into the CRM, and back out with the job outcome attached.",
    sourceLabel: "Invoca home services benchmarks 2026", sourceUrl: "https://invoca.com/reports/the-invoca-home-services-lead-conversion-benchmarks-report-2026",
  },
  "marketing-automation": {
    metricLabel: "Calls to home services businesses",
    before: "27%", after: "<3%", beforeLabel: "Calls not answered", afterLabel: "Voicemail callers who leave a message",
    context: "Around 27 percent of calls to home services businesses go unanswered, and fewer than 3 percent of callers sent to voicemail leave a message. Both come from Invoca's 2024 platform data rather than independent research, so treat them as directional. More than 40 percent of high-intent inquiries arrive evenings and weekends.",
    sourceLabel: "Invoca, missed sales calls", sourceUrl: "https://www.invoca.com/blog/how-much-missed-sales-calls-cost-home-services-businesses",
  },
  "ai-powered-content": {
    title: "AI is common. Specific content is not.",
    metricLabel: "Marketers surveyed for 2026",
    before: "75%", after: "84%", beforeLabel: "Have adopted AI", afterLabel: "Still run generic campaigns",
    context: "Salesforce's State of Marketing 2026, a survey of 4,450 marketers. Adopting a model did not make the output specific. Records it can draw on do.",
    changes: "The time saving is in drafting, not in review. Review stays deliberately slow because verifying jurisdiction claims against the issuing authority takes as long as it takes.",
    changesLabel: "What it means",
    sourceLabel: "Salesforce State of Marketing 2026", sourceUrl: "https://www.salesforce.com/news/stories/state-of-marketing-2026/",
  },
};

export function realFigure(slug: string, block: any): any {
  const figure = FIGURES[slug];
  if (!figure) return block;
  const { beforeLabel, afterLabel, changesLabel = block.ui?.changesLabel, ...rest } = figure;
  // The section keeps its original address, so links to it still work.
  return { ...block, ...rest, anchorTitle: block.title, ui: { ...block.ui, beforeLabel, afterLabel, changesLabel } };
}

/** Contents labels that named the old figure. */
export const TOC_LABEL: Record<string, string> = { "Load time example": "Core Web Vitals", Turnaround: "AI and generic content" };

/** A result of zero is a placeholder, not a result. */
export const realOutcomes = (outcomes: any[] | undefined) => (outcomes ?? []).filter((o) => String(o?.value ?? "").trim() !== "" && Number(o.value) !== 0);
