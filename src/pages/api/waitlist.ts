export const prerender = false;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CRM_TIMEOUT_MS = 8000;

export async function POST({ request }: { request: Request }) {
  const contentType = request.headers.get("content-type") ?? "";
  const body = contentType.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries(await request.formData().catch(() => new FormData()));

  const primaryEmail = String(body.email ?? "").trim().toLowerCase();

  if (!emailPattern.test(primaryEmail)) {
    return new Response(null, { status: 400 });
  }

  if (!import.meta.env.TWENTY_API_KEY) {
    return new Response(null, { status: 500 });
  }

  try {
    const res = await fetch("https://crm.marylandinsights.com/rest/waitlists", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.TWENTY_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: { primaryEmail } }),
      signal: AbortSignal.timeout(CRM_TIMEOUT_MS),
    });
    return new Response(null, { status: res.ok ? 200 : 500 });
  } catch {
    return new Response(null, { status: 500 });
  }
}
