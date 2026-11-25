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
const FORM_EMBED = /<iframe\b[^>]*\bsrc=["'][^"']*(?:jotform\.com|typeform\.com|wufoo\.com|cognitoforms\.com|formstack\.com|hsforms\.(?:com|net)|leadconnectorhq\.com\/widget\/(?:form|survey)|docs\.google\.com\/forms)/i;
const SIGNUP_EMBED = /<form\b[^>]*action=["'][^"']*list-manage\.com\/subscribe|class=["'][^"']*(?:klaviyo-form|ctct-inline-form|ml-embedded|formkit-form)|\/\/sibforms\.com\/serve/i;

const clean = (html: string) => html.replace(/<!--[\s\S]*?-->/g, "");
const plain = (html: string) =>
  html.replace(/<(script|style|noscript|svg)\b[\s\S]*?<\/\1>/gi, " ").replace(/<[^>]+>/g, " ").replace(/&(?:nbsp|#160|#xa0);/gi, " ").replace(/&amp;/gi, "&").replace(/&[#\w]+;/g, " ").replace(/\s+/g, " ").trim();

/** A request form asks for a message or a phone number. A form that asks only who you are is a signup. */
function forms(html: string) {
  let lead = FORM_EMBED.test(html), signup = SIGNUP_EMBED.test(html);
  const ignored = /type=["']?(?:hidden|submit|button|image|reset|checkbox|radio)\b|recaptcha|hcaptcha|ak_hp|honeypot|tabindex=["']?-1/i;
  const isEmail = (tag: string) => /type=["']?email|(?:name|placeholder|aria-label|id)=["'][^"']*e-?mail/i.test(tag);
  for (const [form] of html.matchAll(/<form\b[\s\S]*?<\/form>/gi)) {
    if (/type=["']?password/i.test(form) || /role=["']?search|type=["']?search|name=["']?(?:s|q|query)["'\s>]/i.test(form)) continue;
    const fields = [...form.matchAll(/<(?:input|textarea|select)\b[^>]*>/gi)].map(([tag]) => tag).filter((tag) => !ignored.test(tag));
    const email = fields.some(isEmail), phone = fields.some((tag) => /type=["']?tel\b|(?:name|placeholder|aria-label|id)=["'][^"']*(?:phone|mobile)/i.test(tag));
    const message = fields.some((tag) => /^<textarea/i.test(tag));
    const list = !message && /list-manage\.com|newsletter|\bsubscribe\b|sign up for (?:our )?(?:email|news)|mailing list/i.test(form);
    if (!list && fields.length > 1 && (message || phone)) lead = true;
    else if (email) signup = true;
  }
  const loose = html.replace(/<form\b[\s\S]*?<\/form>/gi, "");
  if ([...loose.matchAll(/<input\b[^>]*>/gi)].some(([tag]) => !ignored.test(tag) && /type=["']?email/i.test(tag))) signup = true;
  return { lead, signup };
}

/** What a booking button says, when the tool behind it cannot be told. */
function bookingButton(html: string): string {
  for (const [, , body] of html.matchAll(/<(a|button)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
    const text = plain(body);
    if (text.length <= 40 && /\b(?:book|schedule)\s+(?:now|online|today|service|an?\s+(?:appointment|visit|service|call)|appointment|your\s+(?:appointment|visit|service))\b|\b(?:make|book)\s+a\s+reservation\b|^reserve(?:\s+now|\s+a\s+table)?$/i.test(text)) return text;
  }
  return "";
}

const PHONE = /(?<!\d)(?:\+?1[ .-]?)?\(?[2-9]\d{2}\)?[ .-]{1,2}\d{3}[ .-]\d{4}(?!\d)/;

export function checkFollowUp(home: string, contact: string | null): FollowUpRow[] {
  const pages = [["On the homepage", clean(home)], ["On the contact page", contact ? clean(contact) : ""]] as const;
  const all = pages.map(([, html]) => html).join("\n");
  const formed = pages.map(([where, html]) => ({ where, ...forms(html) }));
  const tools = (list: Record<string, RegExp>) => any(list, all).slice(0, 3).join(", ");
  const row = (label: string, value: string): FollowUpRow => ({ label, value: value || "None detected", found: Boolean(value) });

  const tel = /\bhref=["']?\s*tel:/i.test(all);
  const button = bookingButton(all);
  const text = /\bhref=["']?\s*sms:/i.test(all) ? "Text link" : "";
  const phone: FollowUpRow = tel ? row("Tap to call", "Yes") : PHONE.test(plain(all)) ? { label: "Tap to call", value: "The phone number is not a link", found: false } : row("Tap to call", "");
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
  for (const [tag, , href] of clean(html).matchAll(/<a\b[^>]*\bhref=(["'])(.*?)\1[^>]*>/gi)) {
    if (!/contact/i.test(tag)) continue;
    try {
      const url = new URL(href.replace(/&amp;/g, "&"), base);
      if (/^https?:$/.test(url.protocol) && bare(url.hostname) === bare(base.hostname) && /contact/i.test(url.pathname) && !/\.\w{2,4}$/.test(url.pathname)) return new URL(url.origin + url.pathname);
    } catch { /* not an address */ }
  }
  return null;
}

/** The name and logo a page gives itself, for sites whose schema gives neither. */
export function identity(html: string): { name: string; logo: string | null } {
  const name = html.match(/<meta\b[^>]*property=["']og:site_name["'][^>]*content=(["'])(.*?)\1/i)?.[2] ?? html.match(/<meta\b[^>]*content=(["'])([^"']*)\1[^>]*property=["']og:site_name["']/i)?.[2] ?? "";
  const logo = html.match(/<img\b[^>]*\bsrc=["'](https:\/\/[^"']*logo[^"']*)["']/i)?.[1] ?? null;
  return { name: plain(name).slice(0, 80), logo: logo?.replace(/&amp;/g, "&") ?? null };
}
