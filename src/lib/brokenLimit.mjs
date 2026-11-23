// Content too incomplete to render is left out and logged, so one bad document
// never blocks a deploy. A code fault looks different: it breaks most uses of
// the same block or page kind at once. That stops the build. Preview builds
// stop on any broken content, so a pull request cannot hide a fault.

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
export function buildFault(counts, strict) {
  const broken = [...(counts?.kinds ?? [])].filter(([, k]) => k.broken > 0);
  if (strict && broken.length) return `Content that cannot render: ${broken.map(([n, k]) => `${n} (${k.broken})`).join(", ")}. Preview builds stop on this; production leaves it out. See the [content] lines above.`;
  const faults = broken.filter(([, k]) => k.broken >= 3 && k.broken > k.ok);
  return faults.length ? `Most uses of ${faults.map(([n, k]) => `${n} (${k.broken} of ${k.broken + k.ok})`).join(", ")} failed to render, which looks like a code fault. See the [content] lines above.` : undefined;
}
