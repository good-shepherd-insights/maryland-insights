# Refactor: Remove Redundant Guidance Boilerplate from Integrations and Contact Pages

## 1. Status
Status: Prepared — awaiting explicit approval.

## 2. Purpose / Big Picture
Remove the bulky, repetitive "Guidance" filler sections (`IntegrationsGuidance.astro` and `ContactGuidance.astro`) from the Integrations (`/integrations`) and Contact (`/contact`) pages. These components added ~100 lines of generic LLM-generated cards ("01 Identify the gap", "01 Share the context", etc.) directly above the main directory grid and contact forms, pushing functional page content below the fold. Removing them restores high-converting, clean, and direct page hierarchy.

## 3. User Contract
### Acceptance Criteria
1. **Remove Clutter on `/integrations`:** The Integrations page transitions directly from `PageHeader` into the interactive integrations directory grid (`<Integrations />`) and Call-to-Action.
2. **Remove Clutter on `/contact`:** The Contact page transitions directly from `PageHeader` into the contact form and office details section.
3. **Delete Dead Code:** Unreferenced partials `IntegrationsGuidance.astro` and `ContactGuidance.astro` are removed from `src/layouts/partials/`.
4. **Fix Heading Hierarchy on Contact Page:** Ensure sub-items in contact info and location cards use `<h3>` instead of `<h4>` under section `<h2>`.
5. **No Regressions:** Static site build (`astro check && astro build`) passes with 0 errors.

### Constraints & Invariants
- Zero visual breakage on surrounding sections.
- All styles and tokens remain aligned with the existing design system.
- Build and type-checking pass without warnings or errors.

## 4. Acceptance Coverage
| Criterion | Affected Files | Plan Step | Validation |
|---|---|---|---|
| AC 1: Clean `/integrations` | `src/pages/integrations.astro` | Milestone 1 | Visual & DOM inspection |
| AC 2: Clean `/contact` | `src/pages/contact.astro` | Milestone 2 | Visual & DOM inspection |
| AC 3: Delete Unused Partials | `src/layouts/partials/IntegrationsGuidance.astro`, `src/layouts/partials/ContactGuidance.astro` | Milestone 3 | Check no orphan files |
| AC 4: Heading Hierarchy on Contact | `src/pages/contact.astro` | Milestone 2 | HTML heading sequence check |
| AC 5: Build Integrity | All affected files | Milestone 4 | `yarn build` |

## 5. Context and Orientation
- `src/pages/integrations.astro` previously imported `<IntegrationsGuidance />` between `<PageHeader />` and `<Integrations />`.
- `src/pages/contact.astro` previously imported `<ContactGuidance />` between `<PageHeader />` and the contact form section.
- These components contained verbose 3-step cards and lists that duplicated page header descriptions and created friction for visitors trying to browse integrations or send inquiries.

## 6. Directory Map and Modification Table
| File | Action | Reason |
|---|---|---|
| `src/pages/integrations.astro` | Modify | Remove `IntegrationsGuidance` import and JSX element. |
| `src/layouts/partials/IntegrationsGuidance.astro` | Delete | Dead code cleanup (-49 LOC). |
| `src/pages/contact.astro` | Modify | Remove `ContactGuidance` import and JSX element, and normalize heading tags (`<h4>` -> `<h3>`). |
| `src/layouts/partials/ContactGuidance.astro` | Delete | Dead code cleanup (-47 LOC). |

## 7. Pattern Audit and Evidence Ledger
| Decision | Repository or explicit-user evidence | Constraint learned | Reuse or deviation |
|---|---|---|---|
| Delete guidance partials | User explicit instruction: "clean up the component IntegrationsGuidance... and similarly on Contact page" | Components are only imported in those two pages; no other consumer exists | Direct deletion of unused partials |
| Direct page flow: PageHeader -> Main Content -> CTA | `src/pages/tools.astro`, `src/pages/services/index.astro`, `src/pages/blog/index.astro` | Standard site layout pattern transitions directly from `PageHeader` to core content | Aligns `/integrations` and `/contact` to project convention |

