# STYLE(blog-toc-enhancement)

## Request
Improve the "Table of Contents" component in the blog post template (`[single].astro`) to make it clearly interactive and "clickable," with a high-fidelity focus on mobile usability and consistent premium aesthetics.

## Directory Map
```text
src/
  pages/
    blog/
      [single].astro                  (modify)
  styles/
    components.css                    (modify)
    main.css                          (modify)
```

## Modification Table
| File | Action | Why |
|---|---|---|
| `src/pages/blog/[single].astro` | modify | Update both desktop and mobile TOC structures to include active-state placeholders, better spacing, and iconography (chevrons). |
| `src/styles/components.css` | modify | Add specific component styling for the vertical TOC indicator and link states. |
| `src/styles/main.css` | modify | Ensure smooth scrolling is enabled globally for fragment navigation. |

## Existing Pattern Audit
- **Grid System**: The blog template uses a `container` with `flex-col lg:flex-row` for main/aside layouts.
- **Card Styling**: Interactive areas commonly use `bg-body rounded-2xl p-4` or similar patterns (e.g., `Recent Posts` sidebar, `Share` component).
- **Typography**: Sub-headers use `small` tags with `font-semibold text-text-dark font-primary text-sm`.
- **Iconography**: The project uses inline SVGs and `ImageMod` for images; interactive buttons and cards (like `CardPrimary`) often feature arrows/indicators for "learn more" actions.

## Execution Plan
### Step 1 — Enable Global Smooth Scrolling
Ensure that fragment links (TOC) glide to their targets smoothly.

### Step 2 — Refactor TOC Structure in [single].astro
Update the HTML structure for both the LG (desktop) and mobile TOC versions. 
- Mobile: Convert list to a series of defined clickable rows with chevron-right icons.
- Desktop: Implement a vertical "track" layout for the active section indicator.

### Step 3 — Apply Styling in components.css
Add the required classes for the TOC hover effects, chevron placement, and vertical indicator lines.

## File-by-File Changes

### `src/styles/main.css`
**Action:** Modify  
**Why:** Enable smooth scrolling globally to improve the fragment link experience (Table of Contents navigation).  
**Impact:** All `#fragment` links will smooth-scroll.

#### Before
```css
@import "base.css";
@import "animations.css";
@import "buttons.css";
@import "components.css";
@import "navigation.css";
@import "utilities.css";
@import "generated-theme.css";
@import "safe.css";
```

#### After
```css
@import "base.css";
@import "animations.css";
@import "buttons.css";
@import "components.css";
@import "navigation.css";
@import "utilities.css";
@import "generated-theme.css";
@import "safe.css";

@layer base {
  html {
    scroll-behavior: smooth;
  }
}
```

#### Reasoning
- Matches the base layer styling pattern.
- Minimal global impact while significantly improving TOC navigation UX.

---

### `src/styles/components.css`
**Action:** Modify  
**Why:** Provide the necessary styling for the enhanced TOC interaction states and icons.  
**Impact:** Visual polish for the TOC links.

#### Before (around line 13)
```css
/* social icons */
.social-icons {
  @apply space-x-3;
}
```

#### After
```css
/* social icons */
.social-icons {
  @apply space-x-3;
}

/* Table of Contents Enhancement */
.toc-link {
  @apply flex items-center justify-between py-2 px-3 text-sm transition-all duration-300 rounded-lg;
  @apply text-text border border-transparent;
}

.toc-link:hover {
  @apply bg-light text-text-dark border-border;
}

.toc-link-icon {
  @apply w-4 h-4 opacity-0 -translate-x-2 transition-all duration-300;
}

.toc-link:hover .toc-link-icon {
  @apply opacity-70 translate-x-0;
}

/* Desktop Vertical Stepper */
.toc-desktop-container {
  @apply relative pl-2;
}

.toc-desktop-line {
  @apply absolute left-0 top-0 h-full w-[1px] bg-border;
}

.toc-desktop-link {
  @apply block py-1.5 px-3 text-xs text-text transition-colors duration-200 border-l border-transparent -ml-[1px];
}

.toc-desktop-link:hover {
  @apply text-text-dark border-primary;
}
```

