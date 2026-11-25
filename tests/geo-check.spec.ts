import { describe, expect, it } from "vitest";
import { aboutPage, checkProof } from "../src/lib/geoCheck";
import { POST } from "../src/pages/api/geo-check";

const base = new URL("https://www.a.com/");
const rows = (home: string, about: string | null = null) => Object.fromEntries(checkProof(home, about, base).map((r) => [r.label, r]));

describe("geo check", () => {
  it("counts service pages by address or by the Services menu", () => {
    expect(rows('<a href="/services/roofing">R</a><a href="/services/roofing/">R</a><a href="/services/siding">S</a>')["Service pages"].value).toBe("2 linked");
    expect(rows('<li><a href="/services">Services</a><ul><li><a href="/roof-repair">Roof</a><ul><li><a href="/slate">Slate</a></li></ul></li><li><a href="/gutters">G</a></li></ul></li><li><a href="/about">About</a></li>')["Service pages"].value).toBe("3 linked");
    expect(rows('<li><a href="/services">Services</a></li><li><a href="/x">About</a><ul><li><a href="/y">Y</a></li><li><a href="/z">Z</a></li></ul></li>')["Service pages"].found).toBe(false);
  });
  it("counts services by name without counting the same one per town", () => {
    expect(rows('<a href="/roofing">Roofing</a><a href="/siding">Siding</a><a href="/roofing-olney">Roofing in Olney</a><a href="/blog/roofing">Roofing blog</a><a href="/roof-calculator">Roof calculator</a>')["Service pages"].value).toBe("2 linked");
  });
  it("names Maryland places", () => {
    expect(rows("<p>Serving Frederick County and Montgomery County.</p>")["Places named"].value).toBe("Frederick County and Montgomery County");
    expect(rows("<p>Serving Howard, Carroll, and Frederick Counties.</p>")["Places named"].found).toBe(true);
    expect(rows("<p>We serve everyone.</p>")["Places named"].found).toBe(false);
  });
  it("tells a price from an offer", () => {
    expect(rows("<p>Drain cleaning from $99</p>").Prices.value).toBe("$99");
    expect(rows("<p>$500 off any roof. Save $50. $2 million insured.</p>").Prices.found).toBe(false);
  });
  it("needs a license number, not the word licensed", () => {
    expect(rows("<p>MHIC #12345</p>").License.value).toBe("MHIC #12345");
    expect(rows("<p>Licensed and insured since forever</p>").License.found).toBe(false);
  });
  it("finds work, customer words, a record and questions", () => {
    const r = rows('<a href="/gallery">Gallery</a><blockquote>Great</blockquote><p>Serving Maryland since 1987</p><h3>How long does a roof last?</h3><h3>Do you offer estimates?</h3>');
    expect([r["Finished work"].value, r["Customer words"].value, r["Track record"].value, r["Questions answered"].value]).toEqual(["“Gallery” page", "Quoted on the page", "Since 1987", "2 on the page"]);
    expect(Object.values(rows("<p>Experienced, reliable, affordable.</p>")).every((x) => !x.found)).toBe(true);
  });
  it("ignores text in scripts and comments", () => {
    expect(Object.values(rows("<script>MHIC #12345 $99 Frederick County</script><!-- since 1987 -->")).every((x) => !x.found)).toBe(true);
  });
  it("finds the site's own about page only", () => {
    expect(aboutPage('<a href="https://b.com/about">About</a><a href="/about-us/">About Us</a>', base)?.href).toBe("https://www.a.com/about-us");
    expect(aboutPage('<a href="/">About</a>', base)).toBeNull();
  });
  it("refuses a request without a website", async () => {
    const res = await POST({ request: new Request("https://x.test", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }), clientAddress: "1" } as any);
    expect(res.status).toBe(400);
  });
});