## 8. Interfaces and Dependencies
No schemas, props, or exports are broken. Imports of the deleted components in `src/pages/integrations.astro` and `src/pages/contact.astro` are removed cleanly.

## 9. Plan of Work
- **Milestone 1:** Modify `src/pages/integrations.astro` to remove `IntegrationsGuidance`.
- **Milestone 2:** Delete `src/layouts/partials/IntegrationsGuidance.astro`.
- **Milestone 3:** Modify `src/pages/contact.astro` to remove `ContactGuidance` and update sub-headings to `<h3>`.
- **Milestone 4:** Delete `src/layouts/partials/ContactGuidance.astro`.
- **Milestone 5:** Validate build with `astro check && yarn build`.

## 10. Exact File Changes

### `src/pages/integrations.astro`
**Action:** Modify  
**Why:** Remove redundant guidance section from the integrations directory page.  
**Impact:** Restores immediate visibility to the integrations grid.

```diff
diff --git a/src/pages/integrations.astro b/src/pages/integrations.astro
--- a/src/pages/integrations.astro
+++ b/src/pages/integrations.astro
@@ -4,7 +4,6 @@
 import CallToAction from "@/partials/CallToAction.astro";
 import PageHeader from "@/partials/PageHeader.astro";
 import Integrations from "@/partials/Integrations.astro";
-import IntegrationsGuidance from "@/partials/IntegrationsGuidance.astro";
 import type { CollectionPage } from "schema-dts";
 import config from "@/config/config.json";
 
@@ -30,8 +29,6 @@
     description={pageIndex.data.description}
   />
 
-  <IntegrationsGuidance />
-
   <Integrations />
 
   <CallToAction />
```

#### Reasoning
- Direct layout matches `src/pages/tools.astro` and focuses on the integration tools.

---

### `src/layouts/partials/IntegrationsGuidance.astro`
**Action:** Delete  
**Why:** Component is no longer used anywhere in the codebase.  
**Impact:** Eliminates 49 lines of dead code.

```diff
diff --git a/src/layouts/partials/IntegrationsGuidance.astro b/src/layouts/partials/IntegrationsGuidance.astro
deleted file mode 100644
--- a/src/layouts/partials/IntegrationsGuidance.astro
+++ /dev/null
@@ -1,49 +0,0 @@
-<section class="section-sm bg-light border-y border-border/70">
-  <div class="container lg:w-[80%] xl:w-[70%] mx-auto">
-    <div class="grid gap-7.5 lg:grid-cols-2">
-      <div>
-        <p class="text-sm font-semibold text-text-light mb-4">Pick the integrations that fit the work</p>
-        <h2 class="mb-5 text-balance">A working integration stack is shaped by the kind of work your Maryland business actually runs, not by what every other site uses.</h2>
-        <p class="text-lg leading-relaxed mb-5 max-w-prose">
-          The integrations below are the ones Maryland agencies and service businesses reach for first. They cover the systems that take in leads, run conversations, take payment, and report on what worked.
-        </p>
-        <p class="leading-relaxed text-text-light max-w-prose">
-          Choose based on the work you need done this quarter, not a complete platform on day one.
-        </p>
-      </div>
-
-      <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
-        <div class="bg-body p-6 rounded-2xl card-shadow">
-          <span class="text-sm font-semibold text-primary">01</span>
-          <h3 class="h5 mt-2 mb-2">Identify the gap</h3>
-          <p>Pick the single integration that solves the most painful workflow. Forms with no CRM, or reporting with no analytics, are the usual starting points.</p>
-        </div>
-        <div class="bg-body p-6 rounded-2xl card-shadow">
-          <span class="text-sm font-semibold text-primary">02</span>
-          <h3 class="h5 mt-2 mb-2">Connect and verify</h3>
-          <p>Each connection is tested with a real submission or a sandbox account so leads, events, and payments land in the right place before you point real traffic at it.</p>
-        </div>
-        <div class="bg-body p-6 rounded-2xl card-shadow">
-          <span class="text-sm font-semibold text-primary">03</span>
-          <h3 class="h5 mt-2 mb-2">Add the next layer</h3>
-          <p>Once the first integration runs cleanly, add the next one that removes another manual step. Stack gradually rather than all at once.</p>
-        </div>
-      </div>
-    </div>
-
-    <div class="mt-7.5 bg-body p-8 lg:p-10 rounded-3xl card-shadow">
-      <h3 class="h4 mb-3">When you evaluate an integration</h3>
-      <p class="mb-6 max-w-3xl">
-        These are the checks that decide whether an integration earns a place in your stack. Run through them before turning it on for real traffic.
-      </p>
-      <div class="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
-        <span><strong class="block mb-1">Where the data lands</strong><small class="text-text-light">Which system owns it after the handoff</small></span>
-        <span><strong class="block mb-1">What it controls here</strong><small class="text-text-light">What actions it can trigger on your behalf</small></span>
-        <span><strong class="block mb-1">Who can see it</strong><small class="text-text-light">Team access, audit log, vendor visibility</small></span>
-        <span><strong class="block mb-1">Where you can break it</strong><small class="text-text-light">Rate limits, retry behavior, failure modes</small></span>
-        <span><strong class="block mb-1">What it costs to leave</strong><small class="text-text-light">Data export, contract terms, switching effort</small></span>
-        <span><strong class="block mb-1">When support answers</strong><small class="text-text-light">Response time, channels, escalation path</small></span>
-      </div>
-    </div>
-  </div>
-</section>
\ No newline at end of file
```

