import type { ProofRow } from "./geoCheck";
import { dropComments } from "./htmlScan";

/** Reads a homepage and its public Tag Manager containers for trackers and analytics, by what they load. */
const ANALYTICS: Record<string, RegExp> = { Plausible: /plausible\.io\/js/i, Fathom: /cdn\.usefathom\.com/i, Matomo: /matomo\.(?:js|php)|cdn\.matomo\.cloud/i, "Adobe Analytics": /assets\.adobedtm\.com|omtrdc\.net/i, Mixpanel: /cdn\.mxpnl\.com/i, PostHog: /\.posthog\.com\/static/i, "Cloudflare Analytics": /static\.cloudflareinsights\.com/i, Amplitude: /cdn\.amplitude\.com/i, Heap: /cdn\.heapanalytics\.com/i };
const CALLS: Record<string, RegExp> = { CallRail: /cdn\.callrail\.com|\/\/(?:[\w-]{1,60}\.)?callrail\.com/i, CallTrackingMetrics: /\.tctm\.(?:co|xyz)/i, WhatConverts: /scripts\.iconnode\.com|whatconverts\.com/i, Invoca: /invocacdn\.com|solutions\.invoca/i, Marchex: /adinsight\.com|marchex\.io/i, Ringba: /b-js\.ringba\.com/i, "ServiceTitan DNI": /marketing-ads[\\\/]{1,4}dni|st-dni/i };
const META = /connect\.facebook\.net\/[\w\/]{0,20}fbevents\.js|facebook\.com\/tr\?id=|connect\.facebook\.net\\?\/[\w\\\/]{0,20}fbevents/i;
const MICROSOFT = /bat\.bing\.com\\?\/bat\.js|bat\.bing\.com/i;
const SESSIONS: Record<string, RegExp> = { "Microsoft Clarity": /clarity\.ms/i, Hotjar: /static\.hotjar\.com/i, "Lucky Orange": /luckyorange\.(?:com|net)/i, FullStory: /fullstory\.com\\?\/s\\?\/fs\.js/i, "Crazy Egg": /script\.crazyegg\.com/i, Mouseflow: /cdn\.mouseflow\.com/i };
const OTHERS: Record<string, RegExp> = { TikTok: /analytics\.tiktok\.com/i, LinkedIn: /snap\.licdn\.com/i, Pinterest: /s\.pinimg\.com\\?\/ct/i, Nextdoor: /ads\.nextdoor\.com/i, Snapchat: /sc-static\.net\\?\/scevent/i, X: /static\.ads-twitter\.com/i, Reddit: /redditstatic\.com\\?\/ads/i, HubSpot: /js(?:-\w{1,6})?\.hs-(?:scripts|analytics)\.(?:com|net)/i, "Trade Desk": /js\.adsrvr\.org/i };

/** The Tag Manager containers a page loads. */
export const containers = (home: string): string[] => [...new Set([...dropComments(home).matchAll(/\bGTM-[A-Z0-9]{4,10}\b/g)].map(([id]) => id))].slice(0, 3);

export function checkTracking(home: string, tags: string[] = []): ProofRow[] {
  const page = dropComments(home), all = [page, ...tags].join("\n");
  const row = (label: string, value: string, found = Boolean(value)): ProofRow => ({ label, value: value || "Not detected", found });
  const named = (list: Record<string, RegExp>) => {
    const n = Object.entries(list).filter(([, p]) => p.test(all)).map(([name]) => name);
    return n.slice(0, 3).join(", ") + (n.length > 3 ? ` and ${n.length - 3} more` : "");
  };
  const ids = (p: RegExp) => [...new Set([...all.matchAll(p)].map(([id]) => id))];
  const list = (found: string[]) => (found.length > 2 ? `${found[0]} and ${found.length - 1} more` : found.join(", "));
  // A measurement ID always has a digit, and stands alone rather than inside a longer name.
  const ga = ids(/(?<![\w-])G-(?=[A-Z]{0,11}\d)[A-Z0-9]{8,12}(?![\w-])/g), ads = ids(/(?<![\w-])AW-\d{8,12}(?!\d)/g);
  const old = /(?<![\w-])UA-\d{4,12}-\d{1,3}(?!\d)/.test(page);
  return [
    row("Google Analytics", list(ga) || (old ? "Only the retired version" : ""), ga.length > 0),
    row("Tag Manager", list(containers(home))),
    row("Google Ads", list(ads)),
    row("Meta Pixel", META.test(all) ? "Installed" : ""),
    row("Microsoft Ads", MICROSOFT.test(all) ? "Installed" : ""),
    row("Call tracking", named(CALLS)),
    row("Session recording", named(SESSIONS)),
    row("Other trackers", [named(ANALYTICS), named(OTHERS)].filter(Boolean).join(", ")),
  ];
}
