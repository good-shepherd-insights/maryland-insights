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
// read happens once per build. Per-request rendering never has it and is
// always fresh. Callers get copies, so none can change another's data.
declare global {
  var __sanityBuildReads: Map<string, Promise<unknown>> | undefined;
}

export const sanityClient = {
  async fetch<T = any>(query: string, params: Record<string, unknown> = {}): Promise<T> {
    const reads = globalThis.__sanityBuildReads;
    if (!reads) return client.fetch(query, params as any) as Promise<T>;
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
