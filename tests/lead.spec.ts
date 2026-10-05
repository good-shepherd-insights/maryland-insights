import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../src/pages/api/lead";

const request = (body: unknown) =>
  new Request("https://marylandinsights.com/api/lead", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("lead API", () => {
  beforeEach(() => {
    vi.stubEnv("TWENTY_API_KEY", "test-key");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("rejects a JSON null body without calling the CRM", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    expect((await POST({ request: request(null) })).status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the business and Place ID with the email in the existing CRM fields", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    const response = await POST({
      request: request({
        email: " Owner@Example.com ",
        business: " Tehrani Law, LLC ",
        googlePlaceId: "ChIJ1234567890",
      }),
    });

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://crm.marylandinsights.com/rest/newsletter");
    expect(JSON.parse(options.body as string)).toEqual({
      email: { primaryEmail: "owner@example.com" },
      name: "Tehrani Law, LLC | Google Place ID: ChIJ1234567890",
    });
    expect(options.signal).toBeInstanceOf(AbortSignal);
  });

  it("returns 502 when the CRM rejects or cannot complete the request", async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(new Response(null, { status: 503 })).mockRejectedValueOnce(new Error("offline"));
    vi.stubGlobal("fetch", fetchMock);
    const lead = { email: "owner@example.com" };

    expect((await POST({ request: request(lead) })).status).toBe(502);
    expect((await POST({ request: request(lead) })).status).toBe(502);
  });
});
