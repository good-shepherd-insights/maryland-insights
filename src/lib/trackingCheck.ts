import { checkFollowUp } from "./followUpCheck";
import type { ProofRow } from "./geoCheck";
import { dropComments } from "./htmlScan";

/** Reads a site's homepage and contact page for the tools that measure it. */
const CALLS: Record<string, RegExp> = { CallRail: /cdn\.callrail\.com|\/\/(?:[\w-]{1,60}\.)?callrail\.com/i, CallTrackingMetrics: /\.tctm\.(?:co|xyz)/i, WhatConverts: /scripts\.iconnode\.com|whatconverts\.com/i, Invoca: /invocacdn\.com|solutions\.invoca/i, Marchex: /adinsight\.com|marchex\.io/i, Ringba: /b-js\.ringba\.com/i, "Service Direct": /callscan\.servicedirect/i, "ServiceTitan DNI": /static\.servicetitan\.com|st-dni/i };
const PIXELS: Record<string, RegExp> = { Meta: /connect\.facebook\.net\/[\w/]{0,20}fbevents\.js|facebook\.com\/tr\?id=/i, "Google Ads": /\bAW-\d{6,14}\b|googleadservices\.com\/pagead\/conversion/i, Microsoft: /bat\.bing\.com\/bat\.js/i, TikTok: /analytics\.tiktok\.com/i, LinkedIn: /snap\.licdn\.com/i, Nextdoor: /ads\.nextdoor\.com/i };
const SESSIONS: Record<string, RegExp> = { "Microsoft Clarity": /clarity\.ms\/tag/i, Hotjar: /static\.hotjar\.com/i, "Lucky Orange": /luckyorange\.(?:com|net)/i, FullStory: /fullstory\.com\/s\/fs\.js/i, "Crazy Egg": /script\.crazyegg\.com/i, Mouseflow: /cdn\.mouseflow\.com/i };
const CONSENT: Record<string, RegExp> = { OneTrust: /cdn\.cookielaw\.org|otSDKStub/i, Cookiebot: /consent\.cookiebot\.com/i, CookieYes: /cdn-cookieyes\.com|cookie-law-info/i, Complianz: /complianz-gdpr/i, Termly: /app\.termly\.io/i, Osano: /cmp\.osano\.com/i, iubenda: /cdn\.iubenda\.com/i, Usercentrics: /app\.usercentrics\.eu/i, "Cookie Notice": /plugins\/cookie-notice\//i, Ketch: /global\.ketchcdn\.com/i };

export function checkTracking(home: string, contact: string | null): ProofRow[] {
  const html = [home, contact ?? ""].map(dropComments).join("\n");
  const tools = (list: Record<string, RegExp>) => Object.entries(list).filter(([, p]) => p.test(html)).map(([n]) => n).slice(0, 3).join(", ");
  const row = (label: string, value: string, found = Boolean(value)): ProofRow => ({ label, value: value || "Not detected", found });
  const follow = Object.fromEntries(checkFollowUp(home, contact).map((r) => [r.label, r]));
  const ga = /\bG-(?=[A-Z0-9]{0,11}\d)[A-Z0-9]{8,12}\b/.exec(html)?.[0], old = /\bUA-\d{4,12}-\d{1,3}\b/.test(html);
  const gtm = /\bGTM-[A-Z0-9]{4,10}\b/.exec(html)?.[0];
  return [
    row("Google Analytics", ga ?? (old ? "Only the retired version" : ""), Boolean(ga)),
    row("Tag manager", gtm ?? ""),
    row("Call tracking", tools(CALLS)),
    row("Tap to call", follow["Tap to call"].found ? "Yes" : "", follow["Tap to call"].found),
    row("Lead form", follow["Lead form"].found ? follow["Lead form"].value : ""),
    row("Ad tracking", tools(PIXELS)),
    row("Session recording", tools(SESSIONS)),
    row("Consent tool", tools(CONSENT)),
  ];
}
