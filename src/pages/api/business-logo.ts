import type { APIContext } from "astro";

export const prerender = false;

// Free requests use api.microlink.io. A pro key uses pro.microlink.io with x-api-key.
// https://microlink.io/docs/api/basics/endpoint
// https://microlink.io/docs/api/basics/authentication
const FREE_ENDPOINT = "https://api.microlink.io";
const PRO_ENDPOINT = "https://pro.microlink.io";
const TIMEOUT_MS = 8000;

type LogoPayload = {
  status?: string;
  data?: { logo?: { url?: unknown } | null };
};

/** Return a JSON response with the requested status code. */
function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Reject loopback, link-local, and private addresses before they are sent upstream. */
function isPrivateHost(hostname: string): boolean {
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname.endsWith(".local")) return true;
  const ipv4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(hostname);
  if (ipv4) {
    const parts = ipv4.slice(1).map(Number);
    if (parts.some((part) => part > 255)) return true;
    const [a, b] = parts;
    if (a === 0 || a === 10 || a === 127) return true;
    if (a === 169 && b === 254) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;
    return false;
  }
  const ipv6 = hostname.toLowerCase();
  return ipv6 === "::1" || ipv6.startsWith("fc") || ipv6.startsWith("fd") || ipv6.startsWith("fe80");
}

/** Accept a public http(s) website URL and nothing else. */
function publicWebsite(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length < 8 || trimmed.length > 300) return null;
  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return null;
  }
  if (url.username !== "" || url.password !== "") return null;
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const hostname = url.hostname.replace(/\.$/, "").toLowerCase();
  if (hostname === "" || isPrivateHost(hostname)) return null;
  return url.toString();
}

/** Keep only an https logo URL from the Microlink payload. */
function httpsLogo(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2000) return null;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username !== "" || url.password !== "") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/** Look up the logo for a business website through Microlink's logo API. */
export async function POST({ request }: APIContext): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return json(400, { error: "bad-request" });

  const body = (await request.json().catch(() => null)) as { url?: unknown } | null;
  const website = publicWebsite(body?.url);
  if (!website) return json(400, { error: "bad-request" });

  const apiKey = import.meta.env.MICROLINK_API_KEY;
  const hasKey = typeof apiKey === "string" && apiKey !== "";
  const params = new URLSearchParams({ url: website, filter: "logo" });
  const endpoint = `${hasKey ? PRO_ENDPOINT : FREE_ENDPOINT}?${params}`;

  let payload: LogoPayload;
  try {
    const res = await fetch(endpoint, {
      headers: hasKey ? { "x-api-key": apiKey } : {},
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) {
      console.error(`[business-logo] microlink ${res.status}`);
      return json(502, { error: "logo-unavailable" });
    }
    payload = (await res.json()) as LogoPayload;
  } catch {
    return json(502, { error: "logo-unavailable" });
  }

  if (payload.status !== "success") return json(200, { logoUrl: null });
  return json(200, { logoUrl: httpsLogo(payload.data?.logo?.url) });
}
