import { attr, blocks, dropComments, scan, textOf, type Piece } from "./htmlScan";

/** Reads a website's pages and reports how a customer can reach the business and what catches the lead. */
export type FollowUpRow = { label: string; value: string; found: boolean };

const any = (list: Record<string, RegExp>, text: string) => Object.entries(list).filter(([, pattern]) => pattern.test(text)).map(([name]) => name);

// Each pattern is an address the tool itself loads from, so a page that only mentions a tool does not match.
const BOOKING: Record<string, RegExp> = {
  Calendly: /\/\/(?:[\w-]+\.)*calendly\.com/i, "Housecall Pro": /\/\/(?:[\w-]+\.)*housecallpro\.com/i, Jobber: /\/\/(?:[\w-]+\.)*getjobber\.com/i,
  ServiceTitan: /\/\/(?:[\w-]+\.)*(?:servicetitan\.com|st-scheduler)/i, "Schedule Engine": /\/\/(?:[\w-]+\.)*scheduleengine\.net/i, "Acuity Scheduling": /\/\/(?:[\w-]+\.)*acuityscheduling\.com|\.as\.me\//i,
  Square: /\/\/(?:book\.squareup\.com|squareup\.com\/appointments)/i, Vagaro: /\/\/(?:[\w-]+\.)*vagaro\.com/i, Mindbody: /\/\/(?:[\w-]+\.)*(?:mindbodyonline|healcode)\.com/i,
  Zocdoc: /\/\/(?:[\w-]+\.)*zocdoc\.com/i, OpenTable: /\/\/(?:[\w-]+\.)*opentable\.com/i, Resy: /\/\/(?:[\w-]+\.)*resy\.com/i, Tock: /\/\/(?:[\w-]+\.)*exploretock\.com/i,
  Booksy: /\/\/(?:[\w-]+\.)*booksy\.com/i, NexHealth: /\/\/(?:[\w-]+\.)*nexhealth\.com/i, LocalMed: /\/\/(?:[\w-]+\.)*localmed\.com/i, Setmore: /\/\/(?:[\w-]+\.)*setmore\.com/i, "SimplyBook.me": /\/\/(?:[\w-]+\.)*simplybook\.(?:me|it)/i, FareHarbor: /\/\/(?:[\w-]+\.)*fareharbor\.com/i,
};
const CHAT: Record<string, RegExp> = {
  Podium: /connect\.podium\.com/i, Birdeye: /birdeye\.com\/(?:embed|chat|webchat)/i, Intercom: /widget\.intercom\.io/i, Drift: /js\.driftt\.com/i, "Tawk.to": /embed\.tawk\.to/i, LiveChat: /cdn\.livechatinc\.com/i,
  Tidio: /code\.tidio\.co/i, Zendesk: /static\.zdassets\.com/i, Crisp: /client\.crisp\.chat/i, "Smith.ai": /app\.smith\.ai/i, Olark: /static\.olark\.com/i, "HubSpot chat": /js\.usemessages\.com/i, "GoHighLevel chat": /widgets\.leadconnectorhq\.com/i, "Apex Chat": /apexchat\.com/i, Chatra: /call\.chatra\.io/i, Gorgias: /config\.gorgias\.(?:chat|io)/i,
};
const AUTOMATION: Record<string, RegExp> = {
  HubSpot: /js(?:-\w+)?\.(?:hs-scripts|hsforms|hs-analytics)\.(?:com|net)/i, GoHighLevel: /(?:link|api|widgets|backend)\.(?:leadconnectorhq|msgsndr)\.com|\/\/(?:[\w-]+\.)*msgsndr\.com/i, Mailchimp: /(?:list-manage|chimpstatic)\.com/i,
  Klaviyo: /(?:static|static-forms|static-tracking|a)\.klaviyo\.com/i, ActiveCampaign: /activehosted\.com|trackcmp\.net/i, "Constant Contact": /static\.ctctcdn\.com|visitor\.r20\.constantcontact\.com/i,
  Keap: /\/\/(?:[\w-]+\.)*infusionsoft\.(?:com|app)|\/\/(?:[\w-]+\.)*keap\.(?:app|com)/i, Marketo: /munchkin\.marketo\.net|\/\/(?:[\w-]+\.)*mktoweb\.com/i, Pardot: /pi\.pardot\.com|go\.pardot\.com/i, Zoho: /salesiq\.zoho(?:public)?\.com|(?:crm|forms|campaigns)\.zoho(?:public)?\.com|maillist-manage\.com/i,
  Kit: /f\.convertkit\.com|\/\/(?:[\w-]+\.)*ck\.page/i, Brevo: /sibforms\.com|cdn\.brevo\.com|sibautomation\.com/i, MailerLite: /\/\/(?:[\w-]+\.)*mailerlite\.com/i, Omnisend: /omnisnippet1\.com|\/\/(?:[\w-]+\.)*omnisend\.com/i, Attentive: /\/\/(?:[\w-]+\.)*attn\.tv/i, Toast: /toasttab\.com\/[\w-]+\/marketing/i, "Campaign Monitor": /createsend(?:1)?\.com/i,
};
const FORM_EMBED = /jotform\.com|typeform\.com|wufoo\.com|cognitoforms\.com|formstack\.com|hsforms\.(?:com|net)|leadconnectorhq\.com\/widget\/(?:form|survey)|docs\.google\.com\/forms/i;
const SIGNUP_CLASS = /klaviyo-form|ctct-inline-form|ml-embedded|formkit-form/i;

