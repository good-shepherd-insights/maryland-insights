import posthog from 'posthog-js';
import trackingConfig from '@/config/tracking.json';

export function initPostHog(): void {
  // Prevent SDK execution during Astro SSG/SSR phases
  if (typeof window !== 'undefined') {
    const config = trackingConfig.tracking.posthog;
    // Vite injects meta.env, we use it directly.
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
