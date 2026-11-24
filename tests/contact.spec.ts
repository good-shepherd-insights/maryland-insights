import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/pages/api/contact";

const send = (body: unknown) => POST({ request: new Request("https://marylandinsights.com/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }) });
const good = { name: "Jo Agency", email: "Jo@Example.com", phone: "240 555 0100", message: "Hello" };

describe("contact API", () => {
  beforeEach(() => vi.stubEnv("TWENTY_API_KEY", "test-key"));
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

  it("rejects incomplete messages without calling the CRM", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    for (const body of [null, {}, { ...good, email: "nope" }, { ...good, message: " " }, { ...good, name: "" }]) expect((await send(body)).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("drops honeypot submissions", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    expect((await send({ ...good, website: "x" })).status).toBe(204);
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("sends every field and reports success only when the CRM accepts it", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 201 })).mockResolvedValueOnce(new Response(null, { status: 400 })).mockRejectedValueOnce(new Error("down"));
    vi.stubGlobal("fetch", fetchMock);
    expect((await send(good)).status).toBe(200);
    const sent = JSON.parse(fetchMock.mock.calls[0][1].body);
    for (const part of ["Jo Agency", "jo@example.com", "240 555 0100", "Hello"]) expect(sent.bodyV2.markdown).toContain(part);
    expect((await send(good)).status).toBe(502);
    expect((await send(good)).status).toBe(502);
  });
});
