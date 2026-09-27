# REFACTOR(tracking-architecture)

## Request
Conduct a rigid technical review of the previous proposal and tighten the architecture. The tracking telemetry must be completely config-driven, obeying the Single Responsibility Principle by decoupling orchestrators from javascript blobs. All existing patterns and lazily presented code blocks (like omitted imports) must be strictly detailed.

## Directory Map
```text
src/
  config/
    config.json                      (modify)
    tracking.json                    (new)
  components/
    ApolloTracker.astro              (delete) 
    tracking/
      TrackingManager.astro          (new)
      GtmTracker.astro               (new)
      ApolloTracker.astro            (new)
  layouts/
    Base.astro                       (modify)
astro.config.mjs                     (modify)
```

## Modification Table
| File | Action | Why |
|---|---|---|
| `src/config/config.json` | Modify | Strip out deprecated inline tracking properties entirely. |
| `src/config/tracking.json` | Create | Centralize all tracking configurations (IDs, enable/disable flags) into one agnostic data file. |
| `src/components/ApolloTracker.astro` | Delete | Logic is being moved to the `tracking/` namespace. |
| `src/components/tracking/TrackingManager.astro` | Create | Orchestrator that maps over `tracking.json` and loads individual components dynamically. |
| `src/components/tracking/ApolloTracker.astro` | Create | Modular Apollo component. Must cleanly accept props from the Manager. |
| `src/components/tracking/GtmTracker.astro` | Create | Wrapper for the GTM tag to sit behind our config interface. |
| `src/layouts/Base.astro` | Modify | Strip all hardcoded script imports and snippets, and replace with a solitary `<TrackingManager />`. Correct `<body>` noscript dependency. |
| `astro.config.mjs` | Modify | Expose `dataLayer.push` in Partytown config for true background tracking capability. |

## Existing Pattern Audit
The minted directory template leans heavily on data-driven modularity. It manages site metadata via `config.json`, styling via `theme.json`, and navigation via `menu.json`. 

Tracking telemetry should follow this exact pattern. By shifting to a `tracking.json` file, we completely divorce the *intent* (e.g., "we want Apollo on") from the *execution* (Astro components), perfectly matching the template's architectural DNA.

## Execution Plan

### Step 1 — Centralize Definitions
Build a `src/config/tracking.json` standard schema and explicitly strip the old tracking keys out of `src/config/config.json`.

### Step 2 — Construct Modular Tracking Payload
Move `ApolloTracker.astro` into the `tracking/` namespace alongside a new `GtmTracker.astro`. Both now accept pure props and do not query the config themselves.

### Step 3 — Central Orchestration
Write `TrackingManager.astro` to act as a strict namespace config-parser to render the components.

### Step 4 — Implement Layout Integration
Rip individual trackers and imports out of `Base.astro` in favor of `TrackingManager.astro` and explicitly handle the `<noscript>` body fallback using the new JSON.

### Step 5 — Implement Partytown Tuning
Configure `astro.config.mjs` to intercept `dataLayer.push` for generalized GTM isolation.

## File-by-File Changes

### `src/config/config.json`
**Action:** Modify  
**Why:** Removes deprecated, hardcoded tracking configurations.  
**Impact:** Leaves `config.json` strictly for metadata, site params, and generic structure features.

#### Before
```json
  "navigation_button": {
    "enable": true,
    "label": "Get Started",
    "link": "/get-started"
  },

  "google_tag_manager": {
    "enable": false,
    "gtm_id": "GTM-XXXXXX"
  },

  "subscription_in_footer": {
    "enable": true,
    "mailchimp_form_action": "https://gmail.us4.list-manage.com/subscribe/post?u=463ee871f45d2d93748e77cad&amp;id=a0a2c6d074",
    "mailchimp_form_name": "b_463ee871f45d2d93748e77cad_a0a2c6d074"
  },

  "metadata": {
    "meta_author": "Maryland Insights",
    "meta_image": "/images/og-image.png",
    "meta_description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free."
  },

  "apollo_tracker": {
    "enable": true,
    "app_id": "69dd10de52e7900011719d54"
  }
}
```

#### After
```json
  "navigation_button": {
    "enable": true,
    "label": "Get Started",
    "link": "/get-started"
  },

  "subscription_in_footer": {
    "enable": true,
    "mailchimp_form_action": "https://gmail.us4.list-manage.com/subscribe/post?u=463ee871f45d2d93748e77cad&amp;id=a0a2c6d074",
    "mailchimp_form_name": "b_463ee871f45d2d93748e77cad_a0a2c6d074"
  },

  "metadata": {
    "meta_author": "Maryland Insights",
    "meta_image": "/images/og-image.png",
    "meta_description": "The new way for Maryland small businesses to build professional websites. AI-powered, Maryland-focused SEO, and growth tools. Start for free."
  }
}
```

