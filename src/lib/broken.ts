import { record } from "./brokenLimit.mjs";

/** Only errors that missing or misshapen values cause. Anything else, such as an outage, still fails the build. */
export const isDataError = (error: any) =>
  (error instanceof TypeError || error instanceof RangeError || /^Unable to render \S+ because it is (null|undefined)/.test(error?.message ?? "")) &&
  !("code" in error || "statusCode" in error || "response" in error || error.cause) &&
  !/fetch|terminated|network|socket|timed? ?out|ECONN|EAI_|ENOTFOUND|abort/i.test(error.message);

/** `kind` is a block type or a page pattern. */
export const reportOk = (kind: string) => record(kind, true);
export function reportBroken(kind: string, path: string, message: string, page = false) {
  console.error(`[content] ${path} ${message}`);
  record(kind, false, page ? path.replace(/(.)\/$/, "$1") : undefined);
}
