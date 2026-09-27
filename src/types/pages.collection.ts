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
      eyebrow: z.string().optional(),
      title: z.string(),
      subtitle: z.string().optional(),
      content: z.string(),
      image: z.string().optional(),
      button_solid: button,
      button_underline: button,
      fine_print: z.string().optional(),
      tag_lines: z.array(z.string()).optional(),
      cursor_1: z.string().optional(),
      cursor_2: z.string().optional(),
      stats: z
        .array(
          z.object({
            value: z.string(),
            label: z.string(),
            accent: z.string().optional(),
          }),
        )
        .optional(),
    }),
    agents_swiper: z.object({
      enable: z.boolean(),
      title: z.string(),
      agents: z.array(
        z.object({
          label: z.string(),
          description: z.string(),
          icon: z.string(),
          image: z.string().optional(),
          image_bg: z.boolean().optional(),
          points: z.array(z.string()).optional(),
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
    faqs_section: z
      .object({
        enable: z.boolean(),
        section_title: z.string().optional(),
        faqs_list: z.array(
          z.object({
            question: z.string(),
            answer: z.string(),
          }),
        ),
      })
      .optional(),
    integrations_section: z
      .object({
        enable: z.boolean(),
        section_title: z.string().optional(),
        integrations_list: z.array(
          z.object({
            title: z.string(),
            description: z.string(),
            image: z.string(),
            link: z.string().optional(),
          }),
        ),
      })
      .optional(),
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
    positioning: z
      .object({
        enable: z.boolean(),
        title: z.string(),
        intro: z.string(),
        business: z.object({
          title: z.string(),
          description: z.string(),
          points: z.array(z.string()),
          link_label: z.string(),
          link: z.string(),
        }),
        agency: z.object({
          title: z.string(),
          description: z.string(),
          points: z.array(z.string()),
          link_label: z.string(),
          link: z.string(),
        }),
        boundary: z.string(),
      })
      .optional(),
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
    story_section: z
      .object({
        enable: z.boolean(),
        title: z.string(),
        agents: z.array(
          z.object({
            label: z.string(),
            description: z.string(),
            icon: z.string(),
            image: z.string().optional(),
            image_bg: z.boolean().optional(),
            points: z.array(z.string()).optional(),
            button: button,
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
    lastmod: z.date().optional(),
    image: z.string().optional(),
    draft: z.boolean(),
    categories: z.array(z.string()).optional(),
    author: z
      .object({
        name: z.string(),
        image: z.string().optional(),
        twitter: z.string().optional(),
      })
      .optional(),
    featured: z.boolean().optional(),
    schema_type: z
      .enum(["BlogPosting", "Article", "TechArticle", "NewsArticle"])
      .default("BlogPosting"),
    howto: z
      .object({
        name: z.string(),
        description: z.string().optional(),
        totalTime: z.string().optional(),
        steps: z.array(
          z.object({
            name: z.string(),
            text: z.string(),
          }),
        ),
      })
      .optional(),
    video: z
      .object({
        name: z.string(),
        description: z.string(),
        thumbnailUrl: z.string(),
        uploadDate: z.string(),
        duration: z.string().optional(),
        embedUrl: z.string().optional(),
        contentUrl: z.string().optional(),
      })
      .optional(),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        }),
      )
      .optional(),
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

export const services = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "src/content/services" }),
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
