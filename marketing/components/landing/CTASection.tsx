'use client';

import { ArrowRight, Apple, Smartphone } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

export function CTASection() {
  const posthog = usePostHog();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.bbqcopilot.com';

  const handleCtaClick = (button: string) => {
    posthog?.capture('cta_clicked', {
      button,
      location: 'cta_section',
    });
  };

  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-char-900 via-char-800 to-char-900" />

      {/* Ember glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-ember-500/20 rounded-full blur-[100px]" />

      <div className="relative max-container section-padding text-center">
        {/* Main content */}
        <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-ash-white mb-6">
          Ready to Level Up Your BBQ Game?
        </h2>
        <p className="text-xl text-char-300 max-w-2xl mx-auto mb-10">
          Join pitmasters who&apos;ve discovered the power of AI-assisted cook planning. Your
          perfect brisket is just a few clicks away.
        </p>

        {/* Primary CTA */}
        <a
          href={appUrl}
          className="btn-primary inline-flex text-lg px-10 py-4 mb-12 group w-full sm:w-auto justify-center"
          onClick={() => handleCtaClick('start_cooking_free')}
        >
          Start Cooking Free
          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </a>

        {/* App store badges */}
        <div className="pt-8 border-t border-char-700/50">
          <p className="text-char-500 text-sm mb-6">Mobile apps coming soon</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {/* iOS Badge */}
            <div className="flex items-center justify-center gap-3 px-6 py-3 bg-char-700/50 rounded-lg border border-char-600/30 opacity-60 cursor-not-allowed w-60 sm:w-auto">
              <Apple className="w-8 h-8 text-char-400" />
              <div className="text-left">
                <p className="text-xs text-char-500">Coming Soon on</p>
                <p className="text-sm font-semibold text-char-300">App Store</p>
              </div>
            </div>

            {/* Android Badge */}
            <div className="flex items-center justify-center gap-3 px-6 py-3 bg-char-700/50 rounded-lg border border-char-600/30 opacity-60 cursor-not-allowed w-60 sm:w-auto">
              <Smartphone className="w-8 h-8 text-char-400" />
              <div className="text-left">
                <p className="text-xs text-char-500">Coming Soon on</p>
                <p className="text-sm font-semibold text-char-300">Google Play</p>
              </div>
            </div>

            {/* Web Badge */}
            <a
              href={appUrl}
              className="flex items-center justify-center gap-3 px-6 py-3 bg-ember-500/10 rounded-lg border border-ember-500/30 hover:bg-ember-500/20 transition-colors w-60 sm:w-auto"
              onClick={() => handleCtaClick('web_app_badge')}
            >
              <div className="w-8 h-8 rounded-lg bg-ember-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <div className="text-left">
                <p className="text-xs text-ember-400">Try Now on</p>
                <p className="text-sm font-semibold text-ash-white">Web App</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
