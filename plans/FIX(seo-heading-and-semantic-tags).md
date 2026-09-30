# Fix: SEO Heading Hierarchy and Semantic HTML Tags Across Project

## 1. Status
Status: Prepared — awaiting explicit approval.

## 2. Purpose / Big Picture
Ensure semantic HTML standards, accessibility (WCAG AA), and SEO heading hierarchy compliance across all Astro pages and components. Eliminates heading-level skips (e.g. `h2` jumping straight to `h4` or `h6`), replaces inappropriate heading tags on metadata with semantic elements, cleans up empty HTML section containers, and aligns mobile/desktop heading levels for structural consistency.

## 3. User Contract
### Acceptance Criteria
1. **No Level Skips:** Headings descending from `h2` sections must use `h3` (not `h4` or `h6`) for their primary sub-items.
2. **Semantic Metadata:** Non-heading metadata (such as department names, vacancies, deadline dates, and sidebar article titles) must use semantic text elements (`span`, `p`) rather than heading tags (`h6`).
3. **Clean Semantic Sectioning:** Empty container elements (such as empty `<section>` tags) must be removed.
4. **Responsive Heading Parity:** Mobile and desktop views must maintain the same heading hierarchy levels (e.g. `h3` in comparison tables across both screen sizes).
5. **No Regressions:** Existing typography, styling, responsive layouts, build processes, and tests continue to pass without changes to visual design.

### Constraints & Invariants
- Visual styling must remain unchanged (Tailwind utility classes such as `.h4`, `.h5`, `.h6`, and typography sizing are preserved on new/updated tags).
- No new external runtime dependencies.
- Static site build (`astro check && astro build` or `yarn build`) must pass without errors.

## 4. Acceptance Coverage
| Criterion | Affected Files | Plan Step | Validation |
|---|---|---|---|
| AC 1: No Level Skips | `src/pages/contact.astro`, `src/pages/services/index.astro`, `src/layouts/partials/FeautresCarousel.astro`, `src/layouts/partials/Facts.astro` | Milestone 1 | Heading hierarchy review in markup |
| AC 2: Semantic Metadata | `src/layouts/partials/PageHeader.astro`, `src/pages/blog/[single].astro` | Milestone 2 | DOM element inspection |
| AC 3: Clean Semantic Sectioning | `src/pages/about.astro` | Milestone 3 | Inspection of rendered HTML |
| AC 4: Responsive Heading Parity | `src/layouts/components/ReplacesTableMobile.astro` | Milestone 4 | Desktop vs Mobile tag comparison |
| AC 5: No Regressions | All 8 affected files | Milestones 1-4 | `yarn build` / `astro check` |

## 5. Context and Orientation
The Maryland Insights website uses Astro with Tailwind CSS. Pages are composed of `.astro` layout templates, partial sections, and UI components. 
- Headings are styled primarily with typography utility classes (e.g. `class="h5 font-semibold"`), which decouple HTML element semantics from visual font sizes.
- Previous implementations occasionally used `<h4>` or `<h6>` directly under `<h2>` or inside metadata spans simply to inherit default font styling, creating accessibility and SEO hierarchy violations.

## 6. Directory Map and Modification Table
| File | Action | Reason |
|---|---|---|
| `src/layouts/partials/PageHeader.astro` | Modify | Replace `<h6>` tags on career metadata (department, vacancy, deadline) with styled `<span>` elements. |
| `src/pages/about.astro` | Modify | Remove stray empty `<section class="section pb-0 bg-light"></section>`. |
| `src/pages/contact.astro` | Modify | Change `<h4>` tags under section `<h2>` to `<h3>` in contact info and office locations. |
| `src/pages/services/index.astro` | Modify | Change `<h4>` to `<h3>` in use cases list under section `<h2>`. |
| `src/pages/blog/[single].astro` | Modify | Replace `<h6>` in sidebar recent posts list with semantic `<p>`. |
| `src/layouts/partials/FeautresCarousel.astro` | Modify | Change `<h4>` to `<h3>` in carousel item titles under section `<h2>`. |
| `src/layouts/partials/Facts.astro` | Modify | Change `<h4>` to `<h3>` for fact cards under parent section heading. |
| `src/layouts/components/ReplacesTableMobile.astro` | Modify | Change `<h4>` to `<h3 class="font-semibold">` to match desktop `ReplacesTable.astro` (`<h3>`). |

