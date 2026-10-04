export const prerender = false;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LEN = 2000;

function normalizeLead(body: Record<string, unknown>) {
  const clean: Record<string, string> = {};
  for (const [key, value] of Object.entries(body)) {
    if (typeof value === "string" && key !== "website") {
      clean[key] = value.trim().slice(0, MAX_FIELD_LEN);
    }
  }
  return clean;
}

export async function POST({ request }: { request: Request }) {
  const contentType = request.headers.get("content-type") ?? "";
  const raw = contentType.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries(await request.formData().catch(() => new FormData()));

  const lead = normalizeLead(raw as Record<string, unknown>);

  // Honeypot: silently accept bot submissions without processing them.
  if (typeof raw.website === "string" && raw.website !== "") {
    return new Response(null, { status: 204 });
  }

  const email = (lead.email ?? "").toLowerCase();
  if (!emailPattern.test(email)) {
    return new Response(null, { status: 400 });
  }

  if (!import.meta.env.TWENTY_API_KEY) {
    return new Response(null, { status: 500 });
  }

  const res = await fetch("https://crm.marylandinsights.com/rest/newsletter", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${import.meta.env.TWENTY_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email: { primaryEmail: email } }),
  });

  return new Response(null, { status: res.ok ? 200 : 500 });
}
