import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";
import { button } from "./pages.collection";

export const ctaSection = defineCollection({
  loader: glob({
    pattern: "call-to-action.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.object({
    enable: z.boolean(),
    title: z.string(),
    description: z.string(),
    rotating_icons: z.array(z.string()),
    button: button,
  }),
});

export const pricingSection = defineCollection({
  loader: glob({
    pattern: "pricing.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.object({
    enable: z.boolean(),
    title: z.string(),
    plans_labels: z.array(z.string()),
    plans: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
        price_prefix: z.string(),
        isPopular: z.boolean(),
        features: z.array(z.string()),
        price: z.object({
          yearly: z.object({
            amount: z.union([z.number(), z.string()]),
            period: z.string(),
          }),
          monthly: z.object({
            amount: z.union([z.number(), z.string()]),
            period: z.string(),
          }),
        }),
        cta: z.object({
          enable: z.boolean(),
          text: z.string(),
          link: z.string(),
        }),
      }),
    ),
  }),
});

export const testimonialSection = defineCollection({
  loader: glob({
    pattern: "testimonial.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.object({
    enable: z.boolean(),
    title: z.string(),
    testimonials: z.array(
      z.object({
        name: z.string(),
        avatar: z.string(),
        designation: z.string(),
        content: z.string(),
      }),
    ),
  }),
});

export const featuresCarouselSection = defineCollection({
  loader: glob({
    pattern: "features-carousel.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.object({
    enable: z.boolean(),
    title: z.string(),
    subtitle: z.string(),
    list: z.array(
      z.object({
        title: z.string(),
        subtitle: z.string(),
        icon: z.string(),
        image: z.string(),
      }),
    ),
  }),
});

export const trustedBrandsSection = defineCollection({
  loader: glob({
    pattern: "trusted-brands.{md,mdx}",
    base: "src/content/sections",
  }),
  schema: z.object({
    enable: z.boolean(),
    title: z.string(),
    list: z.array(
      z.object({
        logo: z.string(),
        brand: z.string(),
      }),
    ),
  }),
});
