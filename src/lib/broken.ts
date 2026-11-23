import { record } from "./brokenLimit.mjs";

export { isDataError } from "./brokenLimit.mjs";

/** `kind` is a block type or a page pattern. */
export const reportOk = (kind: string) => record(kind, true);
export function reportBroken(kind: string, path: string, message: string, page = false) {
  console.error(`[content] ${path} ${message}`);
  record(kind, false, page ? path.replace(/(.)\/$/, "$1") : undefined);
}
