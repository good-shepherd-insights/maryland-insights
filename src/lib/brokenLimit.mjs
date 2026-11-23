// Content too incomplete to render is left out and logged, so one bad document
// never blocks a deploy. A code fault looks different: it breaks every use of a
// block or page kind. Pull request previews stop on that.

/** Counts exist only during `astro build`. */
export const startCounting = () => { globalThis.__contentCounts = { kinds: new Map(), pages: new Set() }; };

export function record(kind, ok, page) {
  const counts = globalThis.__contentCounts;
  if (!counts) return;
  const k = counts.kinds.get(kind) ?? { ok: 0, broken: 0 };
  k[ok ? "ok" : "broken"]++;
  counts.kinds.set(kind, k);
  if (page) counts.pages.add(page);
}
export const isUnpublished = (path) => globalThis.__contentCounts?.pages.has(path.replace(/(.)\/$/, "$1")) ?? false;

/** Why the build should stop, or undefined. */
export function buildFault(counts, preview) {
  // Every use of something failing is a code fault. Production stops only when
  // no page of a kind works; new content cannot cause that while others render.
  const failed = [...(counts?.kinds ?? [])].filter(([name, k]) => k.ok === 0 && k.broken > 0 && (preview || (name.startsWith("page ") && k.broken >= 3)));
  return failed.length ? `Nothing of this kind rendered: ${failed.map(([n, k]) => `${n} (${k.broken})`).join(", ")}. See the [content] lines above.` : undefined;
}

/** Only errors that missing or misshapen values cause. Anything else, such as an outage, still fails the build. */
export const isDataError = (error) =>
  (error instanceof TypeError || error instanceof RangeError || /^(Unable to render \S+ because it is (null|undefined)|Element type is invalid|Objects are not valid as a React child|Minified React error)/.test(error?.message ?? "")) &&
  !("code" in error || "statusCode" in error || "response" in error || error.cause) &&
  !/fetch|terminated|network|socket|timed? ?out|ECONN|EAI_|ENOTFOUND|abort/i.test(error.message);

/**
 * When two parts of one block fail, Astro reports the first and leaves the
 * second unhandled, which would end the process. Build only.
 */
export const onUnhandled = (error) => {
  if (!isDataError(error)) throw error;
  console.error(`[content] second fault in the same block: ${error.message}`);
};
