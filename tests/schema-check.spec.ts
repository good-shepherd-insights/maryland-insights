import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { checkSchema, homepage } from "../src/lib/schemaCheck";
import { POST } from "../src/pages/api/schema-check";

const page = (...blocks: unknown[]) => blocks.map((b) => `<script type="application/ld+json">${typeof b === "string" ? b : JSON.stringify(b)}</script>`).join("");
const rows = (html: string) => Object.fromEntries(checkSchema(html, "x.com").rows.map((r) => [r.label, r]));

describe("schema check", () => {
  it("reads facts, and calls an empty field blank", () => {
    const html = page(
      { "@graph": [{ "@type": "Organization", "@id": "#o", name: "Acme, LLC", logo: { url: "https://x.com/l.png" }, url: "https://www.x.com" }] },
      { "@type": "LocalBusiness", name: "Acme, LLC", telephone: "1", address: { streetAddress: "1 A St", addressLocality: "Frederick", addressRegion: "MD", postalCode: "21701" }, geo: { latitude: "", longitude: "" }, openingHoursSpecification: [{ dayOfWeek: ["https://schema.org/Monday", "Tuesday", "Wednesday"], opens: "07:00", closes: "19:00" }] },
    );
    const r = rows(html), c = checkSchema(html, "x.com");
    expect(c.name).toBe("Acme, LLC");
    expect(c.logo).toBe("https://x.com/l.png");
    expect(r["Business type"]).toMatchObject({ value: "LocalBusiness", status: "found" });
    expect(r.Address.value).toBe("1 A St, Frederick, MD 21701");
    expect(r.Hours.value).toBe("Monday to Wednesday, 7:00 to 19:00");
    expect(r["Map location"].status).toBe("blank");
    expect(r["Service area"].status).toBe("missing");
    expect(r.Website.value).toBe("x.com");
  });
  it("prefers the specific type, and calls a bare Organization generic", () => {
    expect(rows(page({ "@type": ["LocalBusiness", "RoofingContractor"], name: "A" }))["Business type"].value).toBe("RoofingContractor");
    expect(rows(page({ "@type": "Organization", name: "A" }))["Business type"].status).toBe("generic");
  });
  it("does not borrow another company's facts", () => {
    const html = page({ "@type": "Plumber", name: "A" }, { "@type": "Organization", name: "Partner", telephone: "9" }, { "@type": "Review", author: { "@type": "Organization", name: "A", telephone: "8" } });
    expect(rows(html).Phone.status).toBe("missing");
  });
  it("survives broken, commented-out and absent schema", () => {
    expect(checkSchema(page("{bad"), "x.com")).toMatchObject({ invalidBlocks: 1, hasSchema: false, name: "x.com" });
    expect(checkSchema(`<!--${page({ "@type": "Plumber", name: "A" })}-->`, "x.com").hasSchema).toBe(false);
    expect(checkSchema("<p itemtype='https://schema.org/Plumber'>", "x.com").hasMicrodata).toBe(true);
    expect(checkSchema(page([null, 1, "a", { "@type": 5, name: {} }]), "x.com").rows).toHaveLength(8);
  });
  it("reads past a line break inside a value", () => {
    expect(checkSchema(page('{"@type":"Plumber","name":"A\nB"}'), "x.com")).toMatchObject({ name: "A B", invalidBlocks: 0 });
  });
  it("only accepts public websites", () => {
    expect(homepage("Acme.com/contact?x=1")?.href).toBe("https://acme.com/");
    for (const bad of ["", "acme", "localhost", "127.0.0.1", "http://[::1]/", "http://2130706433", "file:///etc/passwd", "https://u:p@a.com", "a.com:8080", "x.internal", "a b.com", 5]) expect(homepage(bad)).toBeNull();
  });
});

describe("schema check API", () => {
  let n = 0;
  const send = (body: unknown) => POST({ clientAddress: `ip${n}`, request: new Request("https://m.com/api/schema-check", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
  const reply = (html: string, type = "text/html") => new Response(JSON.stringify({ bytes: { success: true, data: { contentType: type, base64: Buffer.from(html).toString("base64") } } }));
  beforeEach(() => { n++; vi.stubEnv("CONTEXT_DEV_API_KEY", "k"); vi.spyOn(console, "error").mockImplementation(() => {}); });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it("rejects bad input before spending a credit", async () => {
    const f = vi.fn(); vi.stubGlobal("fetch", f);
    for (const b of [null, [], {}, { business: "nope" }, { business: "a.com", website: "bot" }]) expect((await send(b)).status).toBe(400);
    expect(f).not.toHaveBeenCalled();
  });
  it("only ever calls the page reader, and caches a site", async () => {
    const f = vi.fn().mockImplementation(async () => reply(page({ "@type": "Plumber", name: "A" }))); vi.stubGlobal("fetch", f);
    expect(await (await send({ business: "cached-site.com" })).json()).toMatchObject({ name: "A" });
    await send({ business: "https://cached-site.com/about" });
    expect(f).toHaveBeenCalledTimes(1);
    expect(f.mock.calls[0][0]).toBe("https://api.context.dev/v1/web/scrape");
  });
  it("reports unreadable sites and limits repeats", async () => {
    vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => reply("x", "application/pdf")));
    for (let i = 0; i < 10; i++) expect((await send({ business: `s${i}.com` })).status).toBe(422);
    expect((await send({ business: "s99.com" })).status).toBe(429);
  });
  it("says so when no key is set", async () => {
    vi.stubEnv("CONTEXT_DEV_API_KEY", "");
    expect((await send({ business: "a.com" })).status).toBe(503);
  });
});
