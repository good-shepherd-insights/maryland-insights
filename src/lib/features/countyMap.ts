import { BLANK_MAP_INNER, BLANK_MAP_VIEWBOX } from "./geo/blankMap";

const COUNTIES = [...BLANK_MAP_INNER.matchAll(/<path d="([^"]+)"[^>]*><title>([^<]+)<\/title>/g)].map(([, d, name]) => ({ d, name }));

/** Maryland by county, with the named ones lit. */
export const countyMap = (fill: string, stroke: string, lit: string[] = [], on = fill) => ({
  viewBox: BLANK_MAP_VIEWBOX,
  inner: COUNTIES.map((c) => `<path d="${c.d}" fill="${lit.includes(c.name) ? on : fill}" stroke="${stroke}" stroke-width="1.6" stroke-linejoin="round"></path>`).join(""),
});
