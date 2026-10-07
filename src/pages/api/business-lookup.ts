import type { APIContext } from "astro";

export const prerender = false;

const AUTOCOMPLETE_URL = "https://places.googleapis.com/v1/places:autocomplete";
const DETAILS_BASE = "https://places.googleapis.com/v1/places/";
const AUTOCOMPLETE_FIELD_MASK =
  "suggestions.placePrediction.placeId,suggestions.placePrediction.text,suggestions.placePrediction.types,suggestions.placePrediction.structuredFormat.mainText,suggestions.placePrediction.structuredFormat.secondaryText";

// A Place ID can identify an address, region, or landmark as well as a business.
// Only predictions explicitly classified by Google as establishments are eligible.
const NON_BUSINESS_TYPES = new Set([
  "country",
  "administrative_area",
  "administrative_area_level_1",
  "administrative_area_level_2",
  "administrative_area_level_3",
  "administrative_area_level_4",
  "administrative_area_level_5",
  "administrative_area_level_6",
  "administrative_area_level_7",
  "locality",
  "sublocality",
  "sublocality_level_1",
  "sublocality_level_2",
  "sublocality_level_3",
  "sublocality_level_4",
  "sublocality_level_5",
  "neighborhood",
  "postal_code",
  "postal_code_prefix",
  "postal_code_suffix",
  "postal_town",
  "plus_code",
  "route",
  "street_address",
  "street_number",
  "premise",
  "subpremise",
  "geocode",
  "intersection",
  "natural_feature",
  "political",
]);
const DETAILS_FIELD_MASK =
  "id,displayName.text,types,formattedAddress,nationalPhoneNumber,primaryType,primaryTypeDisplayName.text,googleMapsTypeLabel.text,rating,userRatingCount,addressComponents.longText,addressComponents.types,websiteUri,googleMapsUri,googleMapsLinks.placeUri,googleMapsLinks.reviewsUri,iconMaskBaseUri,iconBackgroundColor";

const PLACE_ID_PATTERN = /^[A-Za-z0-9_-]{10,90}$/;
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/g;

const GOOGLE_TIMEOUT_MS = 5000;

/** Return a JSON response with the requested status code. */
function json(status: number, payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Trim and limit an external string without coercing other value types. */
function cap(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed.slice(0, max);
}

/** Keep only finite numeric values from an external response. */
function numberOr(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

type Suggestion = {
  placePrediction?: {
    placeId?: string;
    text?: { text?: string };
    types?: string[];
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
  };
};

type Place = {
  id?: string;
  displayName?: { text?: string };
  types?: string[];
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  primaryType?: string;
  primaryTypeDisplayName?: { text?: string };
  googleMapsTypeLabel?: { text?: string };
  rating?: number;
  userRatingCount?: number;
  addressComponents?: Array<{ longText?: string; types?: string[] }>;
  websiteUri?: string;
  googleMapsUri?: string;
  googleMapsLinks?: {
    placeUri?: string;
    reviewsUri?: string;
  };
  iconMaskBaseUri?: string;
  iconBackgroundColor?: string;
};

/** Accept establishment predictions while excluding geographic places. */
function isBusiness(types: unknown): boolean {
  if (!Array.isArray(types)) return false;
  const placeTypes = types.filter((type): type is string => typeof type === "string");
  return placeTypes.includes("establishment") && !placeTypes.some((type) => NON_BUSINESS_TYPES.has(type));
}

/** Allow only Google's map icon host when building a category icon URL. */
function googleIconUrl(value: unknown): string | null {
  const base = cap(value, 300);
  if (!base) return null;
  try {
    const url = new URL(base);
    if (url.protocol !== "https:" || url.hostname !== "maps.gstatic.com") return null;
    return `${url.toString()}.svg`;
  } catch {
    return null;
  }
}

/** Accept a six-digit color value for the category icon background. */
function hexColor(value: unknown): string | null {
  const color = cap(value, 7);
  return color && /^#[0-9a-f]{6}$/i.test(color) ? color : null;
}

/** Log a bounded Google error and return a public-safe failure response. */
async function googleError(res: Response, mode: string): Promise<Response> {
  const body = await res.text().catch(() => "");
  let message = body.slice(0, 900);
  try {
    const parsed = JSON.parse(body) as { error?: { status?: string; message?: string; details?: unknown[] } };
    const details = Array.isArray(parsed.error?.details)
      ? ` | ${parsed.error.details.map((d) => JSON.stringify(d)).join(" ")}`
      : "";
    message = `${parsed.error?.status ?? res.status}: ${parsed.error?.message ?? "unknown"}${details}`.slice(0, 900);
  } catch {
    /* keep raw snippet */
  }
  console.error(`[business-lookup] ${mode} failed → ${message}`);
  return json(502, { error: "lookup-failed" });
}

/** Return a bounded set of business autocomplete predictions. */
async function handleAutocomplete(apiKey: string, query: string): Promise<Response> {
  let data: { suggestions?: Suggestion[] };
  try {
    const res = await fetch(AUTOCOMPLETE_URL, {
      method: "POST",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": AUTOCOMPLETE_FIELD_MASK,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: `${query} Maryland, USA`,
        regionCode: "US",
        includePureServiceAreaBusinesses: true,
      }),
      signal: AbortSignal.timeout(GOOGLE_TIMEOUT_MS),
    });
    if (!res.ok) return googleError(res, "autocomplete");
    data = (await res.json()) as { suggestions?: Suggestion[] };
  } catch {
    return json(502, { error: "lookup-failed" });
  }

  // Whitelist only: never forward raw Google payloads or error bodies.
  const results = (Array.isArray(data.suggestions) ? data.suggestions : [])
    .map((suggestion) => {
      const prediction = suggestion.placePrediction;
      if (!prediction || typeof prediction.placeId !== "string") return null;
      const types = Array.isArray(prediction.types) ? prediction.types : [];
      if (!isBusiness(types)) return null;
      const detail = cap(prediction.structuredFormat?.secondaryText?.text, 200)?.replace(/^[\s–—-]+/, "") ?? "";
      return {
        placeId: prediction.placeId,
        name: cap(prediction.structuredFormat?.mainText?.text, 120) ?? cap(prediction.text?.text, 120) ?? "",
        detail,
      };
    })
    .filter((item): item is { placeId: string; name: string; detail: string } => item !== null && item.name !== "")
    .slice(0, 5);

  return json(200, results);
}