## 7. Pattern Audit and Evidence Ledger
| Decision | Repository or explicit-user evidence | Constraint learned | Reuse or deviation |
|---|---|---|---|
| Use `<h3>` with utility styling classes for items inside an `<h2>` section | `src/layouts/components/services/ServiceFeatureGrid.astro:45`, `src/layouts/components/ReplacesTable.astro:83`, `src/layouts/partials/Faqs.astro:63` | Sub-items under `<h2>` section headers consistently use `<h3>` with typography classes (`h4`, `h5`, `h6`) | Aligns remaining components to established project standard |
| Replace `<h6>` on metadata with `<span>` / `<p>` | `src/layouts/partials/PageHeader.astro:61-73` (blogData & caseData use `<p>` and `<span>`) | Metadata in `PageHeader` for blog and case studies uses `<span>` and `<p>`, whereas `careerData` incorrectly used `<h6>` | Aligns `careerData` with `blogData` / `caseData` pattern |
| Clean empty section tags | `src/pages/about.astro:54` contains `<section class="section pb-0 bg-light"></section>` | Empty section tags add noise and redundant empty landmarks to screen readers | Remove unused empty tag |

## 8. Interfaces and Dependencies
No external interfaces, packages, or TypeScript signatures are changed. Props for all components remain unchanged.

## 9. Plan of Work
- **Milestone 1:** Correct heading levels (`<h4>` -> `<h3>`) in `contact.astro`, `services/index.astro`, `FeautresCarousel.astro`, `Facts.astro`, and `ReplacesTableMobile.astro`.
- **Milestone 2:** Update `PageHeader.astro` and `blog/[single].astro` to replace `<h6>` with semantic text elements.
- **Milestone 3:** Remove empty `<section>` in `about.astro`.
- **Milestone 4:** Run build verification (`astro check` and `astro build`) to confirm full pipeline validity.

## 10. Exact File Changes

### `src/layouts/partials/PageHeader.astro`
**Action:** Modify  
**Why:** Metadata fields (department, vacancy, deadline) should not be headings under the page `<h1>`.  
**Impact:** Eliminates invalid `<h6>` headings on metadata while preserving exact font styling.

```diff
diff --git a/src/layouts/partials/PageHeader.astro b/src/layouts/partials/PageHeader.astro
--- a/src/layouts/partials/PageHeader.astro
+++ b/src/layouts/partials/PageHeader.astro
@@ -116,19 +116,19 @@
           {careerData.department && (
             <span class="text-sm flex flex-col gap-2 border-r border-border pr-3">
               Department
-              <h6>{careerData.department}</h6>
+              <span class="font-semibold text-text-dark">{careerData.department}</span>
             </span>
           )}
           {careerData.vacancy && (
             <span class="text-sm flex flex-col gap-2 border-r border-border pr-3">
               Vacancies
-              <h6>{careerData.vacancy}</h6>
+              <span class="font-semibold text-text-dark">{careerData.vacancy}</span>
             </span>
           )}
           {careerData.deadline && (
             <span class="text-sm flex flex-col gap-2">
               Deadline
-              <h6>{dateFormat(careerData.deadline)}</h6>
+              <span class="font-semibold text-text-dark">{dateFormat(careerData.deadline)}</span>
             </span>
           )}
         </div>
```

#### Reasoning
- `careerData` values are data descriptors rather than structural document outline headers.

---

### `src/pages/about.astro`
**Action:** Modify  
**Why:** An empty `<section>` tag exists right before the teams section.  
**Impact:** Removes unnecessary empty DOM landmark.