#### Reasoning
- Uses Tailwind `@apply` to maintain consistency with the CSS architecture.
- Specifically targets the "clickability" concern by providing hover feedback and iconography.

---

### `src/pages/blog/[single].astro`
**Action:** Modify  
**Why:** Update the markup for TOC to use the new classes and include SVG icons on mobile.  
**Impact:** Structural change of the TOC section.

#### Before (Mobile TOC section around line 101)
```astro
        {
          validHeadings.length > 0 && (
            <nav class="lg:hidden py-6 border-b border-border">
              <small class="font-semibold text-text-dark font-primary text-sm">
                Table of Contents
              </small>
              <ul>
                {validHeadings.map((heading) => (
                  <li>
                    <a
                      href={`#${heading.slug}`}
                      class="block py-2 pl-2 text-sm hover:bg-light rounded"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )
        }
```

#### After
```astro
        {
          validHeadings.length > 0 && (
            <nav class="lg:hidden my-8 p-5 bg-light/50 border border-border rounded-2xl">
              <small class="block mb-3 font-semibold text-text-dark font-primary text-[10px] uppercase tracking-wider">
                Quick Navigation
              </small>
              <ul class="space-y-1">
                {validHeadings.map((heading) => (
                  <li>
                    <a
                      href={`#${heading.slug}`}
                      class="toc-link group bg-body"
                    >
                      <span class="font-medium">{heading.text}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="toc-link-icon opacity-100! translate-x-0!"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2.5"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )
        }
```

#### Before (Desktop Aside TOC section around line 75)
```astro
      {
        validHeadings.length > 0 && (
          <aside class="bg-body rounded-2xl p-4 shrink-0 max-w-62 lg:sticky top-30 hidden lg:block">
            <nav>
              <small class="font-semibold text-text-dark font-primary text-sm">
                Table of Contents
              </small>
              <ul>
                {validHeadings.map((heading) => (
                  <li>
                    <a
                      href={`#${heading.slug}`}
                      class="block py-2 px-2 text-xs hover:bg-light rounded"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )
      }
```

#### After
```astro
      {
        validHeadings.length > 0 && (
          <aside class="bg-body rounded-2xl p-6 shrink-0 max-w-62 lg:sticky top-30 hidden lg:block border border-border/50 shadow-sm">
            <nav>
              <small class="block mb-4 font-semibold text-text-dark font-primary text-[10px] uppercase tracking-wider">
                In this article
              </small>
              <div class="toc-desktop-container">
                <div class="toc-desktop-line" />
                <ul class="space-y-1">
                  {validHeadings.map((heading) => (
                    <li>
                      <a
                        href={`#${heading.slug}`}
                        class="toc-desktop-link"
                      >
                        {heading.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </aside>
        )
      }
```

#### Reasoning
- The mobile TOC is now a distinct "Quick Navigation" module with clear clickable rows and explicit icons. Higher contrast backgrounds make it stand out as an interactive element.
- The desktop TOC uses a "stepper" style line that connects the items, indicating a progression through the content.
- Uses standard SVG icons for robustness and speed.

## Validation Plan
1. **Desktop Check**: Open a blog post and verify that fragment links correctly smooth-scroll to the target heading.
2. **Mobile Check**: Shrink the viewport to mobile width and verify the "Quick Navigation" card appears. Verify that items have sufficient touch targets and clear visual indicators.
3. **Hover Verify**: Check the active/hover states in both desktop and mobile views.

## Risk Notes
- **Offset Issues**: Standard smooth scroll can sometimes scroll too far or not enough if fixed headers exist. However, `.content` already has `prose-headings:scroll-mt-28` in `components.css`, which should handle the offset correctly.

## Approval
Status: Awaiting explicit user approval. Do not implement yet.
