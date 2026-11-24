import land from "./land.json";

/** Real Maryland county shapes, in a 1000 x 524 box. */
export const LAND = land as Record<string, string>;
export const countyId = (name: string) => `md-${name.toLowerCase().replace(/[^a-z]/g, "")}`;
