# Executive Gap Plan: GOO-2

| Field | Value | Evidence / Citation |
|---|---|---|
| Objective | Integrate PostHog Analytics | Ticket GOO-2: "Determine how to integrate PostHog Analytics (PLAN ONLY)" - Description: "determine exactly who to hire and why" |
| Area of Analysis | Analytics Infrastructure | Project: Maryland Insights (Astro + Vue + Tailwind) - src/config/config.json |
| KPI | PostHog integration complete | No PostHog found - grep search returned 0 results for "posthog" in codebase |
| Current State | Apollo Tracker only (app_id: 69dd10de52e7900011719d54) | src/config/config.json:42-45 - "apollo_tracker": { "enable": true, "app_id": "69dd10de52e7900011719d54" } |
| Target State | PostHog with custom events, feature flags, session recording | Ticket GOO-2: requires PostHog integration - no implementation exists |
| Gap | PostHog not integrated (0 of 1 analytics platforms) | Current: Apollo only - Target: PostHog - Gap: 100% |
| Root Cause | No analytics engineer with PostHog experience | Comment: "determine exactly who to hire" - implies current team lacks capability |
| Required Capability | Frontend Engineer - Analytics Specialization | PostHog SDK requires: Astro/Vue integration, event tracking, feature flags |
| Current Capability | No analytics engineer | No evidence of analytics-specific roles in staff - only general engineering |
| Recommended Action | Hire Frontend Engineer to implement PostHog | Ticket: "determine exactly who to hire and why" - identifies need for hire |
| Recommended Hire | Frontend Engineer - Analytics Specialist | Per delegation policy: specialized role required |

## New Hire Scope

| Field | Value | Evidence / Citation |
|---|---|---|
| Role Title | Frontend Engineer - Analytics Specialist | Per delegation policy: "All recommended hires should be specialized roles" |
| Scope | PostHog SDK integration in Astro/Vue, custom event tracking, feature flags, A/B testing, session recording, analytics dashboard | PostHog docs: requires JS SDK with custom events + feature flags API |
| Expected Deliverables | 1. PostHog SDK installed and configured 2. Custom events for key user actions 3. Feature flags for experiments 4. Dashboard with core metrics | Ticket: "determine exactly who to hire and why" - requires specific implementation plan |