#### Reasoning
- Clean deletion of orphaned component file.

---

### `src/pages/contact.astro`
**Action:** Modify  
**Why:** Remove redundant guidance section before the form and fix heading hierarchy.  
**Impact:** Puts the contact form immediately in view; improves SEO heading hierarchy.

```diff
diff --git a/src/pages/contact.astro b/src/pages/contact.astro
--- a/src/pages/contact.astro
+++ b/src/pages/contact.astro
@@ -7,7 +7,6 @@
 import { markdownify } from "@/lib/utils/textConverter";
 import CallToAction from "@/partials/CallToAction.astro";
 import PageHeader from "@/partials/PageHeader.astro";
-import ContactGuidance from "@/partials/ContactGuidance.astro";
 import type { ContactPage } from "schema-dts";
 
 const pageIndex = await getListPage("contact", "-index");
@@ -52,7 +51,6 @@
 
 <Base {...pageIndex.data} schema={[contactSchema]}>
   <PageHeader title={title} description={description} />
-  <ContactGuidance />
   <section class="section-sm bg-light">
     <div class="container lg:w-[80%] xl:w-[70%] mx-auto">
       <h2
@@ -123,7 +121,7 @@
                       icon={info.icon}
                       className="text-text-dark text-3xl"
                     />
-                    <h4 class="h4 font-primary mt-5 mb-3">{info.label}</h4>
+                    <h3 class="h4 font-primary mt-5 mb-3">{info.label}</h3>
                     <a
                       class="text-text-dark break-all text-xl font-semibold hover:text-primary transition-colors"
                       href={toContactHref(info.value)}
@@ -174,7 +172,7 @@
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
- Increases conversion on the contact page by removing superfluous barriers before the form.

---

### `src/layouts/partials/ContactGuidance.astro`
**Action:** Delete  
**Why:** Component is no longer used anywhere in the codebase.  
**Impact:** Eliminates 47 lines of dead code.

```diff
diff --git a/src/layouts/partials/ContactGuidance.astro b/src/layouts/partials/ContactGuidance.astro
deleted file mode 100644
--- a/src/layouts/partials/ContactGuidance.astro
+++ /dev/null
@@ -1,47 +0,0 @@
-<section class="section-sm bg-light border-y border-border/70">
-  <div class="container lg:w-[80%] xl:w-[70%] mx-auto">
-    <div class="grid gap-7.5 lg:grid-cols-2">
-      <div>
-        <p class="text-sm font-semibold text-text-light mb-4">Start with the problem</p>
-        <h2 class="mb-5 text-balance">A useful first conversation begins before we recommend a service.</h2>
-        <p class="text-lg leading-relaxed mb-5 max-w-prose">
-          Maybe your website looks dated, your business is difficult to find in the communities you serve, or inquiries arrive without a clear source. Tell us what you can see from your side. We will use that context to understand the gap before suggesting what should change.
-        </p>
-        <p class="leading-relaxed text-text-light max-w-prose">
-          You do not need a finished brief, a list of competitors, or technical vocabulary. A plain-language description of the situation is a useful place to begin.
-        </p>
-      </div>
-
-      <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
-        <div class="bg-body p-6 rounded-2xl card-shadow">
-          <span class="text-sm font-semibold text-primary">01</span>
-          <h3 class="h5 mt-2 mb-2">Share the context</h3>
-          <p>Send your website if you have one, the services you provide, and the Maryland counties or communities you serve. Include the problem you notice most.</p>
-        </div>
-        <div class="bg-body p-6 rounded-2xl card-shadow">
-          <span class="text-sm font-semibold text-primary">02</span>
-          <h3 class="h5 mt-2 mb-2">We review the details</h3>
-          <p>We review the context you provide so the conversation starts with your actual website, market, service area, and customer journey—not a generic package.</p>
-        </div>
-        <div class="bg-body p-6 rounded-2xl card-shadow">
-          <span class="text-sm font-semibold text-primary">03</span>
-          <h3 class="h5 mt-2 mb-2">Choose the next step</h3>
-          <p>We help you identify the next sensible move, whether that is a focused fix, a clearer measurement plan, or a larger website, SEO, or automation project.</p>
-        </div>
-      </div>
-    </div>
-
-    <div class="mt-7.5 bg-body p-8 lg:p-10 rounded-3xl card-shadow">
-      <h3 class="h4 mb-3">Helpful information to include</h3>
-      <p class="mb-6 max-w-3xl">
-        These details help us make the first reply specific instead of sending a generic list of services. Include whatever you already know; none of it needs to be perfect.
-      </p>
-      <div class="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
-        <span><strong class="block mb-1">Website URL</strong><small class="text-text-light">If you already have one</small></span>
-        <span><strong class="block mb-1">Main services</strong><small class="text-text-light">What customers hire you to do</small></span>
-        <span><strong class="block mb-1">Service area</strong><small class="text-text-light">Counties, cities, or neighborhoods</small></span>
-        <span><strong class="block mb-1">Current challenge</strong><small class="text-text-light">What is not working today</small></span>
-      </div>
-    </div>
-  </div>
-</section>
```

#### Reasoning
- Clean deletion of orphaned component file.

---

## 11. Concrete Steps
1. Apply the exact unified diffs above.
2. Run `astro check` and `yarn build`.
3. Verify both `/integrations` and `/contact` render cleanly with zero errors.

## 12. Validation and Acceptance
- `git apply --check`: Verified cleanly.
- `yarn build`: Confirms build passes without missing module imports.

## 13. Idempotence and Recovery
Reversible via `git checkout` or `git revert`.

## 14. Risks and Decisions
- **Risk:** Loss of unique text copy from the guidance components.
  - **Mitigation:** The copy was generic filler ("01 Identify the gap", "01 Share the context") that added unnecessary friction and word count. Removing it streamlines user journey directly into functional actions.

## 15. Review Log
- **Pass 1 (2026-09-29):**
  - Generated exact diffs for `integrations.astro`, `IntegrationsGuidance.astro`, `contact.astro`, and `ContactGuidance.astro`.
  - Tested `git apply --check` across the full combined patch — passed cleanly.
  - Plan finalized with `Status: Prepared — awaiting explicit approval.`

## 16. Approval
Implementation awaits explicit user approval of this `Prepared` plan.
