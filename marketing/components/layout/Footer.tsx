import Link from 'next/link';
import { Flame, Github, Twitter } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://app.bbqcopilot.com';

  return (
    <footer className="bg-char-900 border-t border-char-700">
      <div className="max-container section-padding">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
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
                <a href="#features" className="text-char-400 hover:text-ash-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-char-400 hover:text-ash-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href={appUrl} className="text-char-400 hover:text-ash-white transition-colors">
                  Open App
                </a>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-display text-lg font-semibold text-ash-white mb-4">
              Connect
            </h3>
            <div className="flex gap-4">
              <a
                href="https://twitter.com/bbqcopilot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-char-700 hover:bg-char-600 flex items-center justify-center text-char-400 hover:text-ash-white transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://github.com/bbqcopilot"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-char-700 hover:bg-char-600 flex items-center justify-center text-char-400 hover:text-ash-white transition-all"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-char-700 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-char-500 text-sm">
            &copy; {currentYear} BBQCopilot. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-char-500 hover:text-ash-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-char-500 hover:text-ash-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
