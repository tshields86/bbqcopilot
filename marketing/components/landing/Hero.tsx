'use client';

import { ArrowRight, Flame } from 'lucide-react';

export function Hero() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.bbqcopilot.com';

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-char-900 via-char-800 to-char-800" />

      {/* Subtle glow effect */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-ember-500/10 rounded-full blur-[120px]" />

      <div className="relative max-container section-padding text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-char-700/50 border border-char-500/30 mb-8">
          <Flame className="w-4 h-4 text-ember-500" />
          <span className="text-sm text-char-300">AI-Powered BBQ Planning</span>
        </div>

        {/* Main headline */}
        <h1 className="font-display text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-ash-white mb-6 leading-tight">
          Your AI Pitmaster,{' '}
          <span className="gradient-text">Tailored to Your Grill</span>
        </h1>

        {/* Subheadline */}
        <p className="text-xl md:text-2xl text-char-300 max-w-3xl mx-auto mb-10 leading-relaxed">
          Stop searching for generic recipes. Get personalized BBQ recipes optimized
          for <span className="text-ash-white font-medium">YOUR</span> equipment,
          skill level, and time constraints.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={appUrl}
            className="btn-primary group text-lg px-8 py-4"
          >
            Start Cooking Free
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <a href="#how-it-works" className="btn-secondary text-lg px-8 py-4">
            See How It Works
          </a>
        </div>

        {/* Social proof */}
        <div className="mt-16 pt-8 border-t border-char-700/50">
          <p className="text-char-400 text-sm mb-4">Works with your favorite grills</p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-char-500">
            <span className="font-medium">Kamado Joe</span>
            <span className="text-char-600">•</span>
            <span className="font-medium">Weber</span>
            <span className="text-char-600">•</span>
            <span className="font-medium">Traeger</span>
            <span className="text-char-600">•</span>
            <span className="font-medium">Big Green Egg</span>
            <span className="text-char-600">•</span>
            <span className="font-medium">Offset Smokers</span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-char-500 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-char-500 rounded-full" />
        </div>
      </div>
    </section>
  );
}
