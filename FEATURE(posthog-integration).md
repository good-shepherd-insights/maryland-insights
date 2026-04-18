# FEATURE(posthog-integration)

## Request
Cleanly integrate PostHog Analytics using `posthog-js` in a strictly modular, extensible way. This integration must abandon lazy, hardcoded `<head>` injections and instead strictly adhere to the project's config-driven `TrackingManager` architecture defined in `REFACTOR(tracking-architecture).md`. The setup must export a singleton `posthog` instance to support custom events and feature flags elegantly across any client components.

## Directory Map
```text
src/
  lib/
    analytics/
      posthog.ts                         (new)
  components/
    tracking/
      PostHogTracker.astro               (new)
      TrackingManager.astro              (modify)
  config/
    tracking.json                        (modify)
package.json                             (modify)
```

## Modification Table
| File | Action | Why |
|---|---|---|
| `package.json` | Modify | Install the `posthog-js` SDK to enable typed, modular client-side telemetry (custom events, feature flags) rather than relying on brittle window variables. |
| `src/config/tracking.json` | Modify | Append `posthog` settings to the centralized tracking schema, isolating enablement flags and API keys from the broader site configuration. |
| `src/lib/analytics/posthog.ts` | Create | Encapsulate SDK setup behind a singleton. Explicitly handles Astro SSR constraints (`typeof window`) and securely checks environment keys. |
| `src/components/tracking/PostHogTracker.astro` | Create | The modular visual injection component that safely loads the singleton on the client and binds the navigation `$pageview` telemetry to Astro's `astro:page-load` lifecycle. |
| `src/components/tracking/TrackingManager.astro` | Modify | Orchestrate the new `PostHogTracker` strictly based on the boolean enablement flag inside `tracking.json`. |

## Existing Pattern Audit
- The project's telemetry architecture relies on a centralized `src/config/tracking.json` and a `TrackingManager.astro` orchestrator (per the `tracking-architecture` protocol).
- Hardcoded tracker dumps inside `src/layouts/Base.astro` are considered anti-patterns.
- We must provide a `posthog-js` based strategy so client-side developers can easily `import { posthog } from '@/lib/analytics/posthog'` for events without manually checking for hydration context.

## Execution Plan

### Step 1 — Add Dependency
Add `posthog-js` directly to `package.json` dependencies.

### Step 2 — Configuration Integration
Inject a `posthog` object into `src/config/tracking.json` (alongside `gtm` and `apollo`).

### Step 3 — Build the Singleton Logic
Create `src/lib/analytics/posthog.ts` for safe SDK initialisation and SSR mitigation.

### Step 4 — Build the Modular Tracker Component
Create `src/components/tracking/PostHogTracker.astro` to hook into the Astro view transition lifecycle natively.

### Step 5 — Embed into the Orchestrator
Add `PostHogTracker` to `src/components/tracking/TrackingManager.astro` so the tracking layer controls its delivery, completely avoiding `Base.astro`.

## File-by-File Changes

### `package.json`
**Action:** Modify  
**Why:** Provide the official SDK for downstream client components.  
**Impact:** `posthog-js` is bundled safely for browser contexts.

#### Before
```json
  "dependencies": {
    "@astrojs/check": "0.9.6",
    "@astrojs/mdx": "4.3.13",
    "@astrojs/partytown": "^2.1.6",
    "@astrojs/react": "4.4.2",
    "@astrojs/sitemap": "3.6.0",
    "@digi4care/astro-google-tagmanager": "^1.6.0",
    "@justinribeiro/lite-youtube": "^1.9.0",
    "aos": "^2.3.4",
    "astro": "5.16.6",
    "astro-auto-import": "^0.5.1",
    "astro-font": "^1.1.0",
    "astro-seo": "^1.1.0",
    "astro-seo-schema": "^5.0.0",
    "astro-swiper": "^1.4.0",
    "date-fns": "^4.1.0",
    "github-slugger": "^2.0.0",
    "gray-matter": "^4.0.3",
    "lenis": "^1.3.17",
    "marked": "^17.0.1",
    "node-emoji": "^2.2.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-icons": "^5.5.0",
    "remark-collapse": "^0.1.2",
    "remark-toc": "^9.0.0",
    "schema-dts": "^1.1.0",
    "sharp": "^0.34.5",
    "shufflejs": "^6.1.2",
    "vite": "^7.3.0"
  },
```

#### After
```json
  "dependencies": {
    "@astrojs/check": "0.9.6",
    "@astrojs/mdx": "4.3.13",
    "@astrojs/partytown": "^2.1.6",
    "@astrojs/react": "4.4.2",
    "@astrojs/sitemap": "3.6.0",
    "@digi4care/astro-google-tagmanager": "^1.6.0",
    "@justinribeiro/lite-youtube": "^1.9.0",
    "aos": "^2.3.4",
    "astro": "5.16.6",
    "astro-auto-import": "^0.5.1",
    "astro-font": "^1.1.0",
    "astro-seo": "^1.1.0",
    "astro-seo-schema": "^5.0.0",
    "astro-swiper": "^1.4.0",
    "date-fns": "^4.1.0",
    "github-slugger": "^2.0.0",
    "gray-matter": "^4.0.3",
    "lenis": "^1.3.17",
    "marked": "^17.0.1",
    "node-emoji": "^2.2.0",
    "posthog-js": "^1.115.0",
    "react": "^19.2.3",
    "react-dom": "^19.2.3",
    "react-icons": "^5.5.0",
    "remark-collapse": "^0.1.2",
    "remark-toc": "^9.0.0",
    "schema-dts": "^1.1.0",
    "sharp": "^0.34.5",
    "shufflejs": "^6.1.2",
    "vite": "^7.3.0"
  },
```

