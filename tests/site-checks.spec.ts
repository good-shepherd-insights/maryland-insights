import { describe, expect, it } from "vitest";
import { checkContent } from "../src/lib/contentCheck";
import { checkHosting, dnsOf, hostOf, networkOf } from "../src/lib/hostingCheck";
import { isPrivate } from "../src/lib/serverFacts";
import { checkTracking, containers } from "../src/lib/trackingCheck";
import { POST as content } from "../src/pages/api/content-check";
import { POST as hosting } from "../src/pages/api/hosting-check";
import { POST as tracking } from "../src/pages/api/tracking-check";

const base = new URL("https://www.a.com/");
const by = (rows: { label: string; value: string; found: boolean; icon?: string }[]) => Object.fromEntries(rows.map((r) => [r.label, r]));
const long = "word ".repeat(60);

describe("hosting check", () => {
  const run = (raw: string, shown = raw) => by(checkHosting(raw, shown, base));
  it("names the platform by its files and counts plugins once", () => {
    const r = run('<link rel="stylesheet" href="/wp-content/plugins/a/x.css"><script src="/wp-content/plugins/a/y.js"></script><script src="/wp-content/plugins/b/z.js"></script>');
    expect([r["Built with"].value, r["Built with"].icon, r["Plugins seen"].value]).toEqual(["WordPress", "/images/hosting/wordpress.svg", "2: a, b"]);
    expect(run('<meta name="generator" content="WordPress 6.4.2">')["Built with"].value).toBe("WordPress 6.4");
    expect(run("<p>We build WordPress sites</p>")["Built with"].found).toBe(false);
  });
  it("tells a page that needs scripts from one that does not", () => {
    expect(run(`<p>${long}</p>`)["Sent as a page"].found).toBe(true);
    expect(run("<div id=root></div>", `<p>${long}</p>`)["Sent as a page"]).toMatchObject({ found: false, value: "0% readable before scripts run" });
  });
  it("reads layout, encryption, images and outside scripts", () => {
    const r = run('<meta name="viewport" content="width=device-width"><img src="/a.webp" loading="lazy"><img src="http://b.com/c.jpg"><script src="https://b.com/x.js"></script><script src="https://cdn.a.com/y.js"></script><a href="http://c.com">c</a>');
    expect([r["Mobile layout"].found, r["Secure files"].value, r["Modern images"].value, r["Delayed images"].value, r["Outside scripts"].value]).toEqual([true, "1 loaded without encryption", "1 of 2", "1 of 2", "1: b.com"]);
  });
});

describe("hosting server facts", () => {
  it("names the host, network and name servers from what the server says", () => {
    expect([hostOf({ "x-vercel-id": "iad1::x" }), hostOf({ "wpe-backend": "apache" }), hostOf({ "host-header": "6b7412fb82ca5edfd0917e3957f05d89" }), hostOf({ server: "Squarespace" }), hostOf({ server: "nginx" })]).toEqual(["Vercel", "WP Engine", "SiteGround", "Squarespace", ""]);
    expect([networkOf({ "cf-ray": "8a-IAD", server: "cloudflare" }), networkOf({ "x-amz-cf-id": "x" }), networkOf({ server: "Apache" })]).toEqual(["Cloudflare", "Amazon CloudFront", ""]);
    expect([dnsOf(["ada.ns.cloudflare.com"]), dnsOf(["ns51.domaincontrol.com."]), dnsOf(["ns-1.awsdns-01.org"]), dnsOf(["ns1.example.net"])]).toEqual(["Cloudflare", "GoDaddy", "Amazon Route 53", ""]);
  });
  it("shows them in the result, with a logo only where there is one", () => {
    const r = by(checkHosting("<p>x</p>", "<p>x</p>", base, { headers: { server: "nginx", "cf-ray": "1" }, ns: ["ns1.example.net."], secureRedirect: false, ms: 1450 }));
    expect([r["Hosted by"], r["Delivery network"].icon, r["Domain name servers"], r["Server response"], r["Plain http"]]).toEqual([
      { label: "Hosted by", value: "nginx server, company not shown", found: true, icon: "/images/hosting/nginx.svg" }, "/images/hosting/cloudflare.svg",
      { label: "Domain name servers", value: "ns1.example.net", found: true }, { label: "Server response", value: "1.4 seconds", found: false }, { label: "Plain http", value: "Left unencrypted", found: false },
    ]);
    expect(by(checkHosting("<p>x</p>", "<p>x</p>", base))["Hosted by"]).toEqual({ label: "Hosted by", value: "Not identified", found: false });
    expect(by(checkHosting("<p>x</p>", "<p>x</p>", base, { headers: { server: "Squarespace" }, ns: [], secureRedirect: true, ms: 50 }))["Delivery network"]).toEqual({ label: "Delivery network", value: "Squarespace's own", found: true, icon: "/images/hosting/squarespace.svg" });
  });
  it("never lets the server be pointed at a private address", () => {
    expect(["10.0.0.1", "127.0.0.1", "169.254.169.254", "172.20.1.1", "192.168.1.1", "100.64.0.1", "::1", "fd00::1", "fe80::1", "::ffff:10.0.0.1", "nonsense"].every(isPrivate)).toBe(true);
    expect(["8.8.8.8", "172.32.0.1", "2606:4700::1111"].some(isPrivate)).toBe(false);
  });
});

