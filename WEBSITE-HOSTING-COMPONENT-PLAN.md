# Website Hosting Component Plan

## Purpose

Build the Website Hosting service page as a reusable, typed Astro content system. The page must support rich, evidence-backed sections without duplicating page markup, inventing performance or trust claims, or introducing a visual pattern that conflicts with the existing Maryland Insights site.

This document is a planning artifact. It does not authorize deployment or publication of unsupported proof, author, uptime, backup, or service-area claims.

## Verified repository context

- `src/pages/services/[single].astro` is the shared route for service pages. It currently renders `PageHeader`, an optional image, Markdown content, `Faqs`, and `CallToAction`.
- `src/types/pages.collection.ts` currently defines the `services` collection with `schema: z.any()`.
- `src/content/services/website-hosting.md` currently contains basic metadata and a short Key Benefits section.
- `src/layouts/partials/Faqs.astro` already provides the reusable FAQ accordion.
- `src/layouts/Base.astro` owns the shared JSON-LD graph and `src/lib/seo/JsonLd.astro` serializes it safely.
- `src/layouts/partials/PageHeader.astro` is the existing generic page hero and remains the default service header.
- `src/components/ImageMod.astro` is the existing image component and should be reused for author and proof images.
- `schema-dts` is already a project dependency.
- Service pages are statically generated through `getStaticPaths()` and `getSinglePage("services")`.

## User contract

1. Website Hosting gets a clear H1 and introduction explaining managed hosting, Maryland businesses/agencies, and Astro static generation.
2. The page explains Astro static output, Docker-based deployment, Node 22 Alpine, and Sharp image optimization using only confirmed facts.
3. The page presents a four-step deployment and update process.
4. Proof, author, uptime, backup, migration, pricing, and county claims render only when real source data exists.
5. FAQs render through the existing FAQ component and emit valid `FAQPage` JSON-LD.
6. The service schema describes a hosting service, not a generic `SoftwareApplication`.
7. New components reuse existing project styles, tokens, spacing, typography, responsive breakpoints, image handling, and interaction patterns.
8. The design avoids repeated generic cards, decorative gradients without meaning, fake metrics, oversized marketing claims, and AI-generated filler copy.
9. Existing service pages without structured blocks continue to build and render.
10. The static build remains the final deployment artifact.

## Explicit unknowns and content gates

These values must remain absent until supplied by the owner:

- A real PageSpeed Insights before/after case with a source URL or evidence.
- A real author name, role, photo, biography, and LinkedIn/GitHub profile.
- Actual backup frequency, retention, rollback policy, uptime policy, and outage response.
- Actual migration downtime expectations.
- Exact counties served, using the county wording already present elsewhere in the repository.
- Which services are included and which cost extra.

The schema must reject incomplete proof and author blocks rather than render partial records.

## Proposed content contract

Replace the `services` collection's `z.any()` schema with a typed schema that preserves current fields and adds optional `blocks` and `faqs_list` fields.

The `blocks` array is a discriminated union with these types:

- `richText`: `eyebrow?`, `title`, `body`, and optional tone.
- `featureGrid`: `eyebrow?`, `title`, and typed items with `title`, `description`, and optional icon.
- `process`: `eyebrow?`, `title`, and ordered steps with number, title, and description.
- `proof`: complete before/after values, metric label, context, source label, and source URL.
- `author`: complete name, role, bio, image, and profile URL.
- `serviceArea`: title, intro, and a list of verified counties.
- `trust`: title, backup policy, uptime policy, migration policy, included items, and extra-cost items.

The existing FAQ shape remains a typed optional array of question/answer objects.

## Reusable components

Create these components under `src/layouts/components/services/`:

- `ServiceRichText.astro`
- `ServiceFeatureGrid.astro`
- `ServiceProcess.astro`
- `ServiceProof.astro`
- `ServiceAuthor.astro`
- `ServiceArea.astro`
- `ServiceTrust.astro`
- `ServiceBlocks.astro`

`ServiceBlocks.astro` is the only dispatcher. Each block component receives validated data and owns layout only; copy and claims remain in the content document.

Design requirements:

- Use the existing `container`, `section`, `section-sm`, border, surface, typography, button, and responsive utility classes.
- Reuse `ImageMod.astro`; do not add another image pipeline.
- Use an editorial two-column composition for explanatory content where the existing layout supports it.
- Use a restrained grid for feature items, with hierarchy created by size and spacing rather than a wall of identical cards.
- Use a numbered process sequence for the four deployment steps.
- Make proof, author, service-area, and trust sections visibly source-oriented and compact.
- Use the existing FAQ accordion rather than creating a second accordion implementation.
- Do not add a new visual language, design-token system, icon library, animation package, or component framework.

