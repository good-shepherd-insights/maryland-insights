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
    ...commonFields,
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
    teams_section: z.object({
      enable: z.boolean(),
      title: z.string(),
      members: z.array(
        z.object({
          name: z.string(),
          position: z.string(),
          image: z.string(),
        }),
      ),
    }),
  }),
});

export const careers = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "src/content/careers" }),
  schema: z.object({
    ...commonFields,
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
    ...commonFields,
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
    ...commonFields,
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
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/contact" }),
  schema: z.object({
    ...commonFields,
    section_title: z.string(),
    contact_form: z.object({
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
    }),
    contact_info: z.object({
      enable: z.boolean(),
      informations: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
          icon: z.string(),
        }),
      ),
    }),
    gallery_section: z.object({
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
    }),
  }),
});

export const features = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/features" }),
  schema: z.object({
    ...commonFields,
    button: button.optional(),
    section_title: z.string().optional(),
    use_cases: z
      .object({
        enable: z.boolean(),
        title: z.string(),
        description: z.string(),
        cases: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            icon: z.string(),
            image: z.string(),
            button: button,
          }),
        ),
      })
      .optional(),
  }),
});

export const integrations = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/integrations" }),
  schema: z.object({
    ...commonFields,
    section_title: z.string(),
    integrations_list: z.array(
      z.object({
        title: z.string(),
        image: z.string(),
        description: z.string(),
        link: z.string().optional(),
      }),
    ),
  }),
});

export const pricing = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/pricing" }),
  schema: z.object({
    ...commonFields,
    comparison_section: z
      .object({
        enable: z.boolean(),
        title: z.string(),
        plan_names: z
          .array(z.object({ label: z.string(), price: z.string() }))
          .min(1),
        comparison_table: z.object({
          features: z.array(
            z.object({
              name: z.string(),
              description: z.string(),
              values: z.array(z.string()),
            }),
          ),
        }),
      })
      .superRefine((data, ctx) => {
        const planCount = data.plan_names.length;
        data.comparison_table.features.forEach((feature, index) => {
          if (feature.values.length !== planCount) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Feature "${feature.name}" must have exactly ${planCount} values to match plan_names.`,
              path: ["comparison_table", "features", index, "values"],
            });
          }
        });
      }),
  }),
});

export const faqs = defineCollection({
  loader: glob({ pattern: "**/-*.{md,mdx}", base: "src/content/faqs" }),
  schema: z.object({
    ...commonFields,
    section_title: z.string(),
    faqs_list: z.array(
      z.object({
        question: z.string(),
        answer: z.string(),
      }),
    ),
    cta: z.object({
      title: z.string(),
      description: z.string(),
      image: z.string(),
      button: button,
    }),
  }),
});

export const pages = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/pages" }),
  schema: z.object({
    ...commonFields,
  }),
});
