import { record } from "./brokenLimit.mjs";

/** Anything a connection, Sanity or the file system caused is not a content fault. */
export const isDataError = (error: any) =>
  error instanceof Error &&
  !("code" in error || "statusCode" in error || "response" in error || error.cause) &&
  !/^(ClientError|ServerError|AbortError|TimeoutError)$/.test(error.name) &&
  !/fetch failed|network|socket|timed? ?out|ECONN|ENOTFOUND|Sanity/i.test(error.message);

/** `kind` is a block type or a page pattern. */
export const reportOk = (kind: string) => record(kind, true);
export function reportBroken(kind: string, path: string, message: string, page = false) {
  console.error(`[content] ${path} ${message}`);
  record(kind, false, page ? path.replace(/(.)\/$/, "$1") : undefined);
}