## Service route and schema work

Update `src/pages/services/[single].astro` to:

1. Read the typed service data.
2. Render the current hero and Markdown body unchanged for compatibility.
3. Render `ServiceBlocks` when blocks exist.
4. Render the existing `Faqs` component when FAQs exist.
5. Keep `CallToAction` unchanged.
6. Replace the hard-coded `SoftwareApplication` schema with a typed `Service` schema.
7. Add `FAQPage` only when FAQ data exists.
8. Add `Person` only when a complete author block exists.
9. Include `areaServed` only when verified county data exists.
10. Avoid price, uptime, proof, review, or author values that are not present in content.

Add `src/lib/seo/serviceSchema.ts` only if the route-level schema construction becomes difficult to test or reuse. It should use the existing canonical and organization ID helpers rather than creating a second ID convention.

## Website Hosting content

Update `src/content/services/website-hosting.md` with these verified sections:

- H1: `Website Hosting Built for Speed, Not Just Storage`.
- Intro describing managed hosting and infrastructure behind each site, Maryland businesses/agencies, and Astro static generation.
- Platform experience explaining static output, Docker deployment, Node 22 Alpine, and Sharp image optimization.
- Process steps: static build, container deployment, image optimization, and pipeline-based updates.
- A service-area block only after exact counties are confirmed.
- A trust block only after actual backup, uptime, migration, and pricing policies are supplied.
- FAQs about outages, rollback, migration downtime, and included versus extra-cost services.
- No proof block until the real PageSpeed case exists.
- No author block until the real person and profile data exist.

## Acceptance coverage

| Requirement | Source of implementation | Proof |
|---|---|---|
| Typed rich content | `src/types/pages.collection.ts` | `astro check` accepts valid and rejects incomplete block data |
| Shared rendering | `src/pages/services/[single].astro`, `ServiceBlocks.astro` | Website Hosting and existing services render without duplicated route markup |
| Existing design system | `src/layouts/components/services/*`, existing CSS utilities | Desktop/mobile render review shows existing tokens and spacing |
| FAQ schema | service route and existing `Faqs.astro` | Rendered JSON-LD contains matching `FAQPage` questions and answers |
| Service schema | route or `src/lib/seo/serviceSchema.ts` | Rendered JSON-LD contains `Service`, provider, and verified area only |
| Honest evidence gates | typed proof, author, trust, and area blocks | Missing real inputs produce no empty or fabricated sections |
| Static output | Astro build | `yarn build` completes and generated service HTML contains expected sections |

## Plan of work

1. Define and validate the typed service block schema while preserving existing service frontmatter.
2. Implement the reusable block components using existing project styling and no new dependencies.
3. Connect the block dispatcher, service schema, and conditional FAQ/author/area output to the shared service route.
4. Populate Website Hosting with verified platform and process content, leaving blocked evidence sections unpublished.
5. Add rendered-output checks and run the static build.

## Verification commands

Run from `/Users/dev/Projects/maryland-insights`:

```sh
yarn check
yarn build
```

Inspect the generated Website Hosting page and verify:

- all block layouts render at desktop and mobile widths;
- no page-wide horizontal overflow is introduced;
- existing service pages still render;
- `Service` JSON-LD is present;
- FAQ JSON-LD matches visible FAQ content;
- incomplete proof, author, policy, and county blocks do not render;
- no unsupported metrics or SLA values appear in the final HTML.

## Scope cuts

- No new CMS, database, runtime API, or client-side state system.
- No new design system or component framework.
- No generic “trust badge” component.
- No invented PageSpeed results, uptime percentages, author identity, policy, or county list.
- No changes to unrelated homepage, pricing, tracking, or branding work already present in the worktree.

## Review log

### 2026-09-26 — Scaffolded

- Inspected the service route, services collection, Website Hosting content, FAQ partial, Base layout, JSON-LD serializer, existing image component, and package manifest.
- Confirmed that service data is currently untyped and the route emits `SoftwareApplication` schema.
- Recorded the existing styling and component boundaries that the implementation must reuse.
- Recorded the real content gaps instead of filling them with assumptions.

Status: Scaffolded — review required.

## Approval

Implementation must wait for explicit approval of this plan and for the owner to supply or confirm the real proof, author, policy, and service-area values required for publication.