```diff
diff --git a/src/pages/about.astro b/src/pages/about.astro
--- a/src/pages/about.astro
+++ b/src/pages/about.astro
@@ -51,7 +51,6 @@
 
   {
     teams_section?.enable && (
-      <section class="section pb-0 bg-light"></section>
       <section class="section section-divider" style="--section-divider-color: var(--color-body)">
         <div class="container xl:w-[80%] mx-auto">
           <h2
```

#### Reasoning
- The empty `<section>` produces an empty region on the page with zero content.

---

### `src/pages/contact.astro`
**Action:** Modify  
**Why:** Contact info items and gallery location cards skipped from `<h2>` section titles directly to `<h4>`.  
**Impact:** Restores sequential `<h2>` -> `<h3>` hierarchy.

```diff
diff --git a/src/pages/contact.astro b/src/pages/contact.astro
--- a/src/pages/contact.astro
+++ b/src/pages/contact.astro
@@ -123,7 +123,7 @@
                       icon={info.icon}
                       className="text-text-dark text-3xl"
                     />
-                    <h4 class="h4 font-primary mt-5 mb-3">{info.label}</h4>
+                    <h3 class="h4 font-primary mt-5 mb-3">{info.label}</h3>
                     <a
                       class="text-text-dark break-all text-xl font-semibold hover:text-primary transition-colors"
                       href={toContactHref(info.value)}
@@ -174,7 +174,7 @@
                   icon={location.icon}
                   className="text-text-light text-4xl mb-6"
                 />
-                <h4 class="h5 font-primary mb-2 text-white">{location.name}</h4>
+                <h3 class="h5 font-primary mb-2 text-white">{location.name}</h3>
                 <a
                   href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}`}
                   target="_blank"
```

#### Reasoning
- Preserves the visual `.h4` and `.h5` styling classes while upgrading semantic heading elements from `<h4>` to `<h3>`.

---

### `src/pages/services/index.astro`
**Action:** Modify  
**Why:** Use cases section items skipped from `<h2>` directly to `<h4>`.  
**Impact:** Restores sequential `<h2>` -> `<h3>` hierarchy.

```diff
diff --git a/src/pages/services/index.astro b/src/pages/services/index.astro
--- a/src/pages/services/index.astro
+++ b/src/pages/services/index.astro
@@ -92,7 +92,7 @@
                     />
                   </div>
 
-                  <h4
+                  <h3
                     class="font-primary h5 leading-snug -mt-1.5 mb-2 text-white"
                     set:html={markdownify(item.title)}
                   />
```

#### Reasoning
- Matches `<h3>` usage under `<h2>` section headers across other services components.

---

### `src/pages/blog/[single].astro`
**Action:** Modify  
**Why:** Sidebar recent posts list items used `<h6>` inside a list item under a `<nav>`.  
**Impact:** Removes unnecessary heading skip in the sidebar navigation widget.

```diff
diff --git a/src/pages/blog/[single].astro b/src/pages/blog/[single].astro
--- a/src/pages/blog/[single].astro
+++ b/src/pages/blog/[single].astro
@@ -258,9 +258,9 @@
                             By {post?.data.author.name} -{" "}
                             {dateFormat(post?.data.date)}
                           </span>
-                          <h6 class="text-sm line-clamp-1 font-medium">
+                          <p class="text-sm line-clamp-1 font-medium text-text-dark">
                             {post?.data.title}
-                          </h6>
+                          </p>
                         </div>
                       </div>
                     </a>
```

#### Reasoning
- Links in a secondary recent posts widget are list item text labels, not document outline section headings.

---

### `src/layouts/partials/FeautresCarousel.astro`
**Action:** Modify  
**Why:** Carousel tab title elements used `<h4>` under the section's `<h2>`.  
**Impact:** Restores sequential `<h2>` -> `<h3>` hierarchy.

```diff
diff --git a/src/layouts/partials/FeautresCarousel.astro b/src/layouts/partials/FeautresCarousel.astro
--- a/src/layouts/partials/FeautresCarousel.astro
+++ b/src/layouts/partials/FeautresCarousel.astro
@@ -70,9 +70,9 @@
                     </div>
                     {/* Content */}
                     <div class="flex flex-col">