/** Fetch and whitelist the selected business's Places details. */
async function handleDetails(apiKey: string, placeId: string): Promise<Response> {
  let place: Place;
  try {
    const res = await fetch(`${DETAILS_BASE}${encodeURIComponent(placeId)}`, {
      headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": DETAILS_FIELD_MASK },
      signal: AbortSignal.timeout(GOOGLE_TIMEOUT_MS),
    });
    if (!res.ok) return googleError(res, "details");
    place = (await res.json()) as Place;
  } catch {
    return json(502, { error: "lookup-failed" });
  }

  if (!isBusiness(place.types)) {
    return json(422, { error: "not-business" });
  }

  const countyComponent = (Array.isArray(place.addressComponents) ? place.addressComponents : []).find(
    (component) => Array.isArray(component.types) && component.types.includes("administrative_area_level_2"),
  );
  const mapsLinks = place.googleMapsLinks;

  // Whitelist only: pick each field explicitly and cap lengths; no raw Google data leaks through.
  return json(200, {
    placeId: cap(place.id, 90),
    name: cap(place.displayName?.text, 120),
    phone: cap(place.nationalPhoneNumber, 30),
    address: cap(place.formattedAddress, 200),
    county: cap(countyComponent?.longText, 60),
    category:
      cap(place.googleMapsTypeLabel?.text, 80) ??
      cap(place.primaryTypeDisplayName?.text, 80) ??
      cap(place.primaryType, 80),
    categoryIconUrl: googleIconUrl(place.iconMaskBaseUri),
    categoryIconBackground: hexColor(place.iconBackgroundColor),
    website: cap(place.websiteUri, 300),
    rating: numberOr(place.rating),
    reviewCount: numberOr(place.userRatingCount),
    mapsUrl: cap(mapsLinks?.placeUri, 300) ?? cap(place.googleMapsUri, 300),
    reviewsUrl: cap(mapsLinks?.reviewsUri, 300),
  });
}

/** Validate incoming autocomplete or details requests. */
export async function POST({ request }: APIContext): Promise<Response> {
  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return json(400, { error: "bad-request" });
  }

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body || typeof body !== "object") {
    return json(400, { error: "bad-request" });
  }

  const mode = body.mode;
  if (mode !== "autocomplete" && mode !== "details") {
    return json(400, { error: "bad-request" });
  }

  let query = "";
  let placeId = "";
  if (mode === "autocomplete") {
    if (typeof body.query !== "string") return json(400, { error: "bad-request" });
    query = body.query.replace(CONTROL_CHARS, "").trim();
    if (query.length < 3 || query.length > 80) return json(400, { error: "bad-request" });
  } else {
    if (typeof body.placeId !== "string" || !PLACE_ID_PATTERN.test(body.placeId)) {
      return json(400, { error: "bad-request" });
    }
    placeId = body.placeId;
  }

  const apiKey = import.meta.env.GOOGLE_PLACES_API_KEY;
  if (typeof apiKey !== "string" || apiKey === "") {
    return json(503, { error: "not-configured" });
  }

  return mode === "autocomplete" ? handleAutocomplete(apiKey, query) : handleDetails(apiKey, placeId);
}