type Page = { html: string; pieces: Piece[] };
const page = (html: string): Page => ({ html: dropComments(html), pieces: scan(html, true).pieces });

/** A request form asks for a message or a phone number. A form that asks only who you are is a signup. */
function forms({ html, pieces }: Page) {
  const ignored = /type=["']?(?:hidden|submit|button|image|reset|checkbox|radio)\b|recaptcha|hcaptcha|ak_hp|honeypot|tabindex=["']?-1/i;
  const isEmail = (t: string) => /type=["']?email|(?:name|placeholder|aria-label|id)=["'][^"']{0,80}e-?mail/i.test(t);
  const isPhone = (t: string) => /type=["']?tel\b|(?:name|placeholder|aria-label|id)=["'][^"']{0,80}(?:phone|mobile)/i.test(t);
  let lead = pieces.some((p) => p.tag?.name === "iframe" && FORM_EMBED.test(attr(p.tag, "src")));
  let signup = pieces.some((p) => p.tag && ((p.tag.name === "form" && /list-manage\.com\/subscribe/i.test(attr(p.tag, "action"))) || SIGNUP_CLASS.test(attr(p.tag, "class")))) || /\/\/sibforms\.com\/serve/i.test(html);
  let form: { own: string[]; fields: string[]; message: boolean } | undefined;
  const done = () => {
    if (!form) return;
    const { own, message } = form, raw = own.join(" "), fields = form.fields.filter((t) => !ignored.test(t));
    form = undefined;
    if (/type=["']?password/i.test(raw) || /role=["']?search|type=["']?search|name=["']?(?:s|q|query)["'\s>]/i.test(raw)) return;
    const email = fields.some(isEmail), phone = fields.some(isPhone), wrote = message;
    const list = !wrote && /list-manage\.com|newsletter|\bsubscribe\b|sign up for (?:our )?(?:email|news)|mailing list/i.test(raw);
    if (!list && fields.length > 1 && (wrote || phone)) lead = true;
    else if (email) signup = true;
  };
  for (const p of pieces) {
    if (p.text !== undefined) {
      form?.own.push(p.text);
      continue;
    }
    const { name, close, attrs } = p.tag, t = ` ${attrs} `;
    if (name === "form") {
      done();
      if (!close) form = { own: [t], fields: [], message: false };
    } else if (form) {
      form.own.push(`${t}>`);
      if (!close && (name === "input" || name === "textarea" || name === "select")) {
        form.fields.push(t);
        if (name === "textarea" && !ignored.test(t)) form.message = true;
      }
    } else if (name === "input" && !ignored.test(t) && /type=["']?email/i.test(t)) signup = true;
  }
  done();
  return { lead, signup };
}

/** What a booking button says, when the tool behind it cannot be told. */
function bookingButton(pieces: Piece[]): string {
  return blocks(pieces, ["a", "button"]).find(({ text }) => text.length <= 40 && /\b(?:book|schedule)\s+(?:now|online|today|service|an?\s+(?:appointment|visit|service|call)|appointment|your\s+(?:appointment|visit|service))\b|\b(?:make|book)\s+a\s+reservation\b|^reserve(?:\s+now|\s+a\s+table)?$/i.test(text))?.text ?? "";
}

const PHONE = /(?<!\d)(?:\+?1[ .-]?)?\(?[2-9]\d{2}\)?[ .-]{1,2}\d{3}[ .-]\d{4}(?!\d)/;

export function checkFollowUp(home: string, contact: string | null): FollowUpRow[] {
  const pages = [["On the homepage", page(home)], ["On the contact page", page(contact ?? "")]] as const;
  const all = pages.map(([, p]) => p.html).join("\n");
  const pieces = pages.flatMap(([, p]) => p.pieces);
  const formed = pages.map(([where, p]) => ({ where, ...forms(p) }));
  const tools = (list: Record<string, RegExp>) => any(list, all).slice(0, 3).join(", ");
  const row = (label: string, value: string): FollowUpRow => ({ label, value: value || "None detected", found: Boolean(value) });

  const tel = pieces.some((p) => p.tag && /^\s*tel:/i.test(attr(p.tag, "href")));
  const button = bookingButton(pieces);
  const text = pieces.some((p) => p.tag && /^\s*sms:/i.test(attr(p.tag, "href"))) ? "Text link" : "";
  const phone: FollowUpRow = tel ? row("Tap to call", "Yes") : PHONE.test(textOf(scan(`${home}\n${contact ?? ""}`).pieces)) ? { label: "Tap to call", value: "The phone number is not a link", found: false } : row("Tap to call", "");
  return [
    row("Lead form", formed.find((f) => f.lead)?.where ?? ""),
    phone,
    row("Chat or text", [tools(CHAT), text].filter(Boolean).join(", ")),
    row("Online booking", tools(BOOKING) || (button && `“${button[0].toUpperCase()}${button.slice(1)}” button`)),
    row("Email signup", formed.find((f) => f.signup)?.where ?? ""),
    row("Automation tool", tools(AUTOMATION)),
  ];
}

/** The site's own contact page, from its links. */
export function contactPage(html: string, base: URL): URL | null {
  const bare = (h: string) => h.replace(/^www\./, "");
  for (const a of blocks(scan(html).pieces, ["a"])) {
    const href = attr(a.tag, "href");
    if (!href || href.length > 500 || !/contact/i.test(a.tag.attrs)) continue;
    try {
      const url = new URL(href, base);
      if (/^https?:$/.test(url.protocol) && bare(url.hostname) === bare(base.hostname) && /contact/i.test(url.pathname) && !/\.\w{2,4}$/.test(url.pathname)) return new URL(url.origin + url.pathname);
    } catch { /* not an address */ }
  }
  return null;
}

/** The name and logo a page gives itself, for sites whose schema gives neither. */
export function identity(html: string): { name: string; logo: string | null } {
  const tags = scan(html).pieces.flatMap((p) => (p.tag && !p.tag.close ? [p.tag] : []));
  const site = tags.find((t) => t.name === "meta" && /^og:site_name$/i.test(attr(t, "property")));
  const logo = tags.filter((t) => t.name === "img").map((t) => attr(t, "src")).find((u) => /^https:\/\/\S{1,500}$/i.test(u) && /logo/i.test(u));
  return { name: site ? attr(site, "content").replace(/<[^>]{0,200}>/g, " ").replace(/\s+/g, " ").trim().slice(0, 80) : "", logo: logo ?? null };
}