describe("tracking check", () => {
  it("finds trackers on the page and in the Tag Manager", () => {
    const r = by(checkTracking('<script>gtm("GTM-ABC123")</script><script src="//cdn.callrail.com/x.js"></script>', ['{"vtp_tagId":"G-AB12CD34EF"},"AW-11003667490","https://www.clarity.ms/tag/","https://connect.facebook.net/en_US/fbevents.js","analytics.tiktok.com"']));
    expect(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, v.value]))).toEqual({ "Google Analytics": "G-AB12CD34EF", "Tag Manager": "GTM-ABC123", "Google Ads": "AW-11003667490", "Meta Pixel": "Installed", "Microsoft Ads": "Not detected", "Call tracking": "CallRail", "Session recording": "Microsoft Clarity", "Other trackers": "TikTok" });
  });
  it("is not fooled by words, comments or look-alikes", () => {
    expect(checkTracking("<p>We use CallRail, Clarity and Google Analytics.</p><!-- GTM-ABC123 G-AB12CD34EF --><p>MY-G-AB12CD34EF G-ABCDEFGHIJ</p>").every((x) => !x.found)).toBe(true);
    expect(by(checkTracking('<script>ga("create","UA-12345-1")</script>'))["Google Analytics"]).toMatchObject({ found: false, value: "Only the retired version" });
  });
  it("reads no more than three containers, each a real ID", () => {
    expect(containers("GTM-AAAA1 GTM-BBBB2 GTM-CCCC3 GTM-DDDD4 GTM-AAAA1 GTM-../../x")).toEqual(["GTM-AAAA1", "GTM-BBBB2", "GTM-CCCC3"]);
  });
});

describe("content check", () => {
  it("reads author, date, places, rules and sources", () => {
    const r = by(checkContent('<meta name="author" content="Jane Smith"><meta property="article:published_time" content="2026-03-02T10:00"><p>Roof permits in Frederick County cost $95.</p><a href="https://frederickcountymd.gov/x">c</a><a href="https://facebook.com/a">f</a><a href="https://b.org">b</a><h2>Do I need a permit?</h2>', base));
    expect([r["Named author"].value, r.Dated.value, r["Places named"].value, r["Local rules"].value, r["Official sources"].value, r["Other sources"].value, r.Prices.value, r["Questions answered"].value]).toEqual(["Jane Smith", "March 2, 2026", "Frederick County", "Mentions permits", "frederickcountymd.gov", "1 linked", "$95", "1 on the page"]);
    expect(by(checkContent('<meta name="author" content="admin">', base))["Named author"].found).toBe(false);
    expect(checkContent("<p>Quality you can trust.</p>", base).every((x) => !x.found)).toBe(true);
  });
});

describe("their endpoints", () => {
  it.each([["hosting", hosting], ["tracking", tracking], ["content", content]])("%s refuses what is not a public website", async (_, POST) => {
    for (const business of ["", "not a site", "http://127.0.0.1/a", "localhost", "169.254.169.254/latest"]) {
      const res = await POST({ request: new Request("https://x.test", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ business }) }), clientAddress: "1" } as any);
      expect(res.status).toBe(400);
    }
  });
});