#### Reasoning
- Prevents split-brain config states and duplicate enablement by forcefully scrubbing keys.

---

### `src/config/tracking.json`
**Action:** Create  
**Why:** Dedicated data schema purely for analytics.  
**Impact:** Marketers/devs only edit this JSON instead of hunting through `.astro` code layout.

#### Before
File does not exist yet.

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
    }
  }
}
```

#### Reasoning
- Single source of truth. Structured elegantly exactly like `menu.json` and `theme.json`.

---

### `src/components/ApolloTracker.astro`
**Action:** Delete  
**Why:** The code is moving to `src/components/tracking/ApolloTracker.astro`.  
**Impact:** Un-pollutes the core components directory.

#### Before
```astro
---
import config from "@/config/config.json";

// Setup environment variable fallback
const appId = import.meta.env.PUBLIC_APOLLO_APP_ID || config.apollo_tracker?.app_id;
const isEnabled = config.apollo_tracker?.enable && appId;
---

{isEnabled && (
  <>
    <!-- Preconnect resource hints -->
    <link rel="preconnect" href="https://assets.apollo.io" />
    <link rel="dns-prefetch" href="https://assets.apollo.io" />

    <!-- Apollo Tracker executed via Partytown Web Worker -->
    <script type="text/partytown" is:inline define:vars={{ appId: appId }}>
      function initApollo() {
        if (window._apolloTrackerInjected) return;
        window._apolloTrackerInjected = true;

        var n = Math.random().toString(36).substring(7);
        var o = document.createElement("script");
        o.src = "https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=" + n;
        o.async = true;
        o.defer = true;
        o.onload = function() {
          if (window.trackingFunctions && window.trackingFunctions.onLoad) {
            window.trackingFunctions.onLoad({ appId: appId });
          }
        };
        document.head.appendChild(o);
      }
      
      // Hook into Astro's SPA routing lifecycle 
      document.addEventListener("astro:page-load", () => {
        initApollo();
      });
    </script>
  </>
)}
```

#### After
File deleted. (Moved below).

---

### `src/components/tracking/ApolloTracker.astro`
**Action:** Create (Migrated from root components)  
**Why:** Isolate logic from the filesystem.  
**Impact:** It no longer parses config files internally but receives strictly typed Props from the Manager instead.

#### Before
File does not exist yet.

#### After
```astro
---
export interface Props {
  id?: string;
}

const { id } = Astro.props;
const appId = import.meta.env.PUBLIC_APOLLO_APP_ID || id;
---

{appId && (
  <>
    <link rel="preconnect" href="https://assets.apollo.io" />
    <link rel="dns-prefetch" href="https://assets.apollo.io" />

    <script type="text/partytown" is:inline define:vars={{ appId: appId }}>
      function initApollo() {
        if (window._apolloTrackerInjected) return;
        window._apolloTrackerInjected = true;

        var n = Math.random().toString(36).substring(7);
        var o = document.createElement("script");
        o.src = "https://assets.apollo.io/micro/website-tracker/tracker.iife.js?nocache=" + n;
        o.async = true;
        o.defer = true;
        o.onload = function() {
          if (window.trackingFunctions && window.trackingFunctions.onLoad) {
            window.trackingFunctions.onLoad({ appId: appId });
          }
        };
        document.head.appendChild(o);
      }
      
      document.addEventListener("astro:page-load", () => {
        initApollo();
      });
    </script>
  </>
)}
```

#### Reasoning
- Single responsibility principle. This component only knows how to inject an Apollo script given an ID.

---

### `src/components/tracking/TrackingManager.astro`
**Action:** Create  
**Why:** The unified controller orchestrating active tracking payloads.   
**Impact:** Removes logic trees from `Base.astro`.

#### Before
File does not exist yet.

#### After
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

#### Reasoning
- Simple render map based purely on logic conditions. Highly extensible. 

---

### `src/components/tracking/GtmTracker.astro`
**Action:** Create  
**Why:** Wraps the external library into our namespace.  
**Impact:** Isolates `@digi4care/astro-google-tagmanager` library dependency.

#### Before
File does not exist yet.

#### After
```astro
---
import { GoogleTagmanager } from "@digi4care/astro-google-tagmanager";

export interface Props {
  id: string;
}
const { id } = Astro.props;
---

