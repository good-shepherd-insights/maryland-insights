import { createClient } from "@sanity/client";

// Public reads only. No token, no drafts, no preview.
const client = createClient({
  projectId: "089yj83f",
  dataset: "production",
  apiVersion: "2026-01-01",
  useCdn: false,
});

// During `astro build` every page repeats the same reads (settings, footer...).
// astro.config.mjs creates this map for that process only, so each distinct
// read happens once per build. Callers get copies, so none can change another's data.
// Per-request pages repeat them too, so a read is shared for a few seconds and
// no longer: long enough for one page, too short for anyone to see old content.
declare global {
  var __sanityBuildReads: Map<string, Promise<unknown>> | undefined;
}

const SHARE_MS = 5000;
const recent = new Map<string, { at: number; read: Promise<unknown> }>();

async function sharedRead(query: string, params: Record<string, unknown>): Promise<unknown> {
  const now = Date.now();
  for (const [k, v] of recent) if (now - v.at > SHARE_MS) recent.delete(k);
  const key = JSON.stringify([query, params]);
  const entry = recent.get(key) ?? { at: now, read: client.fetch(query, params as any) };
  if (!recent.has(key)) {
    recent.set(key, entry);
    entry.read.catch(() => recent.get(key) === entry && recent.delete(key));
  }
  return structuredClone(await entry.read);
}

export const sanityClient = {
  async fetch<T = any>(query: string, params: Record<string, unknown> = {}): Promise<T> {
    const reads = globalThis.__sanityBuildReads;
    if (!reads) return sharedRead(query, params) as Promise<T>;
    const key = JSON.stringify([query, params]);
    let read = reads.get(key);
    if (!read) {
      read = client.fetch(query, params as any);
      reads.set(key, read);
      read.catch(() => reads.delete(key));
    }
    return structuredClone(await read) as T;
  },
};
