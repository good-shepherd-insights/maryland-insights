# REFACTOR(blog-cta-content)

## Request
Replace the hardcoded Call-to-Action (CTA) buttons in the blog post template (`[single].astro`) with a content-driven solution. The labels and links for "Get Started" and "Book a Growth Consultation" should be managed in a content file rather than the source code.

## Directory Map
```text
src/
  types/
    pages.collection.ts               (modify)
  content/
    blog/
      -index.md                       (modify)
  pages/
    blog/
      [single].astro                  (modify)
```

## Modification Table
| File | Action | Why |
|---|---|---|
| `src/types/pages.collection.ts` | modify | Update the `blog` collection schema to include a `blog_cta` object for managing buttons. |
| `src/content/blog/-index.md` | modify | Store the actual CTA button labels and links in the blog index metadata. |
| `src/pages/blog/[single].astro` | modify | Fetch the `blog_cta` data from the blog index and render the buttons dynamically. |

## Existing Pattern Audit
- **Content Collections**: The project uses Astro Content Collections with Zod schemas defined in `src/types/`.
- **Index Files**: Collections use a `-index.md` file (filtered out from regular lists) to store section-level metadata (e.g., `featured_posts`, `actual_posts`).
- **Button Types**: A shared `button` Zod object exists in `pages.collection.ts` for consistent button data structures.
- **Dynamic Content**: Templates like `index.astro` already use `getListPage(BLOG_FOLDER, "-index")` to fetch this metadata.

## Execution Plan
### Step 1 — Update Blog Schema
Update the `blog` collection in `src/types/pages.collection.ts` to include a `blog_cta` property. This property will contain an array of buttons or a specific object structure.

### Step 2 — Add CTA Data to Content
Add the `blog_cta` configuration to `src/content/blog/-index.md`. This follow the pattern of other sections like `featured_posts`.

### Step 3 — Update Template Logic
Modify `src/pages/blog/[single].astro` to fetch the `-index` entry of the blog collection and use the `blog_cta` data to render the buttons.

## File-by-File Changes

### `src/types/pages.collection.ts`
**Action:** Modify  
**Why:** Add the `blog_cta` field to the blog schema to allow Zod validation of the new content.  
**Impact:** Enables structured editing of blog-wide CTA buttons.

#### Before
```ts
149: export const blog = defineCollection({
150:   loader: glob({ pattern: "**/*.md", base: "src/content/blog" }),
151:   schema: z.object({
152:     title: z.string(),
...
177:       .optional(),
178:   }),
179: });
```

#### After
```ts
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
    blog_cta: z
      .object({
        enable: z.boolean(),
        buttons: z.array(button),
      })
      .optional(),
  }),
});
```

#### Reasoning
- Reuses the existing `button` Zod schema for consistency.
- Adds `enable` flag and `buttons` array to support the two-button layout flexibly.

---

### `src/content/blog/-index.md`
**Action:** Modify  
**Why:** Move the hardcoded text and links into the content layer.  
**Impact:** Allows non-technical users to update the CTA without touching code.

#### Before
```md
16:   # All posts are in `src/content/blog/` directory
17: ---
```

#### After
```md
16:   # All posts are in `src/content/blog/` directory
17: 
18: blog_cta:
19:   enable: true
20:   buttons:
21:     - label: "Get Started"
22:       link: "/get-started"
23:       enable: true
24:     - label: "Book a Growth Consultation"
25:       link: "https://cal.id/maryland-insights/business-growth-consult?overlayCalendar=true"
26:       enable: true
27: ---
```

#### Reasoning
- Standardizes the blog-level CTA to match the user's requested labels and links.

---

### `src/pages/blog/[single].astro`
**Action:** Modify  
**Why:** Replace the hardcoded labels and logic with dynamic data fetched from the content collection.  
**Impact:** Completes the refactor to a content-driven architecture.

#### Before
```astro
---
...
import PageHeader from "@/partials/PageHeader.astro";
import { render } from "astro:content";

export async function getStaticPaths() {
...
}

const { post } = Astro.props;
...
// ... (current buttons block)
        <div
          class="flex flex-wrap items-center justify-center gap-4 mt-12 py-10 border-t border-border/50"
        >
          <a href="/get-started" class="btn btn-primary px-10">Get Started</a>
          <a
            href="https://cal.id/maryland-insights/business-growth-consult?overlayCalendar=true"
            class="btn btn-outline px-10"
          >
            Book a Growth Consultation
          </a>
        </div>
```

#### After
```astro
---
...
import PageHeader from "@/partials/PageHeader.astro";
import { getListPage } from "@/lib/contentParser.astro"; // Import added
import { render } from "astro:content";

export async function getStaticPaths() {
...
}

const { post } = Astro.props;
const { title } = post.data;

const postIndex = await getListPage("blog", "-index");
const { blog_cta } = postIndex.data;

const { Content, headings } = await render(post);
...
---
...
        <div class="content">
          <Content />
        </div>

        {
          blog_cta && blog_cta.enable && (
            <div class="flex flex-wrap items-center justify-center gap-4 mt-12 py-10 border-t border-border/50">
              {blog_cta.buttons.map((btn: any, index: number) => (
                <a
                  href={btn.link}
                  class={`btn px-10 ${index === 0 ? "btn-primary" : "btn-outline"}`}
                >
                  {btn.label}
                </a>
              ))}
            </div>
          )
        }
      </article>
...
```

#### Reasoning
- Fetches the `-index` metadata using the established `getListPage` helper.
- Dynamically maps buttons, using the first button as `btn-primary` and subsequent ones as `btn-outline` to match the established visual hierarchy.

## Validation Plan
1. **Type Check**: Run `astro check` to ensure the Zod schema and template usage are consistent.
2. **Visual Verification**: Check the blog post page to ensure buttons appear with the correct labels and links from `-index.md`.
3. **Draft Check**: Verify that setting `enable: false` in `-index.md` correctly hides the CTA section.

## Risk Notes
- **Schema mismatch**: Ensure `getListPage` correctly identifies the collection `blog`.
- **CSS classes**: The `btn-primary` and `btn-outline` logic assumes the first button is the primary one.

## Approval
Status: Awaiting explicit user approval. Do not implement yet.
