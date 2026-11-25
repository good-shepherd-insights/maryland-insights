import { describe, expect, it } from "vitest";
import { checkContent } from "../src/lib/contentCheck";
import { checkHosting } from "../src/lib/hostingCheck";
import { checkTracking } from "../src/lib/trackingCheck";
import { POST as content } from "../src/pages/api/content-check";
import { POST as hosting } from "../src/pages/api/hosting-check";
import { POST as tracking } from "../src/pages/api/tracking-check";

const base = new URL("https://www.a.com/");
const by = (rows: { label: string; value: string; found: boolean }[]) => Object.fromEntries(rows.map((r) => [r.label, r]));
const long = "word ".repeat(60);

describe("hosting check", () => {
  const run = (raw: string, shown = raw) => by(checkHosting(raw, shown, base));
  it("names the platform by its files and counts plugins once", () => {
    const r = run('<link rel="stylesheet" href="/wp-content/plugins/a/x.css"><script src="/wp-content/plugins/a/y.js"></script><script src="/wp-content/plugins/b/z.js"></script>');
    expect([r["Built with"].value, r["Plugins seen"].value]).toEqual(["WordPress", "2 on the homepage"]);
    expect(run("<p>We build WordPress sites</p>")["Built with"].found).toBe(false);
  });
  it("tells a page that needs scripts from one that does not", () => {
    expect(run(`<p>${long}</p>`)["Sent as a page"].found).toBe(true);
    expect(run("<div id=root></div>", `<p>${long}</p>`)["Sent as a page"]).toMatchObject({ found: false, value: "0% readable before scripts run" });
  });
  it("reads layout, encryption, images and outside scripts", () => {
    const r = run('<meta name="viewport" content="width=device-width"><img src="/a.webp" loading="lazy"><img src="http://b.com/c.jpg"><script src="https://b.com/x.js"></script><script src="https://cdn.a.com/y.js"></script><a href="http://c.com">c</a>');
    expect([r["Mobile layout"].found, r["Secure files"].value, r["Modern images"].value, r["Delayed images"].value, r["Outside scripts"].value]).toEqual([true, "1 loaded without encryption", "1 of 2", "1 of 2", "From 1 company’s server"]);
  });
});

describe("tracking check", () => {
  it("finds tools by what loads", () => {
    const r = by(checkTracking('<script src="https://www.googletagmanager.com/gtag/js?id=G-AB12CD34EF"></script><script>gtm("GTM-ABC123")</script><script src="//cdn.callrail.com/x.js"></script><script src="https://www.clarity.ms/tag/x"></script>', null));
    expect([r["Google Analytics"].value, r["Tag manager"].value, r["Call tracking"].value, r["Session recording"].value]).toEqual(["G-AB12CD34EF", "GTM-ABC123", "CallRail", "Microsoft Clarity"]);
    expect(by(checkTracking("<p>We use CallRail and Google Analytics</p>", null))["Call tracking"].found).toBe(false);
    expect(by(checkTracking('<script>ga("create","UA-12345-1")</script>', null))["Google Analytics"]).toMatchObject({ found: false, value: "Only the retired version" });
    expect(by(checkTracking("<!-- GTM-ABC123 -->", null))["Tag manager"].found).toBe(false);
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
