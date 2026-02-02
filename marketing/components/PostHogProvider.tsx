'use client';

import posthog from 'posthog-js';
import { PostHogProvider as PHProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
        person_profiles: 'identified_only',
        capture_pageview: true,
        capture_pageleave: true,
        // Cross-subdomain tracking - use persistence 'cookie' for cross-domain support
        persistence: 'cookie',
      } as Parameters<typeof posthog.init>[1]);

      // Set cookie domain after init for cross-subdomain tracking
      if (window.location.hostname.endsWith('bbqcopilot.com')) {
        document.cookie = `ph_opt_in_out=1; domain=.bbqcopilot.com; path=/; SameSite=Lax; Secure`;
      }
    }
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
