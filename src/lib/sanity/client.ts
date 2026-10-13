import { createClient } from "@sanity/client";

// Public reads only. No token, no drafts, no preview.
// All pages are prerendered, so this client runs at build time only.
export const sanityClient = createClient({
  projectId: "089yj83f",
  dataset: "production",
  apiVersion: "2026-01-01",
  useCdn: true,
});
