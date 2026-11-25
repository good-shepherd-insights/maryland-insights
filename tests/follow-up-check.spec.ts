import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkFollowUp, contactPage, identity } from "../src/lib/followUpCheck";
import { POST } from "../src/pages/api/follow-up-check";

const rows = (home: string, contact: string | null = null) => Object.fromEntries(checkFollowUp(home, contact).map((r) => [r.label, r]));
const base = new URL("https://www.a.com/");

describe("follow-up check", () => {
  it("tells a request form from a signup, a search and a login", () => {
    expect(rows('<form><input name="n"><input type="email"><textarea name="m"></textarea></form>')["Lead form"].value).toBe("On the homepage");
    expect(rows("", '<form><input type="email"><input type="tel"></form>')["Lead form"].value).toBe("On the contact page");
    const signup = rows('<form><input name="first"><input name="last"><input type="email"></form>');
    expect([signup["Lead form"].found, signup["Email signup"].found]).toEqual([false, true]);
    const none = rows('<form role="search"><input type="email"></form><form><input type="email"><input type="password"></form><!--<form><input type="email"></form>-->');
    expect([none["Lead form"].found, none["Email signup"].found]).toEqual([false, false]);
    expect(rows('<form><input type="email"><input type="tel"><textarea></textarea> Unsubscribe any time</form>')["Lead form"].found).toBe(true);
    expect(rows('<form><input name="n"><input type="email"><textarea name="g-recaptcha-response"></textarea></form>')["Lead form"].found).toBe(false);
  });
  it("separates a tappable number from plain text", () => {
    expect(rows('<a href="tel:+13015551212">Call</a>')["Tap to call"]).toMatchObject({ found: true });
    expect(rows("<p>Call (301) 555-1212</p>")["Tap to call"]).toMatchObject({ found: false, value: "The phone number is not a link" });
    expect(rows("<p>Hi</p>")["Tap to call"].value).toBe("None detected");
  });
  it("finds tools by what loads, not by what is mentioned", () => {
    const r = rows('<script src="https://connect.podium.com/widget.js"></script><script src="https://static.klaviyo.com/x.js"></script><a href="https://calendly.com/a">x</a>');
    expect([r["Chat or text"].value, r["Automation tool"].value, r["Online booking"].value]).toEqual(["Podium", "Klaviyo", "Calendly"]);
    const said = rows("<p>We integrate with Podium, HubSpot, Mailchimp and Calendly.</p>");
    expect(Object.values(said).every((x) => !x.found)).toBe(true);
  });
  it("reads a booking button, but not an estimate button", () => {
    expect(rows("<a href='#'><i></i> Schedule Now</a>")["Online booking"].value).toBe("“Schedule Now” button");
    expect(rows("<a>Book Your Free Estimate</a>")["Online booking"].found).toBe(false);
  });
  it("finds the site's own contact page only", () => {
    expect(contactPage('<link href="/wp-content/contact-form-7/styles.css"><a href="/files/contact.pdf">contact</a><a href="https://b.com/contact">contact</a><a href="/contact-us/?x=1">Contact</a>', base)?.href).toBe("https://www.a.com/contact-us/");
    expect(contactPage('<a href="mailto:contact@a.com">c</a><a href="javascript:contact()">c</a>', base)).toBeNull();
  });
  it("only takes a secure logo", () => {
    expect(identity('<meta property="og:site_name" content="A &amp; B"><img src="https://a.com/logo.png">')).toEqual({ name: "A & B", logo: "https://a.com/logo.png" });
    expect(identity('<img src="javascript:logo">').logo).toBeNull();
  });
});

describe("follow-up check API", () => {
  let n = 0;
  const send = (business: string) => POST({ clientAddress: `f${n}`, request: new Request("https://m.com/api/follow-up-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business }) }) });
  const ok = (html: string) => new Response(JSON.stringify({ html: { success: true, data: html } }));
  beforeEach(() => { n++; vi.stubEnv("CONTEXT_DEV_API_KEY", "k"); vi.spyOn(console, "error").mockImplementation(() => {}); });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("reads the contact page too, and only calls the page reader", async () => {
    const f = vi.fn().mockResolvedValueOnce(ok('<a href="/contact">Contact</a>')).mockResolvedValueOnce(ok('<form><input type="email"><textarea></textarea></form>')); vi.stubGlobal("fetch", f);
    const d = await (await send("two-pages.com")).json();
    expect(d.rows[0]).toMatchObject({ label: "Lead form", value: "On the contact page" });
    expect(f.mock.calls.map((c) => c[0])).toEqual(Array(2).fill("https://api.context.dev/v1/web/scrape"));
  });
  it("says so when the contact page cannot be read", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce(ok('<a href="/contact">Contact</a>')).mockRejectedValueOnce(new Error("slow")));
    expect((await (await send("one-page.com")).json()).notes).toHaveLength(1);
  });
  it("reports an unreadable site", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(JSON.stringify({ html: { success: false, data: null } }))));
    expect((await send("gone.com")).status).toBe(422);
  });
});
