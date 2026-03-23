import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const commonFields = {
  title: z.string(),
  description: z.string(),
  meta_title: z.string().optional(),
  date: z.date().optional(),
  image: z.string().optional(),
  draft: z.boolean(),
};

export const button = z.object({
  enable: z.boolean(),
  label: z.string(),
  link: z.string(),
});

export const homepage = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/homepage" }),
  schema: z.object({
    banner: z.object({
      title: z.string(),
      subtitle: z.string().optional(),
      content: z.string(),
      image: z.string(),
      button_solid: button,
      button_underline: button,
      tag_lines: z.array(z.string()),
      cursor_1: z.string(),
      cursor_2: z.string(),
    }),
    agents_swiper: z.object({
      enable: z.boolean(),
      title: z.string(),
      agents: z.array(
        z.object({
          label: z.string(),
          description: z.string(),
          icon: z.string(),
          button: button,
        }),
      ),
    }),
    facts_section: z.object({
      enable: z.boolean(),
      facts: z
        .array(
          z.object({
            label: z.string(),
            description: z.string(),
            icon: z.string(),
          }),
        )
        .length(4),
    }),
    featured_features_section: z.object({
      enable: z.boolean(),
      title: z.string(),
    }),
  }),
});

export const about = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/about" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    meta_title: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    draft: z.boolean(),
    gallery: z.object({
      enable: z.boolean(),
      title: z.string(),
      image: z.string(),
    }),
    facts_section: z.object({
      enable: z.boolean(),
      facts: z
        .array(
          z.object({
            label: z.string(),
            description: z.string(),
            icon: z.string(),
          }),
        )
        .length(4),
    }),
    teams_section: z
      .object({
        enable: z.boolean(),
        title: z.string(),
        members: z.array(
          z.object({
            name: z.string(),
            position: z.string(),
            image: z.string(),
          }),
        ),
      })
      .optional(),
  }),
});

export const careers = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/careers" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    meta_title: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    draft: z.boolean(),
    section_title: z.string().optional(),
    gallery: z
      .object({
        enable: z.boolean(),
        title: z.string(),
        image: z.string(),
      })
      .optional(),
    facts_section: z
      .object({
        enable: z.boolean(),
        title: z.string(),
        description: z.string(),
        facts: z
          .array(
            z.object({
              label: z.string(),
              description: z.string(),
              icon: z.string(),
            }),
          )
          .length(4),
      })
      .optional(),
    department: z.string().optional(),
    experience_level: z.string().optional(),
    salary_range: z.string().optional(),
    location: z.string().optional(),
    employment_type: z.string().optional(),
    vacancy: z.string().optional(),
    deadline: z.date().optional(),
  }),
});

export const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    meta_title: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    draft: z.boolean(),
    categories: z.array(z.string()).optional(),
    author: z
      .object({
        name: z.string(),
        image: z.string().optional(),
      })
      .optional(),
    featured: z.boolean().optional(),
    featured_posts: z
      .object({
        enable: z.boolean(),
        title: z.string(),
      })
      .optional(),
    actual_posts: z
      .object({
        enable: z.boolean(),
        title: z.string(),
      })
      .optional(),
  }),
});

export const caseStudies = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/case-studies" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    meta_title: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    draft: z.boolean(),
    section_title: z.string().optional(),
    categories: z.array(z.string()).optional(),
    author: z
      .object({
        name: z.string(),
        image: z.string().optional(),
        designation: z.string().optional(),
      })
      .optional(),
    stats: z
      .array(
        z.object({
          label: z.string(),
          value: z.string(),
        }),
      )
      .length(3)
      .optional(),
  }),
});

export const contact = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/contact" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    meta_title: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    draft: z.boolean(),
    section_title: z.string().optional(),
    contact_form: z
      .object({
        enable: z.boolean(),
        title: z.string(),
        description: z.string(),
        form_action: z.string(),
        fields: z.array(
          z.object({
            label: z.string(),
            type: z.string(),
            name: z.string(),
            placeholder: z.string(),
            required: z.boolean(),
          }),
        ),
        submit_button_label: z.string(),
      })
      .optional(),
    contact_info: z
      .object({
        enable: z.boolean(),
        informations: z.array(
          z.object({
            label: z.string(),
            value: z.string(),
            icon: z.string(),
          }),
        ),
      })
      .optional(),
    gallery_section: z
      .object({
        enable: z.boolean(),
        title: z.string(),
        image: z.string(),
        locations: z.array(
          z.object({
            name: z.string(),
            address: z.string(),
            icon: z.string(),
          }),
        ),
      })
      .optional(),
  }),
});

export const features = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/features" }),
  schema: z.any(),
});

export const integrations = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/integrations" }),
  schema: z.any(),
});

export const pricing = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/pricing" }),
  schema: z.any(),
});

export const faqs = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/faqs" }),
  schema: z.any(),
});

export const pages = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/pages" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    meta_title: z.string().optional(),
    date: z.date().optional(),
    image: z.string().optional(),
    draft: z.boolean(),
  }),
});
