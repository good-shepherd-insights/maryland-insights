/** The phone and email from Sanity as links people can tap. */
export function contactLinks(items: any[] | undefined): { label: string; value: string; href: string }[] {
  return (items ?? [])
    .filter((i) => i?.label && i?.value)
    .map((i) => {
      const value = String(i.value).trim();
      const href = value.includes("@") ? `mailto:${value}` : /^\+?[\d\s().-]+$/.test(value) ? `tel:${value.replace(/[^\d+]/g, "")}` : value;
      return { label: i.label, value, href };
    });
}

/** "Coming Soon" and the like are not addresses, so they get no map link. */
export const isAddress = (text: string | undefined) => /\d/.test(text ?? "");
export const mapLink = (address: string) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
