import { describe, expect, it } from "vitest";
import { checkFollowUp, contactPage, identity } from "../src/lib/followUpCheck";
import { checkContent } from "../src/lib/contentCheck";
import { aboutPage, checkProof } from "../src/lib/geoCheck";
import { checkHosting } from "../src/lib/hostingCheck";
import { checkTracking } from "../src/lib/trackingCheck";
import { attr, blocks, scan, textOf } from "../src/lib/htmlScan";
import { checkSchema } from "../src/lib/schemaCheck";

const base = new URL("https://www.a.com/");
const fill = (s: string, size = 2_000_000) => s.repeat(Math.ceil(size / s.length)).slice(0, size);

describe("reading pages from anyone", () => {
  for (const bad of ['<a href="/x" ', '<a href="x">', '<a href="', "<a ", "<a b", "<h2 ", "<", "<!--", "<button ", "<script ", "<svg>", "<svg/>", "<meta ", "<link ", "<form>", "<form><input ", "<li><a>Services</a><ul>", "<ul>", "1,1", "1,", "$1,", "Howard, Carroll, ", "A, B, C Counties ", "for over 1", "MHIC ", "&amp", '<script type="application/ld+json">', '<script type="application/ld+json">{"@type":"Plumber"}</script>', "class=review ", '<div class="', "since 1", "(301) 5"]) {
    it(`stays quick on ${JSON.stringify(bad)}`, () => {
      const page = fill(bad), start = performance.now();
      checkProof(page, page, base); aboutPage(page, base); checkFollowUp(page, page); contactPage(page, base); identity(page); checkSchema(page, "a.com");
      expect(performance.now() - start).toBeLessThan(6000);
    }, 60_000);
  }
  const hour = (n: number, days: number) => `<script type="application/ld+json">{"@graph":[{"@type":"Plumber","name":"A","openingHoursSpecification":[${Array(n).fill('{"@id":"h"}').join()}]},{"@id":"h","@type":"OpeningHoursSpecification","opens":"07:00","closes":"19:00","dayOfWeek":[${Array(days).fill('"Monday"').join()}]}]}</script>`;
  const twins = `<script type="application/ld+json">{"@graph":[${Array(400).fill(`{"@type":"Plumber","name":"A","sameAs":[${Array(200).fill('"https://b.com"').join()}]}`).join()}]}</script>`;
  for (const [what, page] of [["repeated hours", hour(800, 800)], ["very many hours", hour(40_000, 40_000)], ["the same business many times", twins], ["deep nesting", `<script type="application/ld+json">${'{"a":'.repeat(5000)}1${"}".repeat(5000)}</script>`], ["one huge attribute", `<a ${fill("a:-", 1_900_000)}>`], ["many attributes", fill('<a a="1" b="2" c="3" d="4">')]] as const)
    it(`stays quick on ${what}`, () => {
      const start = performance.now();
      checkSchema(page, "a.com"); checkProof(page, page, base); checkFollowUp(page, page);
      expect(performance.now() - start).toBeLessThan(6000);
    }, 60_000);
  it("reads past a very long tag and letters that change length", () => {
    const { pieces } = scan(`<div style="${"x:y;".repeat(2000)}">In</div>`);
    expect(textOf(pieces)).toBe("In");
    expect(textOf(scan("İİİ<script>$99</script><p>Out</p>").pieces)).toBe("İİİ Out");
    expect(attr(scan('<a data-x="1" href = "/y" href="/z">').pieces[0].tag!, "href")).toBe("/y");
  });
  it("reads ordinary and broken markup", () => {
    const { pieces } = scan('<p>One<!-- two --><a href="/x" title="a > b">Three<a href=/y>Four</a><script>five</script>');
    expect(textOf(pieces)).toBe("One Three Four");
    expect(blocks(pieces, ["a"]).map((b) => [attr(b.tag, "href"), b.text])).toEqual([["/x", "Three"], ["/y", "Four"]]);
  });
});
