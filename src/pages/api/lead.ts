import { auditServiceFromSlug } from "@/lib/crm/auditService";

export const prerender = false;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LEN = 2000;
const CRM_TIMEOUT_MS = 8000;

/** Trim and cap submitted text fields before sending lead data to the CRM. */
function normalizeLead(body: Record<string, unknown>) {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string" && key !== "website") {
      clean[key] = value.trim().slice(0, MAX_FIELD_LEN);
    }
  }
  return clean;
}

/** Validate a lead and store its email on an audit report. */
export async function POST({ request }: { request: Request }) {
  const contentType = request.headers.get("content-type") ?? "";
  const parsed: unknown = contentType.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries(await request.formData().catch(() => new FormData()));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    return new Response(null, { status: 400 });
  }
  const raw = parsed as Record<string, unknown>;

  const lead = normalizeLead(raw);

  // Honeypot: silently accept bot submissions without processing them.
  if (typeof raw.website === "string" && raw.website !== "") {
    return new Response(null, { status: 204 });
  }

  const email = (lead.email ?? "").toLowerCase();
  const service = auditServiceFromSlug(lead.service ?? "");
  if (!emailPattern.test(email) || !service) {
    return new Response(null, { status: 400 });
  }

  if (!import.meta.env.TWENTY_API_KEY) {
    return new Response(null, { status: 500 });
  }

  try {
    const res = await fetch("https://crm.marylandinsights.com/rest/audits", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.TWENTY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: [email],
        service,
      }),
      signal: AbortSignal.timeout(CRM_TIMEOUT_MS),
    });
    return new Response(null, { status: res.ok ? 200 : 502 });
  } catch {
    return new Response(null, { status: 502 });
  }
}
