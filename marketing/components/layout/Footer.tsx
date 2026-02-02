'use client';

import Link from 'next/link';
import { Flame } from 'lucide-react';
import { usePostHog } from 'posthog-js/react';

export function Footer() {
  const posthog = usePostHog();
  const currentYear = new Date().getFullYear();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.bbqcopilot.com';

  const handleNavClick = (destination: string) => {
    posthog?.capture('nav_clicked', {
      destination,
      location: 'footer',
    });
  };

  return (
    <footer className="bg-char-900 border-t border-char-700">
      <div className="max-container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-ember-500 to-copper rounded-lg flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <span className="font-display text-2xl font-bold text-ash-white">
                BBQ<span className="text-ember-500">Copilot</span>
              </span>
            </Link>
            <p className="text-char-400 max-w-md">
              Your AI pitmaster, tailored to your grill. Get personalized BBQ recipes
              optimized for your specific equipment, skill level, and time constraints.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-display text-lg font-semibold text-ash-white mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#features"
                  className="text-char-400 hover:text-ash-white transition-colors"
                  onClick={() => handleNavClick('features')}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#how-it-works"
                  className="text-char-400 hover:text-ash-white transition-colors"
                  onClick={() => handleNavClick('how_it_works')}
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href={appUrl}
                  className="text-char-400 hover:text-ash-white transition-colors"
                  onClick={() => handleNavClick('open_app')}
                >
                  Open App
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-char-700 flex items-center justify-center">
          <p className="text-char-500 text-sm">
            &copy; {currentYear} BBQCopilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