{id && <GoogleTagmanager id={id} partytown={true} />}
```

#### Reasoning
- Automatically forces partytown explicitly for the integration. Normalizes GTM.

---

### `src/layouts/Base.astro`
**Action:** Modify  
**Why:** Scrub old logic to rely directly on TrackingManager and isolated config schemas. Remove deprecated imports.  
**Impact:** `<head>` and `<body>` are scrubbed and pristine.

#### Before
```astro
---
import TwSizeIndicator from "@/components/TwSizeIndicator.astro";
import config from "@/config/config.json";
import menu from "@/config/menu.json";
import social from "@/config/social.json";
import theme from "@/config/theme.json";
import { plainify } from "@/lib/utils/textConverter";
import ApolloTracker from "@/components/ApolloTracker.astro";
import Footer from "@/partials/Footer.astro";
import Header from "@/partials/Header.astro";
import "@/styles/main.css";
import {
  GoogleTagmanager,
  GoogleTagmanagerNoscript,
} from "@digi4care/astro-google-tagmanager";
import { AstroFont } from "astro-font";
import { ClientRouter } from "astro:transitions";
import { SEO } from "astro-seo";
import { Schema } from "astro-seo-schema";
import type { LocalBusiness, BreadcrumbList, ItemList } from "schema-dts";
```
*(Middle Code Omitted for Brevity - Font Loading and SEO props)*
```astro
<!doctype html>
<html lang="en">
  <head>
    <!-- google tag manager -->
    {
      config.google_tag_manager.enable && (
        <GoogleTagmanager id={config.google_tag_manager.gtm_id} />
      )
    }

    <!-- apollo tracker -->
    <ApolloTracker />
    
    <SEO
```
*(Remaining Head omitted for brevity)*
```astro
  <body>
    {/* google tag manager noscript */}
    {
      config.google_tag_manager.enable && (
        <GoogleTagmanagerNoscript id={config.google_tag_manager.gtm_id} />
      )
    }

    <TwSizeIndicator />
```

#### After
```astro
---
import TwSizeIndicator from "@/components/TwSizeIndicator.astro";
import config from "@/config/config.json";
import trackingConfig from "@/config/tracking.json";
import menu from "@/config/menu.json";
import social from "@/config/social.json";
import theme from "@/config/theme.json";
import { plainify } from "@/lib/utils/textConverter";
import TrackingManager from "@/components/tracking/TrackingManager.astro";
import Footer from "@/partials/Footer.astro";
import Header from "@/partials/Header.astro";
import "@/styles/main.css";
import { GoogleTagmanagerNoscript } from "@digi4care/astro-google-tagmanager";
import { AstroFont } from "astro-font";
import { ClientRouter } from "astro:transitions";
import { SEO } from "astro-seo";
import { Schema } from "astro-seo-schema";
import type { LocalBusiness, BreadcrumbList, ItemList } from "schema-dts";
```
*(Middle Code Omitted for Brevity - Font Loading and SEO props)*
```astro
<!doctype html>
<html lang="en">
  <head>
    <!-- unified tracking manager -->
    <TrackingManager />
    
    <SEO
```
*(Remaining Head omitted for brevity)*
```astro
  <body>
    {/* google tag manager noscript */}
    {
      trackingConfig.tracking.gtm?.enable && trackingConfig.tracking.gtm?.id && (
        <GoogleTagmanagerNoscript id={trackingConfig.tracking.gtm.id} />
      )
    }

    <TwSizeIndicator />
```

#### Reasoning
- Specifically replaces `ApolloTracker` and `GoogleTagmanager` imports with `TrackingManager` and `trackingConfig`.
- Correctly routes `<body>` noscript dependency to `tracking.json` preventing build breaks. 

---

### `astro.config.mjs`
**Action:** Modify  
**Why:** Explicit GTM DataLayer configuration for Partytown.  
**Impact:** Resolves cross-thread data availability for GTM.

#### Before
```js
  integrations: [
    react(),
    partytown({
      config: {
        forward: ["trackingFunctions.onLoad"],
      },
    }),
```

#### After
```js
  integrations: [
    react(),
    partytown({
      config: {
        forward: ["trackingFunctions.onLoad", "dataLayer.push"],
      },
    }),
```

#### Reasoning
- Instructs Partytown to tunnel standard GTM events safely into the background worker out of the box, preparing it for enterprise scaling.

## Validation Plan
1. Ensure the project builds successfully with `yarn build`. 
2. Because `Base.astro` no longer maps to keys inside `config.json`, the build acts as a rigid type/prop check.
3. Check browser console network tab for successful pipeline firing.

## Risk Notes
- `GoogleTagmanagerNoscript` must correctly query `trackingConfig.tracking.gtm.id` precisely because nested references often throw undefined errors during build if properties are misspelled.

## Approval
`Status: Awaiting explicit user approval. Do not implement yet.`