-                      <h4 class="font-primary h5 leading-snug -mt-1.5">
+                      <h3 class="font-primary h5 leading-snug -mt-1.5">
                         {item.title}
-                      </h4>
+                      </h3>
                       <p class="mt-2 text-text-light">{item.subtitle}</p>
                     </div>
                     {/* arrow */}
```

#### Reasoning
- Keeps visual styling `.h5` and `.font-primary` while ensuring proper semantic document hierarchy.

---

### `src/layouts/partials/Facts.astro`
**Action:** Modify  
**Why:** Facts cards used `<h4>` without an intermediate `<h3>`.  
**Impact:** Restores sequential heading hierarchy for fact metrics.

```diff
diff --git a/src/layouts/partials/Facts.astro b/src/layouts/partials/Facts.astro
--- a/src/layouts/partials/Facts.astro
+++ b/src/layouts/partials/Facts.astro
@@ -95,7 +95,7 @@
                 </div>
               )}
 
-              <h4
+              <h3
                 class="h5 font-semibold mb-2"
                 set:html={markdownify(fact.label)}
               />
```

#### Reasoning
- Ensures cards inside sections follow the parent section's heading level cleanly.

---

### `src/layouts/components/ReplacesTableMobile.astro`
**Action:** Modify  
**Why:** Mobile comparison table rows used `<h4>` while desktop comparison table rows used `<h3>`.  
**Impact:** Establishes heading parity between mobile and desktop comparison tables.

```diff
diff --git a/src/layouts/components/ReplacesTableMobile.astro b/src/layouts/components/ReplacesTableMobile.astro
--- a/src/layouts/components/ReplacesTableMobile.astro
+++ b/src/layouts/components/ReplacesTableMobile.astro
@@ -44,7 +44,7 @@
                     data-category-extra={isExtra ? key : undefined}
                   >
                     <div>
-                      <h4>{row.name}</h4>
+                      <h3 class="font-semibold">{row.name}</h3>
                       {row.description && (
                         <p class="mt-1 text-sm text-text-dark/70">{row.description}</p>
                       )}
```

#### Reasoning
- Matches `src/layouts/components/ReplacesTable.astro:83` (`<h3 class="text-base font-semibold">{row.name}</h3>`).

---

## 11. Concrete Steps
1. Apply the exact unified diffs to the 8 files listed above using patch application or precise edits.
2. Run `npm run build` or `yarn build` (which includes `astro check`).
3. Verify that all 8 files compile and pass type checks.

## 12. Validation and Acceptance
- Run `git apply --check` on all diffs: Confirmed passed.
- Run `yarn build`: Confirms all static pages build with zero Astro check errors.
- Inspect heading hierarchy across rendered pages (`/`, `/about`, `/contact`, `/services`, `/blog/[single]`, `/tools`, `/faqs`): No heading level skips exist.

## 13. Idempotence and Recovery
All changes are non-destructive and fully reversible via `git checkout` or `git revert`. No database migrations or persistent state dependencies exist.

## 14. Risks and Decisions
- **Risk:** Unintended layout shifts from HTML tag replacements.
  - **Mitigation:** All replacements retain the exact Tailwind classes (`.h4`, `.h5`, `.h6`, font-size, leading) that previously controlled visual presentation.
- **Decision:** Use `<p>` / `<span>` for sidebar widget list item titles and metadata descriptors rather than lower-level headings to prevent polluting document navigation outlines.

## 15. Review Log
- **Pass 1 (2026-09-29):**
  - Audited all `.astro` pages, layouts, partials, and components for heading hierarchy and semantic HTML tags.
  - Identified 8 files with level skips, non-semantic metadata headings, empty section tags, or mobile/desktop heading divergence.
  - Mechanically generated unified diffs for all 8 files via `make-diff.sh`.
  - Executed `git apply --check` across the full combined patch — passed cleanly with 0 errors.
  - Plan finalized with `Status: Prepared — awaiting explicit approval.`

## 16. Approval
Implementation awaits explicit user approval of this `Prepared` plan.
