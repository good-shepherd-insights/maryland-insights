export const prerender = false;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CRM_TIMEOUT_MS = 8000;

/** A contact message becomes a note in the CRM, with how to reach the sender. */
export async function POST({ request }: { request: Request }) {
  const contentType = request.headers.get("content-type") ?? "";
  const parsed: unknown = contentType.includes("application/json")
    ? await request.json().catch(() => ({}))
    : Object.fromEntries(await request.formData().catch(() => new FormData()));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return new Response(null, { status: 400 });
  const raw = parsed as Record<string, unknown>;

  // Honeypot: accept bot submissions without processing them.
  if (typeof raw.website === "string" && raw.website !== "") return new Response(null, { status: 204 });

  const text = (key: string, max: number) => (typeof raw[key] === "string" ? (raw[key] as string).trim().slice(0, max) : "");
  const name = text("name", 200).replace(/\s+/g, " ");
  const email = text("email", 200).toLowerCase();
  const phone = text("phone", 60).replace(/\s+/g, " ");
  const message = text("message", 5000);
  if (!name || !message || !emailPattern.test(email)) return new Response(null, { status: 400 });

  if (!import.meta.env.TWENTY_API_KEY) return new Response(null, { status: 500 });

  const markdown = [`Name: ${name}`, `Email: ${email}`, phone && `Phone: ${phone}`, message].filter(Boolean).join("\n\n");
  try {
    const res = await fetch("https://crm.marylandinsights.com/rest/notes", {
      method: "POST",
      headers: { Authorization: `Bearer ${import.meta.env.TWENTY_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ title: `Contact form: ${name}`, bodyV2: { markdown } }),
      signal: AbortSignal.timeout(CRM_TIMEOUT_MS),
    });
    return new Response(null, { status: res.ok ? 200 : 502 });
  } catch {
    return new Response(null, { status: 502 });
  }
}