#### Reasoning
- Lexical order structure maintained strictly. 

### `src/config/tracking.json`
**Action:** Modify  
**Why:** Add the `posthog` node natively into the tracking data tree rather than `config.json`.  
**Impact:** Preserves the Single Responsibility architecture where all analytics live in one configuration object.

#### Before
```json
{
  "tracking": {
    "gtm": {
      "enable": true,
      "id": "GTM-XXXXXX"
    },
    "apollo": {
      "enable": true,
      "app_id": "69dd10de52e7900011719d54"
    }
  }
}
```

#### After
```json
{
  "tracking": {
    "gtm": {
      "enable": true,
      "id": "GTM-XXXXXX"
    },
    "apollo": {
      "enable": true,
      "app_id": "69dd10de52e7900011719d54"
    },
    "posthog": {
      "enable": false,
      "api_key": "YOUR_POSTHOG_API_KEY",
      "api_host": "https://us.i.posthog.com"
    }
  }
}
```

#### Reasoning
- This aligns directly with the architectural target of `REFACTOR(tracking-architecture).md`. 

### `src/lib/analytics/posthog.ts`
**Action:** Create  
**Why:** Isolates PostHog's initialization and `window` logic into one clean module that isn't hardcoded into an Astro component.  
**Impact:** Exposes a safe, typed instance of PostHog to the entire application.

#### Before
```text
File does not exist yet.
```

#### After
```ts
import posthog from 'posthog-js';
import trackingConfig from '@/config/tracking.json';

export function initPostHog(): void {
  // Prevent SDK execution during Astro SSG/SSR phases
  if (typeof window !== 'undefined') {
    const config = trackingConfig.tracking.posthog;
    const apiKey = import.meta.env.PUBLIC_POSTHOG_API_KEY || config?.api_key;
    const apiHost = import.meta.env.PUBLIC_POSTHOG_API_HOST || config?.api_host;

    if (config?.enable && apiKey && apiKey !== 'YOUR_POSTHOG_API_KEY') {
      posthog.init(apiKey, {
        api_host: apiHost,
        person_profiles: 'identified_only',
        capture_pageview: false // We capture manually during Astro's view transitions
      });
    }
  }
}

export { posthog };
```

#### Reasoning
- Hard failsafes against executing with dummy keys.
- SSG safety via `typeof window`.
- Reads specifically from the orchestrator's `tracking.json`.

### `src/components/tracking/PostHogTracker.astro`
**Action:** Create  
**Why:** Represents the PostHog module inside the Tracking Orchestrator.  
**Impact:** Encapsulates the execution hook natively inside Astro's renderer.

#### Before
```text
File does not exist yet.
```

#### After
```astro
---
---

<script>
  import { initPostHog, posthog } from '@/lib/analytics/posthog';
  
  // Safely initialize the singleton on the client
  initPostHog();

  // Hook telemetry capture into Astro's SPA lifecycle flawlessly
  document.addEventListener('astro:page-load', () => {
    posthog.capture('$pageview');
  });
</script>
```

#### Reasoning
- Clean script loading, free from clutter or inline-script variable hacks.

### `src/components/tracking/TrackingManager.astro`
**Action:** Modify  
**Why:** Make the TrackingManager aware of PostHog.  
**Impact:** This completes the integration, entirely avoiding `Base.astro` manipulation.

#### Before
```astro
---
import trackerData from "@/config/tracking.json";
import ApolloTracker from "./ApolloTracker.astro";
import GtmTracker from "./GtmTracker.astro";

const config = trackerData.tracking;
---

{config.gtm?.enable && <GtmTracker id={config.gtm.id} />}
{config.apollo?.enable && <ApolloTracker id={config.apollo.app_id} />}
```

#### After
```astro
---
import trackerData from "@/config/tracking.json";
import ApolloTracker from "./ApolloTracker.astro";
import GtmTracker from "./GtmTracker.astro";
import PostHogTracker from "./PostHogTracker.astro";

const config = trackerData.tracking;
---

{config.gtm?.enable && <GtmTracker id={config.gtm.id} />}
{config.apollo?.enable && <ApolloTracker id={config.apollo.app_id} />}
{config.posthog?.enable && <PostHogTracker />}
```

#### Reasoning
- Follows the Open-Closed Principle strictly. Only injecting lines specifically for the new orchestrator toggle.

## Validation Plan
1. Validate that `REFACTOR(tracking-architecture).md` has been applied first if `TrackingManager.astro` does not exist locally.
2. Ensure `yarn dev` yields a successful build.
3. Once enabled via `.env` and `tracking.json`, click through the SPA navigation and monitor the network requests to verify `$pageview` emits correctly without duplication.

## Risk Notes
- If `tracking.json` is missing or the project is in a liminal state pre-refactor, this plan will require sequence resolution. 
- Astro's client bundling handles the `posthog-js` import perfectly, but large analytics dependencies can slow the initial hydration metric. We accept this strictly typed paradigm over Partytown injection to ensure deep telemetry across the component tree.

## Approval
`Status: Awaiting explicit user approval. Do not implement yet.`
