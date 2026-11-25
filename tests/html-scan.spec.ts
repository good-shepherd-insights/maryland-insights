import { describe, expect, it } from "vitest";
import { checkFollowUp, contactPage, identity } from "../src/lib/followUpCheck";
import { aboutPage, checkProof } from "../src/lib/geoCheck";
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
  it("reads ordinary and broken markup", () => {
    const { pieces } = scan('<p>One<!-- two --><a href="/x" title="a > b">Three<a href=/y>Four</a><script>five</script>');
    expect(textOf(pieces)).toBe("One Three Four");
    expect(blocks(pieces, ["a"]).map((b) => [attr(b.tag, "href"), b.text])).toEqual([["/x", "Three"], ["/y", "Four"]]);
  });
});
