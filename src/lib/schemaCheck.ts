import { attr, dropComments, scan } from "./htmlScan";

/** Reads a page's JSON-LD and reports the business facts in it, the way a machine would find them. */
export type CheckStatus = "found" | "blank" | "missing" | "generic";
export type CheckRow = { label: string; value: string; status: CheckStatus };
export type SchemaCheck = { name: string; logo: string | null; hasSchema: boolean; invalidBlocks: number; hasMicrodata: boolean; rows: CheckRow[] };

type Node = Record<string, unknown>;
const isNode = (v: unknown): v is Node => typeof v === "object" && v !== null && !Array.isArray(v);
const list = (v: unknown): unknown[] => (Array.isArray(v) ? v : v === undefined || v === null ? [] : [v]);

const NAMED: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", ndash: "–", mdash: "—", rsquo: "’", lsquo: "‘" };
const decode = (s: string) =>
  s.replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (all, code: string) => {
    if (code[0] !== "#") return NAMED[code.toLowerCase()] ?? all;
    const n = code[1].toLowerCase() === "x" ? parseInt(code.slice(2), 16) : Number(code.slice(1));
    return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : all;
  });
const text = (v: unknown, max = 120): string => {
  const raw = typeof v === "number" ? String(v) : typeof v === "string" ? v : isNode(v) ? text(v["@value"], max) : "";
  return decode(raw).replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
};
const first = (v: unknown, max?: number) => list(v).map((x) => text(x, max)).find(Boolean) ?? "";
const bare = (v: unknown) => text(v).replace(/^https?:\/\/schema\.org\//i, "").replace(/^schema:/, "");
const typesOf = (n: Node) => list(n["@type"]).map(bare).filter(Boolean);

// Names a business uses that do not say it is a local one.
const ORGANIZATION = new Set(["Organization", "Corporation", "OnlineBusiness", "NGO", "Brand"]);
// schema.org's LocalBusiness types, so a specific type is told apart from a person, page or product.
const LOCAL = new Set(
  "LocalBusiness AnimalShelter ArchiveOrganization AutomotiveBusiness AutoBodyShop AutoDealer AutoPartsStore AutoRental AutoRepair AutoWash GasStation MotorcycleDealer MotorcycleRepair ChildCare Dentist DryCleaningOrLaundry EmergencyService FireStation Hospital PoliceStation EmploymentAgency EntertainmentBusiness AdultEntertainment AmusementPark ArtGallery Casino ComedyClub MovieTheater NightClub FinancialService AccountingService AutomatedTeller BankOrCreditUnion InsuranceAgency FoodEstablishment Bakery BarOrPub Brewery CafeOrCoffeeShop Distillery FastFoodRestaurant IceCreamShop Restaurant Winery GovernmentOffice PostOffice HealthAndBeautyBusiness BeautySalon DaySpa HairSalon HealthClub NailSalon TattooParlor HomeAndConstructionBusiness Electrician GeneralContractor HVACBusiness HousePainter Locksmith MovingCompany Plumber RoofingContractor InternetCafe LegalService Attorney Notary Library LodgingBusiness BedAndBreakfast Campground Hostel Hotel Motel Resort SkiResort VacationRental MedicalBusiness CommunityHealth Dermatology DietNutrition Emergency Geriatric Gynecologic MedicalClinic Midwifery Nursing Obstetric Oncologic Optician Optometric Otolaryngologic Pediatric Pharmacy Physician IndividualPhysician PhysiciansOffice Physiotherapy PlasticSurgery Podiatric PrimaryCare Psychiatric PublicHealth CovidTestingFacility VeterinaryCare ProfessionalService RadioStation RealEstateAgent RecyclingCenter SelfStorage ShoppingCenter SportsActivityLocation BowlingAlley ExerciseGym GolfCourse PublicSwimmingPool SportsClub StadiumOrArena TennisComplex Store BikeStore BookStore ClothingStore ComputerStore ConvenienceStore DepartmentStore ElectronicsStore Florist FurnitureStore GardenStore GroceryStore HardwareStore HobbyShop HomeGoodsStore JewelryStore LiquorStore MensClothingStore MobilePhoneStore MovieRentalStore MusicStore OfficeEquipmentStore OutletStore PawnShop PetStore ShoeStore SportingGoodsStore TireShop ToyStore WholesaleStore TelevisionStation TouristInformationCenter TravelAgency Landscaper".split(" "),
);
const localTypes = (n: Node) => typesOf(n).filter((t) => LOCAL.has(t));
const isBusiness = (n: Node) => localTypes(n).length > 0 || typesOf(n).some((t) => ORGANIZATION.has(t));

/** A field that is present but says nothing is blank, not found. */
function hasValue(v: unknown): boolean {
  if (Array.isArray(v)) return v.some(hasValue);
  if (isNode(v)) return Object.entries(v).some(([k, x]) => k !== "@type" && k !== "@id" && k !== "@context" && hasValue(x));
  return typeof v === "number" || text(v) !== "";
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
function days(v: unknown): string {
  const found = [...new Set(list(v).map(bare))].filter((d) => DAYS.includes(d)).sort((a, b) => DAYS.indexOf(a) - DAYS.indexOf(b));
  if (found.length > 2 && DAYS.indexOf(found.at(-1)!) - DAYS.indexOf(found[0]) === found.length - 1) return `${found[0]} to ${found.at(-1)}`;
  return found.join(", ");
}
const time = (v: unknown) => text(v, 20).replace(/^0(\d)/, "$1").replace(/^(\d{1,2}:\d{2}):\d{2}.*$/, "$1");

function hours(n: Node): string {
  // Days that share the same times read as one line.
  const groups = new Map<string, unknown[]>();
  for (const s of list(n.openingHoursSpecification).filter(isNode)) {
    const opens = time(s.opens), closes = time(s.closes);
    if (opens && closes) groups.set(`${opens} to ${closes}`, [...(groups.get(`${opens} to ${closes}`) ?? []), ...list(s.dayOfWeek)]);
  }
  const lines = [...groups].map(([t, d]) => [days(d), t].filter(Boolean).join(", "));
  return (lines.length ? lines : list(n.openingHours).map((x) => text(x)).filter(Boolean)).join("; ").slice(0, 160);
}
function address(v: unknown): string {
  for (const a of list(v)) {
    if (!isNode(a)) { if (text(a)) return text(a, 160); continue; }
    const street = first(a.streetAddress), city = first(a.addressLocality), region = first(a.addressRegion), zip = first(a.postalCode, 12);
    const line = [street, city, [region, zip].filter(Boolean).join(" ")].filter(Boolean).join(", ");
    if (line) return line.slice(0, 160);
  }
  return "";
}
function location(v: unknown): string {
  for (const g of list(v).filter(isNode)) {
    const lat = text(g.latitude, 24), lon = text(g.longitude, 24);
    if (lat && lon && Math.abs(Number(lat)) <= 90 && Math.abs(Number(lon)) <= 180 && !(Number(lat) === 0 && Number(lon) === 0)) return `${Number(Number(lat).toFixed(4))}, ${Number(Number(lon).toFixed(4))}`;
  }
  return "";
}
const some = (names: string[]) => {
  const u = [...new Set(names.filter(Boolean))];
  return u.slice(0, 3).join(", ") + (u.length > 3 ? ` and ${u.length - 3} more` : "");
};
function areas(v: unknown): string {
  return some(list(v).flatMap((a) => (isNode(a) ? [first(a.name) || address(a.address) || (hasValue(a.geoMidpoint) || hasValue(a.postalCode) ? "Mapped area" : "")] : [text(a)])));
}
const host = (v: unknown) => {
  try {
    const u = new URL(text(v, 300));
    return /^https?:$/.test(u.protocol) ? u.hostname.replace(/^(www|m)\./, "") : "";
  } catch { return ""; }
};
/** Image and web addresses inside schema, kept only when they are safe to load. */
function image(v: unknown): string | null {
  for (const i of list(v)) {
    const raw = isNode(i) ? first(i.url, 600) || first(i.contentUrl, 600) : text(i, 600);
    try { const u = new URL(raw); if (u.protocol === "https:") return u.href; } catch { /* not an address */ }
  }
  return null;
}

export function checkSchema(html: string, domain: string): SchemaCheck {
  const nodes: Node[] = [];
  let invalidBlocks = 0, hasSchema = false;
  const collect = (v: unknown, depth = 0): void => {
    if (depth > 6 || nodes.length > 400) return;
    if (Array.isArray(v)) return v.forEach((x) => collect(x, depth + 1));
    if (!isNode(v)) return;
    nodes.push(v);
    // Only the page's own subject: a reviewer's or supplier's details are not this business.
    for (const key of ["@graph", "mainEntity", "about", "publisher", "mainEntityOfPage"]) collect(v[key], depth + 1);
  };
  const live = dropComments(html);
  for (const { tag } of scan(html, true).pieces) {
    if (tag?.name !== "script" || !tag.body || !/^application\/ld\+json/i.test(attr(tag, "type"))) continue;
    const body = tag.body.trim().replace(/^(?:\/\/)?\s{0,20}<!\[CDATA\[/, "").replace(/(?:\/\/)?\s{0,20}\]\]>$/, "").trim();
    if (!body) continue;
    // Line breaks inside a value are a common slip that readers get past.
    try { collect(JSON.parse(body.replace(/[\u0000-\u001f]+/g, " "))); hasSchema = true; } catch { invalidBlocks++; }
  }
  const byId = new Map<string, Node>();
  for (const n of nodes) { const id = text(n["@id"], 300); if (id && Object.keys(n).length > 1) byId.set(id, { ...byId.get(id), ...n }); }
  const resolve = (v: unknown): unknown => (Array.isArray(v) ? v.map(resolve) : isNode(v) && Object.keys(v).length === 1 && v["@id"] ? byId.get(text(v["@id"], 300)) ?? v : v);

  const FIELDS = ["name", "telephone", "address", "openingHoursSpecification", "openingHours", "geo", "areaServed", "sameAs", "url", "logo"];
  const score = (n: Node) => (localTypes(n).some((t) => t !== "LocalBusiness") ? 200 : localTypes(n).length ? 100 : 0) + FIELDS.filter((f) => hasValue(n[f])).length;
  const businesses = nodes.filter((n) => isBusiness(n) && Object.keys(n).some((k) => k !== "@id" && k !== "@type")).sort((a, b) => score(b) - score(a));
  const main = businesses[0];
  // One business is often described twice, so the same name counts as the same business.
  const key = (n: Node) => first(n.name).toLowerCase().replace(/[^a-z0-9]/g, "");
  const id = main && text(main["@id"], 300);
  const same = main ? businesses.filter((n) => n === main || (id && text(n["@id"], 300) === id) || (key(main) && key(n) === key(main))) : [];

  const row = (label: string, fields: string[], read: (n: Node) => string): CheckRow => {
    for (const n of same) {
      const value = read(Object.fromEntries(Object.entries(n).map(([k, v]) => [k, resolve(v)])));
      if (value) return { label, value, status: "found" };
    }
    const present = same.some((n) => fields.some((f) => f in n));
    return { label, value: "", status: present ? "blank" : "missing" };
  };
  const type = row("Business type", ["@type"], (n) => {
    const local = localTypes(n);
    return local.find((t) => t !== "LocalBusiness") ?? local[0] ?? "";
  });
  if (type.status !== "found" && main) { type.value = typesOf(main).find((t) => ORGANIZATION.has(t)) ?? ""; type.status = type.value ? "generic" : "missing"; }
  const logoNode = same.find((n) => image(resolve(n.logo)));
  return {
    name: same.map((n) => first(n.name, 80)).find(Boolean) ?? domain,
    logo: logoNode ? image(resolve(logoNode.logo)) : null,
    hasSchema,
    invalidBlocks,
    hasMicrodata: /\bitemtype\s*=\s*["']?https?:\/\/schema\.org\//i.test(live),
    rows: [
      type,
      row("Phone", ["telephone"], (n) => first(n.telephone, 40)),
      row("Address", ["address"], (n) => address(n.address)),
      row("Hours", ["openingHoursSpecification", "openingHours"], hours),
      row("Map location", ["geo"], (n) => location(n.geo)),
      row("Service area", ["areaServed", "serviceArea"], (n) => areas(n.areaServed ?? n.serviceArea)),
      row("Social links", ["sameAs"], (n) => some(list(n.sameAs).map(host))),
      row("Website", ["url"], (n) => list(n.url).map(host).find(Boolean) ?? ""),
    ],
  };
}

/** Turns what a visitor types into the homepage to read, or null when it is not a public website. */
export function homepage(input: unknown): URL | null {
  if (typeof input !== "string") return null;
  const raw = input.trim();
  if (!raw || raw.length > 300 || /\s/.test(raw)) return null;
  try {
    const url = new URL(/^[a-z][a-z\d+.-]*:\/\//i.test(raw) ? raw : `https://${raw}`);
    const name = url.hostname;
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.port) return null;
    if (!/^(?=.{4,253}$)([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{1,62}$/i.test(name)) return null;
    if (/\.(local|localhost|internal|test|invalid|example|onion|arpa|home|lan)$/i.test(name)) return null;
    return new URL(`${url.protocol}//${name}/`);
  } catch { return null; }
}
