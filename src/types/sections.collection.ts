import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { button } from "./pages.collection";

export const ctaSection = defineCollection({
  loader: glob({
    pattern: "call-to-action.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.any(),
});

export const pricingSection = defineCollection({
  loader: glob({
    pattern: "pricing.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.any(),
});

export const testimonialSection = defineCollection({
  loader: glob({
    pattern: "testimonial.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.any(),
});

export const featuresCarouselSection = defineCollection({
  loader: glob({
    pattern: "features-carousel.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.any(),
});

export const trustedBrandsSection = defineCollection({
  loader: glob({
    pattern: "trusted-brands.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.any(),
});
